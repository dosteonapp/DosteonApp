"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SigninValidationSchema } from "@/schemas/auth";
import { LoginValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, sendMagicLink, authenticateWithOAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const validatePassword = (pw: string) =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);

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
        if (!validatePassword(values.password)) {
          helpers.setStatus({ error: "Password does not meet requirements" });
          return;
        }
        await login(values, helpers);
      }
    } catch (err: any) {
      helpers.setStatus({ error: err.message || "Authentication failed" });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      await authenticateWithOAuth(provider);
    } catch (err: any) {
      toast.error(err.message || "Social login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="bg-white rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 mx-auto"
        >
          <div className="flex flex-col items-center gap-2 mb-6">
            <img
              src="/images/logo-full.png"
              alt="Dosteon Logo"
              className="h-10 w-auto mb-2"
            />
            <h2 className="text-2xl font-semibold text-gray-900">
              Log In to Dosteon
            </h2>
          </div>

          {magicLinkSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-gray-600 mb-6">We've sent a magic link to your inbox. Click the link to sign in instantly.</p>
              <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="w-full">
                Back to Login
              </Button>
            </div>
          ) : (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={SigninValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status, values }) => (
                <Form className="space-y-4">
                  {status?.error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {status.error}
                    </div>
                  )}

                  {/* Login Method Toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setLoginMethod('password')}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'magic' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setLoginMethod('magic')}
                    >
                      Magic Link
                    </button>
                  </div>

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
                        className={`border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 ${values.email &&
                          !/^\S+@\S+\.\S+$/.test(values.email)
                          ? "border-red-400"
                          : "border-gray-200"
                          }`}
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
                            className={`border rounded-lg px-4 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full ${values.password &&
                              !validatePassword(values.password)
                              ? "border-red-400"
                              : "border-gray-200"
                              }`}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormikFormControl>
                      <FormikFormMessage name="password" />
                    </FormikFormItem>
                  )}

                  {loginMethod === 'password' && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>
                        Password must be at least <b>8 Characters</b> and must
                        contain at least a <b>Capital Letter</b>, a <b>Number</b>{" "}
                        and a <b>Special Character</b>.
                      </span>
                      <Link
                        href="/auth/restaurant/forgot-password"
                        className="text-[#3851DD] hover:underline ml-2 whitespace-nowrap"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#3851DD] hover:bg-[#2c3fa0] text-white font-semibold rounded-lg py-3 text-base mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : (loginMethod === 'magic' ? "Send Magic Link" : "Log In")}
                  </Button>

                  <div className="flex items-center my-4">
                    <Separator className="flex-1" />
                    <span className="mx-2 text-gray-400 text-sm">
                      Or continue with
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => handleSocialLogin("google")}
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => handleSocialLogin("apple")}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z" />
                      </svg>
                      Apple
                    </Button>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/restaurant/signup"
                      className="text-[#3851DD] font-medium hover:underline"
                    >
                      Sign Up
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}
