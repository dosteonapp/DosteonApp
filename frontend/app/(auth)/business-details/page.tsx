"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const BusinessDetailsSchema = Yup.object().shape({
  businessType: Yup.string().required("Business type is required"),
  cuisine: Yup.string().when('role', {
    is: 'restaurant',
    then: (schema) => schema.required("Cuisine type is required"),
    otherwise: (schema) => schema.optional(),
  }),
  specialties: Yup.string().when('role', {
    is: 'supplier',
    then: (schema) => schema.required("Specialties are required"),
    otherwise: (schema) => schema.optional(),
  }),
  description: Yup.string().required("Business description is required"),
  website: Yup.string().url("Must be a valid URL").optional(),
  taxId: Yup.string().required("Tax ID is required"),
});

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("restaurant");

  const handleSubmit = async (values: any) => {
    // Here you would typically save the business details
    console.log("Saving business details:", values);
    
    // Simulate saving
    setTimeout(() => {
      router.push("/quick-tour");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Business Details
          </CardTitle>
          <CardDescription className="text-center">
            Tell us more about your business to personalize your experience
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
                  role: "restaurant",
                  businessType: "",
                  cuisine: "",
                  description: "",
                  website: "",
                  taxId: "",
                }}
                validationSchema={BusinessDetailsSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="space-y-4">
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="businessType">
                          Restaurant Type
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as="select"
                            id="businessType"
                            name="businessType"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select restaurant type</option>
                            <option value="fine-dining">Fine Dining</option>
                            <option value="casual-dining">Casual Dining</option>
                            <option value="fast-casual">Fast Casual</option>
                            <option value="cafe">Café</option>
                            <option value="pizzeria">Pizzeria</option>
                            <option value="bakery">Bakery</option>
                            <option value="other">Other</option>
                          </Field>
                        </FormikFormControl>
                        <FormikFormMessage name="businessType" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="cuisine">
                          Cuisine Type
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as="select"
                            id="cuisine"
                            name="cuisine"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select cuisine</option>
                            <option value="italian">Italian</option>
                            <option value="mexican">Mexican</option>
                            <option value="chinese">Chinese</option>
                            <option value="japanese">Japanese</option>
                            <option value="indian">Indian</option>
                            <option value="american">American</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="french">French</option>
                            <option value="other">Other</option>
                          </Field>
                        </FormikFormControl>
                        <FormikFormMessage name="cuisine" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="description">
                          Restaurant Description
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Textarea}
                            id="description"
                            name="description"
                            placeholder="Tell us about your restaurant..."
                            rows={4}
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="description" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="website">
                          Website (Optional)
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://yourrestaurant.com"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="website" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="taxId">
                          Tax ID / EIN
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="taxId"
                            name="taxId"
                            placeholder="12-3456789"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="taxId" />
                      </FormikFormItem>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Save Restaurant Details
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </TabsContent>
            <TabsContent value="supplier">
              <Formik
                initialValues={{
                  role: "supplier",
                  businessType: "",
                  specialties: "",
                  description: "",
                  website: "",
                  taxId: "",
                }}
                validationSchema={BusinessDetailsSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="space-y-4">
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="businessType">
                          Supplier Type
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as="select"
                            id="businessType"
                            name="businessType"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select supplier type</option>
                            <option value="produce">Produce Supplier</option>
                            <option value="meat">Meat Supplier</option>
                            <option value="dairy">Dairy Supplier</option>
                            <option value="beverages">Beverages</option>
                            <option value="dry-goods">Dry Goods</option>
                            <option value="equipment">Equipment</option>
                            <option value="other">Other</option>
                          </Field>
                        </FormikFormControl>
                        <FormikFormMessage name="businessType" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="specialties">
                          Product Specialties
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Textarea}
                            id="specialties"
                            name="specialties"
                            placeholder="List your main product categories..."
                            rows={3}
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="specialties" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="description">
                          Company Description
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Textarea}
                            id="description"
                            name="description"
                            placeholder="Tell us about your company..."
                            rows={4}
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="description" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="website">
                          Website (Optional)
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://yoursupplier.com"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="website" />
                      </FormikFormItem>
                      
                      <FormikFormItem>
                        <FormikFormLabel htmlFor="taxId">
                          Tax ID / EIN
                        </FormikFormLabel>
                        <FormikFormControl>
                          <Field
                            as={Input}
                            id="taxId"
                            name="taxId"
                            placeholder="12-3456789"
                          />
                        </FormikFormControl>
                        <FormikFormMessage name="taxId" />
                      </FormikFormItem>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Save Supplier Details
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