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
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
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
      const { data } = await axiosInstance.post("auth/login", credentials);
      return data;
    },
  });

  const { mutateAsync: signupMutation } = useMutation({
    mutationFn: async (values: SignupValues) => {
      const { data } = await axiosInstance.post("auth/signup", {
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
      const { data } = await axiosInstance.post("auth/forgot-password", {
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
      
      const { data } = await axiosInstance.post("auth/reset-password", {
        access_token: session?.access_token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      return data;
    },
  });

  const { mutateAsync: resendVerificationMutation } = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosInstance.post("auth/resend-verification", { email });
      return data;
    },
  });

  const sendMagicLink = async (email: string) => {
    if (bypassAuth) {
      toast.info("Magic links are disabled in bypass mode");
      return { success: true };
    }

    try {
      await axiosInstance.post("auth/magic-link", { email });
      return { success: true };
    } catch (error) {
      const parsed = handleApiError(error);
      toast.error("Error sending magic link email", {
        description: parsed.message,
      });
      return { success: false };
    }
  };

  const authenticateWithOAuth = async (provider: 'google' | 'apple') => {
    if (bypassAuth) {
      // Simulate OAuth login
      localStorage.setItem('mock_user', JSON.stringify({
        email: `oauth-${provider}@example.com`,
        role: 'restaurant',
        id: `mock-oauth-id`,
        first_name: 'Social',
        last_name: 'User'
      }));
      router.push("/dashboard");
      return;
    }
    
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) return;

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
        
        // Save mock data to simulate session
        const role = window.location.pathname.includes('supplier') ? 'supplier' : 'restaurant';
        localStorage.setItem('mock_user', JSON.stringify({
          email: values.email,
          role: role,
          id: `mock-${role}-id`,
          first_name: values.email.split('@')[0],
          last_name: 'User'
        }));
        
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

  const resendVerification = async (email: string) => {
    try {
      if (bypassAuth) {
        toast.info("Email verification is disabled in bypass mode");
        return { success: true };
      }

      await resendVerificationMutation(email);
      toast.success("Verification email resent", {
        description: `We've sent a new verification link to ${email}.`,
      });
      return { success: true };
    } catch (error) {
      const handled = handleApiError(error);
      toast.error("Could not resend verification email", {
        description: handled.message,
      });
      return { success: false };
    }
  };

  const value = {
    login,
    signup,
    forgotPassword,
    resetPassword,
    resendVerification,
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
