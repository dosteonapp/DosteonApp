"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SigninValidationSchema } from "@/schemas/auth";
import { LoginValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);

  const handleSubmit = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    if (!validatePassword(values.password)) {
      helpers.setStatus({ error: "Password does not meet requirements" });
      return;
    }
    await login(values, helpers);
  };

  return (
    <div className="space-y-6">
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
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
            <div className="flex flex-col items-center gap-2 mb-2">
              <img
                src="/images/logo-full.png"
                alt="Dosteon Logo"
                className="h-10 w-auto mb-2"
              />
              <h2 className="text-2xl font-semibold text-gray-900">
                Log In to Dosteon
              </h2>
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
                  placeholder="restaurant@example.com"
                  className={`border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    values.email && !/^\S+@\S+\.\S+$/.test(values.email)
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
              </FormikFormControl>
              <FormikFormMessage name="email" />
            </FormikFormItem>
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
                    className={`border rounded-lg px-4 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full ${
                      values.password && !validatePassword(values.password)
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </FormikFormControl>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">
                  Password must be at least <b>8 Characters</b> and must contain
                  at least a <b>Capital Letter</b>, a <b>Number</b> and a{" "}
                  <b>Special Character</b>.
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-500 hover:underline ml-2 whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>
              <FormikFormMessage name="password" />
            </FormikFormItem>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-2"
              disabled={!validatePassword(values.password) || isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login as Restaurant"}
            </Button>
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-gray-300"
                onClick={() => alert("Google sign-in")}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign In With Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-gray-300"
                onClick={() => alert("Apple sign-in")}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z" />
                </svg>
                Sign In With Apple
              </Button>
            </div>
            <div className="text-xs text-gray-400 text-center">
              By signing up, you accept{" "}
              <Link href="#" className="underline">
                the terms of service and Privacy Policy
              </Link>
              .
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}