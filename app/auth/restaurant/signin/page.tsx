"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormikFormItem,
  FormikFormLabel,
  FormikFormControl,
  FormikFormMessage,
} from "@/components/ui/formik-form";
import { SigninValidationSchema } from "@/schemas/auth";
import { LoginValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("restaurant");

  const handleSubmit = async (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => {
    await login(values, helpers);
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login to Dosteon</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={SigninValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form>
                <div className="space-y-4">
                  {status?.error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {status.error}
                    </div>
                  )}
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
                      />
                    </FormikFormControl>
                    <FormikFormMessage name="email" />
                  </FormikFormItem>
                  <FormikFormItem>
                    <FormikFormLabel htmlFor="password-restaurant">
                      Password
                    </FormikFormLabel>
                    <FormikFormControl>
                      <Field
                        as={PasswordInput}
                        id="password-restaurant"
                        name="password"
                      />
                    </FormikFormControl>
                    <FormikFormMessage name="password" />
                  </FormikFormItem>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Login as Restaurant
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/restaurant/signup"
              className="text-primary underline"
            >
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
