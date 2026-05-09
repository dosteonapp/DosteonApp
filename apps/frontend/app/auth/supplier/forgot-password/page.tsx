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
import Image from "next/image";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [isSent, setIsSent] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (
    values: { email: string },
    helpers: FormikHelpers<{ email: string }>
  ) => {
    try {
      const response = await forgotPassword(values, helpers);
      if (response && response.success) {
        setEmail(values.email);
        setIsSent(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {isSent ? (
        <EmailCheckScreen
          title="Check your email"
          description={`We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`}
          buttonText="Back to Login"
          onButtonClick={() => setIsSent(false)}
          role="supplier"
        />
      ) : (
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="mb-6">
              <Image
                src="/images/logo-full.png"
                alt="Dosteon Logo"
                width={160}
                height={40}
                priority
                className="h-auto w-auto max-h-8"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif text-center">Forgot Your Password?</h1>
            <p className="text-gray-500 text-center">
              No worries. Enter your email and we'll send you a reset link.
            </p>
          </div>

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
                      className="w-full h-12 border-gray-200 rounded-lg focus:ring-[#00a13e]"
                    />
                  </FormikFormControl>
                  <FormikFormMessage name="email" />
                </FormikFormItem>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#00a13e] hover:bg-[#008a35] text-white font-semibold rounded-lg text-base transition-colors"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/supplier/signin"
                    className="text-[#00a13e] hover:text-[#008a35] font-medium text-sm"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}

