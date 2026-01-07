"use client";

import React from "react";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

import { EmailCheckScreen } from "@/components/auth/EmailCheckScreen";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = async (
    values: { email: string },
    helpers: FormikHelpers<{ email: string }>
  ) => {
    try {
      const res = await forgotPassword(values, helpers);
      if (res?.success) {
        setIsSent(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  if (isSent) {
    return (
      <EmailCheckScreen
        title="Check Your Email"
        description="Password reset instructions sent to your email. Check your spam folder if you don't see it in a few minutes."
        buttonText="Back to Login"
        buttonHref="/auth/restaurant/signin"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-12 flex flex-col items-center mx-auto">
        <div className="w-16 h-16 rounded-xl border border-blue-100 flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Forgot Your Password?</h1>
        <p className="text-gray-500 text-center mb-8">
          No worries. Enter your email and we'll send you a reset link.
        </p>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="w-full space-y-6">
              {status?.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {status.error}
                </div>
              )}
              
              <FormikFormItem>
                <FormikFormLabel htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</FormikFormLabel>
                <FormikFormControl>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full h-12 border-gray-200 rounded-lg focus:ring-blue-600"
                  />
                </FormikFormControl>
                <FormikFormMessage name="email" />
              </FormikFormItem>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/restaurant/signin"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Back to Sign In
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
