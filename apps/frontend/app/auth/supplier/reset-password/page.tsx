"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { useRouter } from "next/navigation";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain a capital letter")
    .matches(/\d/, "Must contain a number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain a special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    values: any,
    helpers: FormikHelpers<any>
  ) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code") || "";

      await resetPassword({ 
        password: values.password, 
        confirmPassword: values.confirmPassword,
        code: code
      }, helpers);
      
      router.push("/auth/supplier/status/password-changed");
    } catch (error: any) {
      helpers.setStatus({ error: error.message || "Failed to reset password" });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 md:p-12 flex flex-col items-center mx-auto">
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

        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-serif text-center">Reset Your Password</h1>
        
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status, values }) => (
            <Form className="w-full space-y-6 mt-4">
              {status?.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {status.error}
                </div>
              )}
              
              <FormikFormItem>
                <FormikFormLabel htmlFor="password">New Password</FormikFormLabel>
                <FormikFormControl>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="w-full h-12 border-gray-200 rounded-lg focus:ring-[#00a13e] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormikFormControl>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 Characters and must contain at least a Capital Letter, a Number and a Special Character.
                </p>
                <FormikFormMessage name="password" />
              </FormikFormItem>

              <FormikFormItem>
                <FormikFormLabel htmlFor="confirmPassword">Confirm Password</FormikFormLabel>
                <FormikFormControl>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="w-full h-12 border-gray-200 rounded-lg focus:ring-[#00a13e] pr-10"
                    />
                  </div>
                </FormikFormControl>
                <FormikFormMessage name="confirmPassword" />
              </FormikFormItem>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#00a13e] hover:bg-[#008a35] text-white font-semibold rounded-lg text-base transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );

}
