"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const CreateAccountSchema = Yup.object().shape({
  businessName: Yup.string().required("Business name is required"),
  phone: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zipCode: Yup.string().required("ZIP code is required"),
});

export default function CreateAccountPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("restaurant");

  const handleSubmit = async (values: any) => {
    // Here you would typically save the account details
    console.log("Creating account with:", values);
    
    // Simulate account creation
    setTimeout(() => {
      router.push("/business-details");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Account
          </CardTitle>
          <CardDescription className="text-center">
            Add your business information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="restaurant" onValueChange={setSelectedRole}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="supplier">Supplier</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurant">
              <Formik
                initialValues={{
                  businessName: "",
                  phone: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                }}
                validationSchema={CreateAccountSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="space-y-4">
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="businessName">
                          Restaurant Name
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="businessName"
                            name="businessName"
                            placeholder="Your Restaurant Name"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="businessName" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="phone">
                          Phone Number
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="phone" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="address">
                          Address
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="address" />
                      </FormikFormItem>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormikFormItem>
                          <FormikFormLabel htmlFor="city">City</FormikFormLabel>
                          <FormikFormControl>
                            <Field
                              as={Input}
                              id="city"
                              name="city"
                              placeholder="City"
                            />
                          </FormikFormControl>
                          <FormikFormMessage name="city" />
                        </FormikFormItem>
                        
                        <FormikFormItem>
                          <FormikFormLabel htmlFor="state">State</FormikFormLabel>
                          <FormikFormControl>
                            <Field
                              as={Input}
                              id="state"
                              name="state"
                              placeholder="State"
                            />
                          </FormikFormControl>
                          <FormikFormMessage name="state" />
                        </FormikFormItem>
                      </div>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="zipCode">
                          ZIP Code
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="zipCode"
                            name="zipCode"
                            placeholder="12345"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="zipCode" />
                      </FormikFormItem>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Complete Restaurant Setup
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </TabsContent>
            <TabsContent value="supplier">
              <Formik
                initialValues={{
                  businessName: "",
                  phone: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                }}
                validationSchema={CreateAccountSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="space-y-4">
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="businessName">
                          Supplier Company Name
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="businessName"
                            name="businessName"
                            placeholder="Your Company Name"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="businessName" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="phone">
                          Phone Number
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="phone" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="address">
                          Address
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="address" />
                      </FormikFormItem>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormikFormItem>
                          <FormikFormLabel htmlFor="city">City</FormikFormLabel>
                          <FormikFormControl>
                            <Field
                              as={Input}
                              id="city"
                              name="city"
                              placeholder="City"
                            />
                          </FormikFormControl>
                          <FormikFormMessage name="city" />
                        </FormikFormItem>
                        
                        <FormikFormItem>
                          <FormikFormLabel htmlFor="state">State</FormikFormLabel>
                          <FormikFormControl>
                            <Field
                              as={Input}
                              id="state"
                              name="state"
                              placeholder="State"
                            />
                          </FormikFormControl>
                          <FormikFormMessage name="state" />
                        </FormikFormItem>
                      </div>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="zipCode">
                          ZIP Code
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="zipCode"
                            name="zipCode"
                            placeholder="12345"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="zipCode" />
                      </FormikFormItem>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Complete Supplier Setup
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 