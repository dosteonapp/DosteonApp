"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, Eye, EyeOff, Lock, Check } from "lucide-react";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SignupValidationSchema } from "@/schemas/auth";
import { SignupValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { EmailCheckScreen } from "@/components/auth/EmailCheckScreen";
import Image from "next/image";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, authenticateWithOAuth } = useAuth();
  const defaultRole = searchParams.get("role") || "restaurant";
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");

  const getInitialValues = (role: "restaurant" | "supplier"): SignupValues => ({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: role,
  });

  const handleSubmit = async (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>
  ) => {
    try {
      const response = await signup(values, helpers);
      if (response && response.success) {
        setEmail(values.email);
        setIsVerifying(true);
      }
    } catch (error) {
      helpers.setStatus({ error: "Signup failed. Please try again." });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      await authenticateWithOAuth(provider);
    } catch (err: any) {
      toast.error(err.message || "Social login failed");
    }
  };

  if (isVerifying) {
    return (
      <EmailCheckScreen
        title="Check your email"
        description={`We've sent a verification link to ${email}. Please click the link in the email to activate your account.`}
        buttonText="Back to Sign Up"
        onButtonClick={() => setIsVerifying(false)}
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
        <h2 className="text-3xl font-bold text-gray-900 font-serif">
          Create Your Account
        </h2>
        <p className="text-gray-500 text-center max-w-sm">
          Get started with Dosteon to streamline your restaurant operations.
        </p>
      </div>

          <Formik
            initialValues={getInitialValues("restaurant")}
            validationSchema={SignupValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status, isValid, values }) => {
              const passwordRequirements = {
                length: values.password.length >= 8,
                capital: /[A-Z]/.test(values.password),
                number: /\d/.test(values.password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(values.password),
              };
              const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

              return (
                <Form className="space-y-4">
                  {status?.error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {status.error}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-3">
                    <FormikFormItem className="flex-1">
                      <FormikFormLabel htmlFor="firstName-restaurant">
                        First Name
                      </FormikFormLabel>
                      <FormikFormControl>
                        <Field
                          as={Input}
                          id="firstName-restaurant"
                          name="firstname"
                          placeholder="First Name"
                          className="w-full"
                        />
                      </FormikFormControl>
                      <FormikFormMessage name="firstname" />
                    </FormikFormItem>
                    <FormikFormItem className="flex-1">
                      <FormikFormLabel htmlFor="lastName-restaurant">
                        Last Name
                      </FormikFormLabel>
                      <FormikFormControl>
                        <Field
                          as={Input}
                          id="lastName-restaurant"
                          name="lastname"
                          placeholder="Last Name"
                          className="w-full"
                        />
                      </FormikFormControl>
                      <FormikFormMessage name="lastname" />
                    </FormikFormItem>
                  </div>
                  <FormikFormItem>
                    <FormikFormLabel htmlFor="email-restaurant">
                      Email
                    </FormikFormLabel>
                    <FormikFormControl>
                      <Field
                        as={Input}
                        id="email-restaurant"
                        name="email"
                        type="email"
                        placeholder="restaurant@example.com"
                        className="w-full"
                      />
                    </FormikFormControl>
                    <FormikFormMessage name="email" />
                  </FormikFormItem>
                  <FormikFormItem>
                    <FormikFormLabel htmlFor="password-restaurant">
                      New Password
                    </FormikFormLabel>

                    <FormikFormControl>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password-restaurant"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          className="w-full pl-10 pr-10"
                        />

                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormikFormControl>
                    <PasswordStrengthMeter password={values.password} />
                    <FormikFormMessage name="password" />
                  </FormikFormItem>
                  <FormikFormItem>
                    <FormikFormLabel htmlFor="confirmPassword-restaurant">
                      Confirm Password
                    </FormikFormLabel>
                    <FormikFormControl>
                      <Field
                        as={PasswordInput}
                        id="confirmPassword-restaurant"
                        name="confirmPassword"
                        className="w-full"
                      />
                    </FormikFormControl>
                    <FormikFormMessage name="confirmPassword" />
                  </FormikFormItem>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg font-semibold mt-4"
                    disabled={!allRequirementsMet || isSubmitting}
                  >
                    {isSubmitting
                      ? "Registering..."
                      : "Register as Restaurant"}
                  </Button>
                  <div className="text-center">
                    <span className="text-gray-600">
                      Already have a restaurant account?{" "}
                    </span>
                    <Link
                      href="/auth/restaurant/signin"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign In Here
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">
                      Or continue with
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => handleSocialLogin("google")}
                    >
                      <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                      />
                      Google
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => handleSocialLogin("apple")}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z" />
                      </svg>
                      Apple
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    By creating an account, you agree to our{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </Form>
              );
            }}
          </Formik>
    </div>
  );
}
