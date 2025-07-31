"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { SignupValidationSchema } from "@/schemas/auth";
import { SignupValues } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Metadata } from "next";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const defaultRole = searchParams.get("role") || "restaurant";
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  const getInitialValues = (role: string): SignupValues => ({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    // accountType: role as "restaurant" | "supplier",
  });

  const handleSubmit = async (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>
  ) => {
    // Include the selected role as account type
    const signupData = {
      ...values,
      accountType: selectedRole as "restaurant" | "supplier",
    };
    await signup(signupData, helpers);
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>Register to start using Dosteon</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={getInitialValues("supplier")}
            validationSchema={SignupValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form>
                <div className="space-y-4">
                  <CardDescription>
                    Register as a Supplier Owner/Manager with full system access
                  </CardDescription>
                  {status?.error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {status.error}
                    </div>
                  )}
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
                      Password
                    </FormikFormLabel>
                    <FormikFormControl>
                      <Field
                        as={PasswordInput}
                        id="password-supplier"
                        name="password"
                      />
                    </FormikFormControl>
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
                    className="w-full"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Register as Supplier
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/supplier/signin"
              className="text-primary underline"
            >
              Login here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
