"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "restaurant"
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(defaultRole)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    // Simulate registration with default owner/manager roles
    setTimeout(() => {
      setIsLoading(false)

      // Assign default roles: Restaurant Owner/Manager or Supplier Owner/Manager
      if (selectedRole === "restaurant") {
        // Default role: Restaurant Owner/Manager with full access
        router.push("/restaurant/dashboard")
      } else {
        // Default role: Supplier Owner/Manager with full access
        router.push("/supplier/dashboard")
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Register to start using Dosteon</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultRole} onValueChange={setSelectedRole}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="supplier">Supplier</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurant">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <CardDescription>Register as a Restaurant Owner/Manager with full system access</CardDescription>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input id="restaurant-name" placeholder="Your Restaurant" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-restaurant">Email</Label>
                    <Input id="email-restaurant" type="email" placeholder="restaurant@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-restaurant">Phone Number</Label>
                    <Input id="phone-restaurant" type="tel" placeholder="+1234567890" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-restaurant">Password</Label>
                    <Input id="password-restaurant" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register as Restaurant"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="supplier">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <CardDescription>Register as a Supplier Owner/Manager with full system access</CardDescription>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-name">Business Name</Label>
                    <Input id="supplier-name" placeholder="Your Business" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-supplier">Email</Label>
                    <Input id="email-supplier" type="email" placeholder="supplier@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-supplier">Phone Number</Label>
                    <Input id="phone-supplier" type="tel" placeholder="+1234567890" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-supplier">Password</Label>
                    <Input id="password-supplier" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register as Supplier"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Login here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
