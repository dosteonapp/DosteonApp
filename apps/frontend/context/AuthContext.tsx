"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
import { toast } from "sonner";
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authenticatingWithGoogle, setAuthenticatingWithGoogle] =
    React.useState<boolean>(false);
  const [authenticatingWithApple, setAuthenticatingWithApple] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (bypassAuth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Invalidate user query to trigger UI refresh on any auth change
      queryClient.invalidateQueries({ queryKey: ["user"] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, router]);

  const authenticateWithGoogle = async () => {
    setAuthenticatingWithGoogle(true);
    await authenticateWithOAuth("google");
    setAuthenticatingWithGoogle(false);
  };

  const authenticateWithApple = async () => {
    setAuthenticatingWithApple(true);
    await authenticateWithOAuth("apple");
    setAuthenticatingWithApple(false);
  };

  const [resetPasswordData, setResetPasswordData] = React.useState<{
    email?: string;
    selector?: string;
  } | null>(null);

  const sendMagicLink = async (email: string) => {
    if (bypassAuth) {
      toast.info("Magic links are disabled in bypass mode");
      return { success: true };
    }
    toast.error("Magic link not yet fully migrated to Firebase");
    return { success: false };
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
    
    let authProvider;
    if (provider === 'google') {
      authProvider = new GoogleAuthProvider();
    } else if (provider === 'apple') {
      authProvider = new OAuthProvider('apple.com');
      authProvider.addScope('email');
      authProvider.addScope('name');
    } else {
      throw new Error("Provider not yet implemented with Firebase");
    }

    try {
      const result = await signInWithPopup(auth, authProvider);
      
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error(`OAuth login failed for ${provider}`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      throw error;
    }
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
        return true;
      }

      const email = values.email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, email, values.password);

      // Flush stale user/profile cache so the dashboard loads fresh data.
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      router.push("/dashboard");
      return true;
    } catch (error: any) {
      // Provide user-friendly errors or keep it simple
      const errorMsg = error.message || "Failed to login";
      const needsVerification = errorMsg.toLowerCase().includes("verify your email");
      helpers.setStatus({ error: errorMsg, needsVerification });
      return false;
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

      const email = values.email.trim().toLowerCase();
      
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
      
      // Send verification email optionally
      await sendEmailVerification(userCredential.user);



      return { success: true, email: values.email };
    } catch (error: any) {
      helpers.setStatus({ error: error.message || "Failed to sign up" });
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
      
      await sendPasswordResetEmail(auth, values.email);
      
      return { success: true };
    } catch (error: any) {
      helpers.setStatus({ error: error.message || "Failed to send reset email" });
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
      
      const queryParams = new URLSearchParams(window.location.search);
      const oobCode = queryParams.get('oobCode');

      if (!oobCode) {
        throw new Error("Password reset link is invalid or expired.");
      }

      await confirmPasswordReset(auth, oobCode, values.password);

      // Sign out to force re-authentication
      await signOut(auth);

      queryClient.clear();
      toast.success("Password reset successfully. Please sign in again.");
      router.replace("/auth/restaurant/signin");
    } catch (error: any) {
      helpers.setStatus({ error: error.message || "Failed to reset password" });
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

      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
      }
      return { success: true };
    } catch (error) {
      throw error;
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
    authenticatingWithGoogle,
    authenticateWithGoogle,
    authenticatingWithApple,
    authenticateWithApple,
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
