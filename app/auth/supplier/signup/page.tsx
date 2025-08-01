"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SignupValidationSchema } from "@/schemas/auth";
import { SignupValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const defaultRole = searchParams.get("role") || "supplier";
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);

  const getInitialValues = (role: string): SignupValues => ({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>
  ) => {
    const passwordRequirements = {
      length: values.password.length >= 8,
      capital: /[A-Z]/.test(values.password),
      number: /\d/.test(values.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(values.password),
    };
    const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

    if (!allRequirementsMet) {
      helpers.setStatus({ error: "Password does not meet requirements" });
      return;
    }
    const signupData = {
      ...values,
    };
    await signup(signupData, helpers);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-base">Back</span>
      </button>
      <Formik
        initialValues={getInitialValues("supplier")}
        validationSchema={SignupValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, values }) => {
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
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {status.error}
                </div>
              )}
              <p className="text-gray-500">Register as a Supplier Owner/Manager with full system access</p>
              <div className="flex flex-col md:flex-row gap-4">
                <FormikFormItem className="flex-1">
                  <FormikFormLabel htmlFor="firstName-supplier">
                    First Name
                  </FormikFormLabel>
                  <FormikFormControl>
                    <Field
                      as={Input}
                      id="firstName-supplier"
                      name="firstname"
                      placeholder="First Name"
                    />
                  </FormikFormControl>
                  <FormikFormMessage name="firstname" />
                </FormikFormItem>
                <FormikFormItem className="flex-1">
                  <FormikFormLabel htmlFor="lastName-supplier">
                    Last Name
                  </FormikFormLabel>
                  <FormikFormControl>
                    <Field
                      as={Input}
                      id="lastName-supplier"
                      name="lastname"
                      placeholder="Last Name"
                    />
                  </FormikFormControl>
                  <FormikFormMessage name="lastname" />
                </FormikFormItem>
              </div>
              <FormikFormItem>
                <FormikFormLabel htmlFor="email-supplier">
                  Email
                </FormikFormLabel>
                <FormikFormControl>
                  <Field
                    as={Input}
                    id="email-supplier"
                    name="email"
                    type="email"
                    placeholder="supplier@example.com"
                  />
                </FormikFormControl>
                <FormikFormMessage name="email" />
              </FormikFormItem>
              <FormikFormItem>
                <FormikFormLabel htmlFor="password-supplier">
                  New Password
                </FormikFormLabel>
                <FormikFormControl>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password-supplier"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormikFormControl>
                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least <b>8 Characters</b> and must contain at least a <b>Capital Letter</b>, a <b>Number</b> and a <b>Special Character</b>.
                </p>
                <FormikFormMessage name="password" />
              </FormikFormItem>
              <FormikFormItem>
                <FormikFormLabel htmlFor="confirmPassword-supplier">
                  Confirm Password
                </FormikFormLabel>
                <FormikFormControl>
                  <Field
                    as={PasswordInput}
                    id="confirmPassword-supplier"
                    name="confirmPassword"
                  />
                </FormikFormControl>
                <FormikFormMessage name="confirmPassword" />
              </FormikFormItem>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={!allRequirementsMet || isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register as Supplier"}
              </Button>
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/auth/supplier/signin" className="text-blue-600 hover:text-blue-800 font-medium">Login Here</Link>
              </div>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => alert("Google sign-in")}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Google
                </Button>
                <Button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => alert("Apple sign-in")}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.14 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.13zm2.52 4.13c-1.34-.08-2.47.77-3.11.77-.65 0-1.65-.75-2.72-.73-1.4.02-2.7.82-3.42 2.09-1.46 2.54-.37 6.3 1.05 8.36.7 1.01 1.53 2.14 2.62 2.1 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.73.66 1.13-.02 1.84-1.03 2.53-2.04.8-1.18 1.13-2.32 1.14-2.38-.02-.01-2.19-.84-2.21-3.33-.02-2.08 1.7-3.07 1.78-3.12-1-.15-1.97.6-2.5.6-.53 0-1.34-.59-2.21-.57zm-2.6-3.36c.38-.46.64-1.1.57-1.74-.55.02-1.22.37-1.62.83-.36.41-.67 1.07-.55 1.7.59.05 1.21-.34 1.6-.79z"/>
                  </svg>
                  Apple
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>.
              </p>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}