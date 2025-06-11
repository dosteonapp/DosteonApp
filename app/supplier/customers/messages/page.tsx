"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageSquare, Search, Send, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CustomerMessagesPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const customerId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState("compose")
  const [messageType, setMessageType] = useState("individual")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(customerId ? [customerId] : [])
  const [selectedSegment, setSelectedSegment] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId],
    )
  }

  const handleSegmentChange = (value: string) => {
    setSelectedSegment(value)
    setMessageType("segment")
  }

  const handleSendMessage = () => {
    if (!subject.trim()) {
      toast({
        title: "Missing subject",
        description: "Please enter a message subject",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    if (messageType === "individual" && selectedCustomers.length === 0) {
      toast({
        title: "No recipients",
        description: "Please select at least one customer",
        variant: "destructive",
      })
      return
    }

    if (messageType === "segment" && !selectedSegment) {
      toast({
        title: "No segment selected",
        description: "Please select a customer segment",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the message via an API
    console.log("Sending message:", {
      type: messageType,
      recipients: messageType === "individual" ? selectedCustomers : selectedSegment,
      subject,
      message,
    })

    toast({
      title: "Message sent",
      description:
        messageType === "individual"
          ? `Message sent to ${selectedCustomers.length} customer(s)`
          : `Message sent to customers in ${segments.find((s) => s.id === selectedSegment)?.name} segment`,
    })

    // Reset form
    setSubject("")
    setMessage("")
    if (!customerId) {
      setSelectedCustomers([])
    }
    setSelectedSegment("")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <Link href="/supplier/customers" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Customer Messages</h1>
          <p className="text-muted-foreground">Communicate with your customers via email or SMS</p>
        </div>

        <Tabs defaultValue="compose" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="compose">Compose Message</TabsTrigger>
            <TabsTrigger value="sent">Sent Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="compose" className="m-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Message</CardTitle>
                <CardDescription>Send a message to one or more customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Message Type</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="individual"
                        checked={messageType === "individual"}
                        onCheckedChange={() => setMessageType("individual")}
                      />
                      <label
                        htmlFor="individual"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Individual Customers
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="segment"
                        checked={messageType === "segment"}
                        onCheckedChange={() => setMessageType("segment")}
                      />
                      <label
                        htmlFor="segment"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Customer Segment
                      </label>
                    </div>
                  </div>
                </div>

                {messageType === "individual" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">Select Recipients</h3>
                        <span className="text-sm text-muted-foreground">{selectedCustomers.length} selected</span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search customers..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="border rounded-md h-[200px] overflow-y-auto p-2">
                      {filteredCustomers.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No customers found
                        </div>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <div key={customer.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                            <Checkbox
                              id={`customer-${customer.id}`}
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => handleCustomerToggle(customer.id)}
                            />
                            <label
                              htmlFor={`customer-${customer.id}`}
                              className="flex-1 flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">{customer.email}</div>
                              </div>
                              <Badge
                                variant={
                                  customer.status === "Active"
                                    ? "default"
                                    : customer.status === "Pending"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {customer.status}
                              </Badge>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Select Segment</h3>
                    <Select value={selectedSegment} onValueChange={handleSegmentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            <div className="flex items-center gap-2">
                              <span>{segment.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {segment.customerCount}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Message Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="Enter message subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Type your message here..."
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {messageType === "individual"
                      ? `Sending to ${selectedCustomers.length} customer(s)`
                      : selectedSegment
                        ? `Sending to ${segments.find((s) => s.id === selectedSegment)?.customerCount} customers in segment`
                        : "Select recipients"}
                  </span>
                </div>
                <Button onClick={handleSendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="sent" className="m-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
                <CardDescription>History of messages sent to customers</CardDescription>
              </CardHeader>
              <CardContent>
                {sentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No messages sent yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      When you send messages to your customers, they will appear here
                    </p>
                    <Button onClick={() => setActiveTab("compose")}>Compose Message</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentMessages.map((msg) => (
                      <div key={msg.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{msg.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {msg.type === "individual"
                                ? `Sent to ${msg.recipients} customers`
                                : `Sent to ${msg.segment} segment`}
                            </p>
                          </div>
                          <Badge variant="outline">{msg.date}</Badge>
                        </div>
                        <p className="text-sm mb-2">{msg.preview}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{msg.opened} opened</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="m-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Save and reuse message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {messageTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{template.preview}</p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setActiveTab("compose")
                            setSubject(template.subject)
                            setMessage(template.content)
                          }}
                        >
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-full py-8">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Create Template</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Save message templates for future use
                      </p>
                      <Button>Create New Template</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Sample data
const customers = [
  {
    id: "cust-001",
    name: "Bistro Bella",
    email: "manager@bistrobella.com",
    status: "Active",
  },
  {
    id: "cust-002",
    name: "Cafe Milano",
    email: "orders@cafemilano.com",
    status: "Active",
  },
  {
    id: "cust-003",
    name: "The Green Plate",
    email: "info@greenplate.com",
    status: "Active",
  },
  {
    id: "cust-004",
    name: "Spice Garden",
    email: "orders@spicegarden.com",
    status: "Inactive",
  },
  {
    id: "cust-005",
    name: "Taste of Asia",
    email: "manager@tasteofasia.com",
    status: "Pending",
  },
]

const segments = [
  {
    id: "seg-001",
    name: "High-Value Customers",
    customerCount: 28,
  },
  {
    id: "seg-002",
    name: "Frequent Buyers",
    customerCount: 42,
  },
  {
    id: "seg-003",
    name: "New Customers",
    customerCount: 15,
  },
  {
    id: "seg-004",
    name: "Kigali City Center",
    customerCount: 35,
  },
  {
    id: "seg-005",
    name: "Vegetarian Restaurants",
    customerCount: 12,
  },
]

const sentMessages = [
  {
    id: "msg-001",
    subject: "New Product Announcement",
    type: "segment",
    segment: "High-Value Customers",
    recipients: 28,
    date: "2 days ago",
    preview: "We're excited to announce our new line of organic produce...",
    opened: 22,
  },
  {
    id: "msg-002",
    subject: "Holiday Schedule",
    type: "individual",
    segment: "",
    recipients: 5,
    date: "1 week ago",
    preview: "Please note our delivery schedule for the upcoming holiday...",
    opened: 5,
  },
  {
    id: "msg-003",
    subject: "Special Discount Offer",
    type: "segment",
    segment: "Frequent Buyers",
    recipients: 42,
    date: "2 weeks ago",
    preview: "As a valued customer, we're offering you a special discount...",
    opened: 38,
  },
]

const messageTemplates = [
  {
    id: "tmpl-001",
    name: "New Product Announcement",
    description: "Announce new products to customers",
    subject: "New Products Now Available",
    content:
      "Dear valued customer,\n\nWe're excited to announce that we have added new products to our catalog. Check them out on your next order!\n\nBest regards,\nYour Supplier Team",
    preview: "We're excited to announce that we have added new products to our catalog...",
  },
  {
    id: "tmpl-002",
    name: "Order Confirmation",
    description: "Confirm receipt of new orders",
    subject: "Your Order Has Been Received",
    content:
      "Dear valued customer,\n\nThank you for your order. We have received it and will process it shortly. You will receive another notification when your order is on its way.\n\nBest regards,\nYour Supplier Team",
    preview: "Thank you for your order. We have received it and will process it shortly...",
  },
  {
    id: "tmpl-003",
    name: "Special Offer",
    description: "Promotional offers and discounts",
    subject: "Special Offer Just For You",
    content:
      "Dear valued customer,\n\nAs a token of our appreciation, we're offering you a special discount on your next order. Use code SPECIAL10 for 10% off your next purchase.\n\nBest regards,\nYour Supplier Team",
    preview: "As a token of our appreciation, we're offering you a special discount on your next order...",
  },
]
