"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  handleApiError,
  resetFormStatus,
  validateApiResponse,
} from "@/lib/utils";
import {
  AuthContextType,
  LoginValues,
  SignupValues,
  ForgotPasswordValues,
  ResetPasswordValues,
} from "@/types/auth";
import { FormikHelpers } from "formik";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [authenticatingWithGoogle, setAuthenticatingWithGoogle] =
    React.useState<boolean>(false);

  //   const googleLogin = useGoogleLogin({
  //     flow: "auth-code",
  //     scope: "openid email profile",
  //     onSuccess: async ({ code }) => {
  //       try {
  //         const { data } = await axiosInstance.post("/auth/google-signin", {
  //           code,
  //         });

  //         if (data.success) {
  //           const returnUrl = searchParams.get("returnUrl");
  //           window.location.href = returnUrl
  //             ? decodeURIComponent(returnUrl)
  //             : "/dashboard";
  //         } else {
  //           throw new Error(data.message || "Google login failed");
  //         }
  //       } catch (error) {
  //         console.error("Google login error:", error);
  //         toast.error(handleApiError(error).message || "Google login failed");
  //       } finally {
  //         setAuthenticatingWithGoogle(false);
  //       }
  //     },
  //     onError: (error) => {
  //       setAuthenticatingWithGoogle(false);
  //       console.error("Google login failed:", error);
  //       toast.error(error.error_description || "Google login failed");
  //     },
  //     onNonOAuthError: (error) => {
  //       setAuthenticatingWithGoogle(false);
  //       console.error("Google login non-OAuth error:", error);
  //       toast.error(error.type || "Google login failed");
  //     },
  //   });

  const authenticateWithGoogle = async () => {
    setAuthenticatingWithGoogle(true);
    // googleLogin();
  };

  const [resetPasswordData, setResetPasswordData] = React.useState<{
    email?: string;
    selector?: string;
  } | null>(null);

  const { mutateAsync: loginMutation } = useMutation({
    mutationFn: async (credentials: LoginValues) => {
      const { data } = await axiosInstance.post("/auth/signin", credentials);
      return validateApiResponse(data);
    },
  });

  const { mutateAsync: signupMutation } = useMutation({
    mutationFn: async (values: SignupValues) => {
      const { data } = await axiosInstance.post("/auth/signup", values);
      return validateApiResponse(data);
    },
  });

  const { mutateAsync: forgotPasswordMutation } = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email: values.email,
      });
      return validateApiResponse(data);
    },
  });

  const { mutateAsync: resetPasswordMutation } = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      const { data } = await axiosInstance.post("/auth/reset-password", {
        code: values.code,
        selector: resetPasswordData?.selector,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      return validateApiResponse(data);
    },
  });

  // Update verifyEmail to accept code
  const verifyEmail = async (email: string, code: string) => {
    const { data } = await axiosInstance.post("/auth/verify-email", { email, code });
    return validateApiResponse(data);
  };

  const login = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    try {
      resetFormStatus(helpers);
      await loginMutation(values);

      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });

      const returnUrl = searchParams.get("returnUrl");

      if (returnUrl) {
        window.location.href = decodeURIComponent(returnUrl);
      } else {
        // Redirect to root, the AppGuard will handle proper redirection based on user data
        window.location.href = "/";
      }
    } catch (error) {
      helpers.setStatus({ error: handleApiError(error).message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const signup = async (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>
  ) => {
    try {
      resetFormStatus(helpers);
      const response = await signupMutation(values);
      return { success: true, email: values.email }; // Return email for verification
    } catch (error) {
      helpers.setStatus({ error: handleApiError(error).message });
      return { success: false };
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const forgotPassword = async (
    values: ForgotPasswordValues,
    helpers: FormikHelpers<ForgotPasswordValues>
  ) => {
    try {
      resetFormStatus(helpers);
      const data = (await forgotPasswordMutation(values)) as {
        selector: string;
      };

      setResetPasswordData({ email: values.email, selector: data.selector });
      router.push("/auth/reset-password");
    } catch (error) {
      helpers.setStatus({ error: handleApiError(error).message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const resetPassword = async (
    values: ResetPasswordValues,
    helpers: FormikHelpers<ResetPasswordValues>
  ) => {
    try {
      resetFormStatus(helpers);
      await resetPasswordMutation(values);
      toast.success("Password has been reset successfully");
      router.push("/login");
    } catch (error) {
      helpers.setStatus({ error: handleApiError(error).message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const value = {
    login,
    signup,
    forgotPassword,
    resetPassword,
    resetPasswordData,
    setResetPasswordData,
    authenticatingWithGoogle,
    authenticateWithGoogle,
    verifyEmail, // Updated verifyEmail in context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
