"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Check, Info, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AddCustomerPage() {
  const { toast } = useToast();
  const [formState, setFormState] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    restaurantName: "",
    contactMethod: "email",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    restaurantName: false,
    email: false,
    phone: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleContactMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contactMethod: value }));
  };

  const validateForm = () => {
    const newErrors = {
      restaurantName: !formData.restaurantName.trim(),
      email:
        formData.contactMethod === "email" && !validateEmail(formData.email),
      phone:
        formData.contactMethod === "phone" && !validatePhone(formData.phone),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[0-9]{10,15}$/.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Invalid information",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send an API request to invite the customer
    console.log("Invitation sent to:", formData);

    // Show success message
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${formData.restaurantName}.`,
    });

    // Show success state
    setFormState("success");
  };

  if (formState === "success") {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard/customers" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto my-4 bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Invitation Sent</CardTitle>
              <CardDescription>
                {formData.restaurantName} has been invited to join Dosteon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex gap-2 items-start">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    <p className="font-medium">Next Steps</p>
                    <p className="text-muted-foreground">
                      {formData.contactMethod === "email"
                        ? `An email has been sent to ${formData.email}. Once they accept the invitation, they'll appear in your customer list.`
                        : `An SMS has been sent to ${formData.phone}. Once they accept the invitation, they'll appear in your customer list.`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard/customers">Return to Customers</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/customers/add">
                  Invite Another Customer
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard/customers" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Add Customer</h1>
            <p className="text-muted-foreground">
              Invite a restaurant you already do business with to join Dosteon
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Send Invitation</CardTitle>
                <CardDescription>
                  Enter the restaurant's contact information to send them an
                  invitation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">
                      Restaurant Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="restaurantName"
                      name="restaurantName"
                      placeholder="Enter restaurant name"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      className={errors.restaurantName ? "border-red-500" : ""}
                    />
                    {errors.restaurantName && (
                      <p className="text-sm text-red-500">
                        Restaurant name is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Method</Label>
                    <RadioGroup
                      value={formData.contactMethod}
                      onValueChange={handleContactMethodChange}
                      className="flex flex-col space-y-1 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="contact-email" />
                        <Label
                          htmlFor="contact-email"
                          className="font-normal flex items-center"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="contact-phone" />
                        <Label
                          htmlFor="contact-phone"
                          className="font-normal flex items-center"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Phone Number
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.contactMethod === "email" ? (
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="restaurant@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+250 7XX XXX XXX"
                        value={formData.phone}
                        onChange={handleChange}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">
                          Please enter a valid phone number
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customers">Cancel</Link>
                </Button>
                <Button type="submit">Send Invitation</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
