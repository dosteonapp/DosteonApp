"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { bypassAuth } from "@/lib/flags";
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
  const queryClient = useQueryClient();
  const [authenticatingWithGoogle, setAuthenticatingWithGoogle] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (bypassAuth) return;
    
    const initAuth = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      try {
        const supabase = createClient();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          // Invalidate user query to trigger UI refresh
          queryClient.invalidateQueries({ queryKey: ["user"] });
          
          // Handle specific auth events if needed
          if (event === 'SIGNED_OUT') {
             router.push("/");
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Supabase initialization skipped:", err);
      }
    };

    initAuth();
  }, [queryClient, router]);

  const authenticateWithGoogle = async () => {
    setAuthenticatingWithGoogle(true);
    await authenticateWithOAuth("google");
  };

  const [resetPasswordData, setResetPasswordData] = React.useState<{
    email?: string;
    selector?: string;
  } | null>(null);

  const { mutateAsync: loginMutation } = useMutation({
    mutationFn: async (credentials: LoginValues) => {
      const { data } = await axiosInstance.post("/auth/login", credentials);
      return data;
    },
  });

  const { mutateAsync: signupMutation } = useMutation({
    mutationFn: async (values: SignupValues) => {
      const { data } = await axiosInstance.post("/auth/signup", {
        email: values.email,
        password: values.password,
        first_name: values.firstname,
        last_name: values.lastname,
        role: values.accountType
      });
      return data;
    },
  });

  const { mutateAsync: forgotPasswordMutation } = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email: values.email,
      });
      return data;
    },
  });

  const { mutateAsync: resetPasswordMutation } = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      // In a native flow, the user is authenticated via the code in the URL.
      // We need to pass the access_token from the current session.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data } = await axiosInstance.post("/auth/reset-password", {
        access_token: session?.access_token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      return data;
    },
  });

  const sendMagicLink = async (email: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) throw error;
    return { success: true };
  };

  const authenticateWithOAuth = async (provider: 'google' | 'apple') => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) throw error;
  };

  const login = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    try {
      resetFormStatus(helpers);
      
      if (bypassAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push("/dashboard");
        return;
      }

      const data = await loginMutation(values);

      // IMPORTANT: Set the session in the Supabase client.
      // This is the single source of truth for all future requests.
      if (data.access_token && data.refresh_token) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }

      router.push("/dashboard");
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

      if (bypassAuth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, email: values.email };
      }

      await signupMutation(values);
      return { success: true, email: values.email };
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
  ): Promise<{ success: boolean } | void> => {
    try {
      resetFormStatus(helpers);
      await forgotPasswordMutation(values);
      return { success: true };
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
      router.push("/");
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
    sendMagicLink,
    authenticateWithOAuth,
    authenticatingWithGoogle,
    authenticateWithGoogle,
    verifyEmail: async () => {}, // Deprecated in native flow
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
