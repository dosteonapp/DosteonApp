"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  // UserContext handles all authentication logic and redirects
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dosteon</h1>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Simplify Restaurant Procurement & Inventory Management
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect directly with suppliers, automate inventory tracking, and
            never run out of stock again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register?role=restaurant">I'm a Restaurant</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register?role=supplier">I'm a Supplier</Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <FeatureCard
            title="Real-time Inventory"
            description="Automatically update stock levels when orders are delivered."
          />
          <FeatureCard
            title="Smart Procurement"
            description="Place orders directly with suppliers and track fulfillment."
          />
          <FeatureCard
            title="Low Stock Alerts"
            description="Get notified when inventory items are running low."
          />
        </div>
      </main>
      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Dosteon. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
