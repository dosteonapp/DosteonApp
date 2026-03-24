"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail } from "lucide-react";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SigninValidationSchema, MagicSigninValidationSchema } from "@/schemas/auth";
import { LoginValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { EmailCheckScreen } from "@/components/auth/EmailCheckScreen";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendMagicLink, authenticateWithOAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now sign in.");
      // Remove the query param so the message is only shown once
      router.replace("/auth/restaurant/signin");
    }
  }, [router, searchParams]);


  const handleSubmit = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    try {
      if (loginMethod === 'magic') {
        if (!values.email) {
          helpers.setFieldError('email', 'Email is required');
          return;
        }
        await sendMagicLink(values.email);
        setMagicLinkSent(true);
      } else {
        setRedirecting(true);
        const success = await login(values, helpers);
        if (!success) {
          setRedirecting(false);
        }
      }
    } catch (err: any) {
      helpers.setStatus({ error: err.message || "Authentication failed" });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (magicLinkSent) {
    return (
      <EmailCheckScreen
        title="Check Your Email"
        description="We've sent a secure login link to your email. Please click the link to sign in to your restaurant dashboard."
        buttonText="Back to Login"
        onButtonClick={() => setMagicLinkSent(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 md:p-12 mx-auto transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="mb-6">
          <Image
            src="/images/logo-full.png"
            alt="Dosteon Logo"
            width={160}
            height={40}
            className="h-auto w-auto max-h-8"
          />
        </div>
        {loginMethod === 'magic' ? (
          <>
            <div className="w-16 h-16 rounded-xl border border-blue-100 flex items-center justify-center mb-4 bg-blue-50/30">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 text-center mt-1">
              Sign in as a Restaurant With Magic Link
            </h2>
            <p className="text-gray-500 text-center max-w-sm mt-2">
              Enter your email and we'll send you a secure link to sign in
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold font-heading text-gray-900 text-center mt-2">
              Sign In to Dosteon
            </h2>
            <p className="text-gray-500 text-center max-w-sm">
              Sign in to manage your restaurant and orders.
            </p>
          </>
        )}
      </div>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginMethod === "password" ? SigninValidationSchema : MagicSigninValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, values }) => (
          <Form className="space-y-4">
            {status?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {status.error}
              </div>
            )}

            <FormikFormItem>
              <FormikFormLabel htmlFor="email-restaurant">
                Email Address
              </FormikFormLabel>
              <FormikFormControl>
                <Field
                  as={Input}
                  id="email-restaurant"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full h-12 border-gray-200 rounded-lg"
                />
              </FormikFormControl>
              <FormikFormMessage name="email" />
            </FormikFormItem>

            {loginMethod === 'password' && (
              <FormikFormItem>
                <FormikFormLabel htmlFor="password-restaurant">
                  Password
                </FormikFormLabel>
                <FormikFormControl>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password-restaurant"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full h-12 border-gray-200 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormikFormControl>
                <FormikFormMessage name="password" />
              </FormikFormItem>
            )}

            {loginMethod === 'password' && (
              <div className="flex items-center justify-end text-xs text-gray-500 mb-2">
                <Link
                  href="/auth/restaurant/forgot-password"
                  className="text-[#3851DD] hover:underline whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#3851DD] hover:bg-[#2c3fa0] text-white font-semibold rounded-lg text-base mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : (loginMethod === 'magic' ? "Send Magic Link" : "Log In")}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => setLoginMethod(loginMethod === 'password' ? 'magic' : 'password')}
              >
                {loginMethod === 'password' ? "Prefer magic link? Sign in with email" : (
                  <span className="flex items-center justify-center gap-1">
                    Prefer to use a password? <span className="text-[#3851DD] font-medium">Sign in with password</span>
                  </span>
                )}
              </button>
            </div>

            {loginMethod === 'password' && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="mx-4 text-gray-400 text-sm">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border-gray-200"
                    onClick={() => authenticateWithOAuth("google")}
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border-gray-200"
                    onClick={() => authenticateWithOAuth("apple")}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z" />
                    </svg>
                    Apple
                  </Button>
                </div>
              </>
            )}

            <div className="text-center text-sm text-gray-500 mt-6">
              Don't have a restaurant account?{" "}
              <Link
                href="/auth/restaurant/signup"
                className="text-[#3851DD] font-medium hover:underline"
              >
                Sign Up Here
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
