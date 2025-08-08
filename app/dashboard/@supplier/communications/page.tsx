"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  MessageSquare,
  Phone,
  Send,
  Users,
  Bell,
  Search,
  CheckCheck,
  Plus,
  ChevronRight,
  MessageCircle,
  FileText,
  ImageIcon,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommunicationsPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("chat-1");
  const [messageText, setMessageText] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, this would send the message to the API
    console.log("Sending message:", messageText);
    setMessageText("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Communications</h1>
        </div>
      </header> */}
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Communication Hub
            </h1>
            <p className="text-muted-foreground">
              Manage all your customer communications in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/communications/settings">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/communications/broadcast">
                <MessageSquare className="mr-2 h-4 w-4" />
                New Broadcast
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-7">
              {/* Chat List */}
              <Card className="md:col-span-2">
                <CardHeader className="px-4 py-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search conversations..."
                      className="pl-8"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[calc(100vh-250px)] overflow-y-auto">
                  <div className="space-y-0.5">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                          selectedChat === chat.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedChat(chat.id)}
                      >
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40`}
                            alt={chat.name}
                          />
                          <AvatarFallback>
                            {chat.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {chat.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessageTime}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {chat.type}
                            </Badge>
                            {chat.unread > 0 && (
                              <Badge className="text-xs">{chat.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="md:col-span-5">
                {selectedChat ? (
                  <>
                    <CardHeader className="px-6 py-3 border-b flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40`}
                            alt={chats.find((c) => c.id === selectedChat)?.name}
                          />
                          <AvatarFallback>
                            {chats
                              .find((c) => c.id === selectedChat)
                              ?.name.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {chats.find((c) => c.id === selectedChat)?.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {chats.find((c) => c.id === selectedChat)?.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last active:{" "}
                              {
                                chats.find((c) => c.id === selectedChat)
                                  ?.lastActive
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex flex-col h-[calc(100vh-350px)] justify-between">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages
                            .filter((m) => m.chatId === selectedChat)
                            .map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  message.sender === "me"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    message.sender === "me"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p>{message.text}</p>
                                  <div
                                    className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                      message.sender === "me"
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {message.time}
                                    {message.sender === "me" && (
                                      <CheckCheck className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="p-4 border-t">
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Textarea
                                placeholder="Type your message..."
                                className="min-h-[80px] resize-none"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="ghost" size="sm">
                                  <Paperclip className="h-4 w-4 mr-1" />
                                  Attach
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  Image
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Template
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageText.trim()}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-[calc(100vh-250px)]">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">
                        No conversation selected
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        Select a conversation from the list to start messaging
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Message Templates</h2>
              <div className="flex items-center gap-2">
                <Select
                  value={templateFilter}
                  onValueChange={setTemplateFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter templates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="order">Order Templates</SelectItem>
                    <SelectItem value="payment">Payment Templates</SelectItem>
                    <SelectItem value="delivery">Delivery Templates</SelectItem>
                    <SelectItem value="general">General Templates</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {messageTemplates
                .filter(
                  (template) =>
                    templateFilter === "all" ||
                    template.category === templateFilter
                )
                .map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {template.content}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        <span className="font-medium">Variables: </span>
                        {template.variables.join(", ")}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button size="sm">Use Template</Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="broadcasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Broadcasts</CardTitle>
                <CardDescription>
                  Messages sent to multiple customers at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <h3 className="font-medium">{broadcast.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {broadcast.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {broadcast.recipients} recipients
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              broadcast.status === "Sent"
                                ? "bg-green-50 text-green-700"
                                : broadcast.status === "Scheduled"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }
                          >
                            {broadcast.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{broadcast.date}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {broadcast.openRate}% open rate
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          View Report
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/communications/broadcast">
                    <Plus className="h-4 w-4 mr-2" />
                    New Broadcast
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you notify your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="border-b pb-6 last:border-0 last:pb-0"
                    >
                      <h3 className="font-medium text-lg">{setting.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {setting.description}
                      </p>

                      <div className="grid gap-4 mt-4 md:grid-cols-2">
                        {setting.channels.map((channel) => (
                          <div
                            key={channel.id}
                            className="flex items-start gap-3 p-3 border rounded-md"
                          >
                            <div className="mt-0.5">
                              {channel.type === "email" ? (
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                              ) : channel.type === "sms" ? (
                                <MessageCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Bell className="h-5 w-5 text-amber-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{channel.name}</h4>
                                <Badge
                                  variant="outline"
                                  className={
                                    channel.enabled
                                      ? "bg-green-50 text-green-700"
                                      : ""
                                  }
                                >
                                  {channel.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {channel.description}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Configure
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Sample data
const chats = [
  {
    id: "chat-1",
    name: "Bistro Bella",
    type: "Restaurant",
    lastMessage:
      "Thank you for confirming the delivery time. We'll be ready to receive the order.",
    lastMessageTime: "10:30 AM",
    unread: 0,
    lastActive: "Today at 10:30 AM",
  },
  {
    id: "chat-2",
    name: "Cafe Milano",
    type: "Restaurant",
    lastMessage:
      "Can we adjust our standing order for next week? We need to increase the quantity of tomatoes.",
    lastMessageTime: "Yesterday",
    unread: 2,
    lastActive: "Yesterday at 4:15 PM",
  },
  {
    id: "chat-3",
    name: "The Green Plate",
    type: "Restaurant",
    lastMessage: "Our payment has been processed. Please confirm receipt.",
    lastMessageTime: "May 1",
    unread: 0,
    lastActive: "May 1 at 2:45 PM",
  },
  {
    id: "chat-4",
    name: "Spice Garden",
    type: "Restaurant",
    lastMessage:
      "We're experiencing a delay with our bank transfer. Can we discuss payment options?",
    lastMessageTime: "Apr 29",
    unread: 0,
    lastActive: "Apr 29 at 11:20 AM",
  },
  {
    id: "chat-5",
    name: "Taste of Asia",
    type: "Restaurant",
    lastMessage:
      "The quality of your produce has been exceptional lately. Thank you for maintaining such high standards.",
    lastMessageTime: "Apr 28",
    unread: 0,
    lastActive: "Apr 28 at 3:10 PM",
  },
];

const messages = [
  {
    chatId: "chat-1",
    sender: "them",
    text: "Hello, I wanted to confirm our delivery for tomorrow. Are you still on schedule for the 10 AM delivery?",
    time: "10:15 AM",
  },
  {
    chatId: "chat-1",
    sender: "me",
    text: "Hi there! Yes, we're on schedule for tomorrow's delivery at 10 AM. Our driver will call you about 30 minutes before arrival.",
    time: "10:20 AM",
  },
  {
    chatId: "chat-1",
    sender: "them",
    text: "Perfect, thank you for confirming. We'll be ready to receive the order.",
    time: "10:30 AM",
  },
  {
    chatId: "chat-2",
    sender: "them",
    text: "Good afternoon, I hope you're doing well. We need to discuss our order for next week.",
    time: "Yesterday, 3:45 PM",
  },
  {
    chatId: "chat-2",
    sender: "them",
    text: "Can we adjust our standing order for next week? We need to increase the quantity of tomatoes.",
    time: "Yesterday, 3:47 PM",
  },
  {
    chatId: "chat-3",
    sender: "them",
    text: "Hello, I wanted to let you know that our payment for invoice #INV-003 has been processed. Please confirm receipt when you can.",
    time: "May 1, 2:30 PM",
  },
  {
    chatId: "chat-3",
    sender: "me",
    text: "Thank you for the update. I've checked our system and can confirm that we've received your payment for invoice #INV-003. The receipt has been emailed to you.",
    time: "May 1, 2:45 PM",
  },
];

const messageTemplates = [
  {
    id: "template-1",
    name: "Order Confirmation",
    category: "order",
    description:
      "Confirm that an order has been received and is being processed",
    content:
      "Dear {{customer_name}}, we've received your order #{{order_id}} and are processing it now. Your estimated delivery date is {{delivery_date}}. Thank you for your business!",
    variables: ["customer_name", "order_id", "delivery_date"],
  },
  {
    id: "template-2",
    name: "Delivery Notification",
    category: "delivery",
    description: "Notify customer that their order is out for delivery",
    content:
      "Hello {{customer_name}}, your order #{{order_id}} is out for delivery and should arrive between {{delivery_time_start}} and {{delivery_time_end}}. Our driver will call you shortly before arrival.",
    variables: [
      "customer_name",
      "order_id",
      "delivery_time_start",
      "delivery_time_end",
    ],
  },
  {
    id: "template-3",
    name: "Payment Reminder",
    category: "payment",
    description: "Remind customer about an upcoming or overdue payment",
    content:
      "Dear {{customer_name}}, this is a friendly reminder that payment for invoice #{{invoice_id}} in the amount of {{amount}} is due on {{due_date}}. Please let us know if you have any questions.",
    variables: ["customer_name", "invoice_id", "amount", "due_date"],
  },
  {
    id: "template-4",
    name: "Payment Received",
    category: "payment",
    description: "Confirm receipt of payment",
    content:
      "Thank you, {{customer_name}}! We've received your payment of {{amount}} for invoice #{{invoice_id}}. Your receipt has been emailed to you at {{email}}.",
    variables: ["customer_name", "amount", "invoice_id", "email"],
  },
  {
    id: "template-5",
    name: "New Product Announcement",
    category: "general",
    description: "Announce new products to customers",
    content:
      "Hello {{customer_name}}, we're excited to announce that we've added {{product_name}} to our catalog! It's available for ordering now at {{price}} per {{unit}}. Let us know if you'd like to add it to your next order.",
    variables: ["customer_name", "product_name", "price", "unit"],
  },
  {
    id: "template-6",
    name: "Order Delay",
    category: "delivery",
    description: "Notify customer about a delay in their order",
    content:
      "Dear {{customer_name}}, we regret to inform you that your order #{{order_id}} will be delayed by approximately {{delay_time}}. We apologize for any inconvenience and will keep you updated on its status.",
    variables: ["customer_name", "order_id", "delay_time"],
  },
];

const broadcasts = [
  {
    id: "broadcast-1",
    title: "Holiday Schedule Update",
    message:
      "Dear valued customers, please note our adjusted delivery schedule for the upcoming holiday weekend. We will not be making deliveries on Monday, May 29th. Please plan your orders accordingly.",
    date: "May 1, 2023",
    recipients: 24,
    status: "Sent",
    openRate: 92,
  },
  {
    id: "broadcast-2",
    title: "New Seasonal Products Available",
    message:
      "Exciting news! Our summer seasonal products are now available for ordering. Check out our fresh berries, watermelons, and specialty herbs - all locally sourced and at peak freshness.",
    date: "April 15, 2023",
    recipients: 24,
    status: "Sent",
    openRate: 88,
  },
  {
    id: "broadcast-3",
    title: "Price Update Notification",
    message:
      "Due to recent supply chain challenges, we've had to adjust prices on select items effective June 1st. Please review the attached price list for details. We appreciate your understanding.",
    date: "May 15, 2023",
    recipients: 24,
    status: "Scheduled",
    openRate: 0,
  },
  {
    id: "broadcast-4",
    title: "System Maintenance Notice",
    message:
      "Our ordering system will be undergoing maintenance this Saturday from 11 PM to 2 AM. During this time, you may experience brief interruptions when placing orders online.",
    date: "April 10, 2023",
    recipients: 24,
    status: "Sent",
    openRate: 75,
  },
];

const notificationSettings = [
  {
    id: "notification-1",
    name: "Order Notifications",
    description:
      "Notifications related to new orders, order updates, and order status changes",
    channels: [
      {
        id: "channel-1",
        name: "Email Notifications",
        type: "email",
        description:
          "Send order confirmations, updates, and status changes via email",
        enabled: true,
      },
      {
        id: "channel-2",
        name: "WhatsApp Notifications",
        type: "whatsapp",
        description: "Send real-time order updates via WhatsApp",
        enabled: true,
      },
      {
        id: "channel-3",
        name: "SMS Notifications",
        type: "sms",
        description: "Send order confirmations and critical updates via SMS",
        enabled: false,
      },
    ],
  },
  {
    id: "notification-2",
    name: "Payment Notifications",
    description:
      "Notifications related to payments, invoices, and financial transactions",
    channels: [
      {
        id: "channel-4",
        name: "Email Notifications",
        type: "email",
        description:
          "Send payment confirmations, invoices, and receipts via email",
        enabled: true,
      },
      {
        id: "channel-5",
        name: "WhatsApp Notifications",
        type: "whatsapp",
        description: "Send payment reminders and confirmations via WhatsApp",
        enabled: true,
      },
      {
        id: "channel-6",
        name: "SMS Notifications",
        type: "sms",
        description: "Send payment reminders and confirmations via SMS",
        enabled: true,
      },
    ],
  },
  {
    id: "notification-3",
    name: "Delivery Notifications",
    description:
      "Notifications related to deliveries, shipments, and logistics",
    channels: [
      {
        id: "channel-7",
        name: "Email Notifications",
        type: "email",
        description: "Send delivery schedules and confirmations via email",
        enabled: true,
      },
      {
        id: "channel-8",
        name: "WhatsApp Notifications",
        type: "whatsapp",
        description: "Send real-time delivery updates via WhatsApp",
        enabled: true,
      },
      {
        id: "channel-9",
        name: "SMS Notifications",
        type: "sms",
        description: "Send delivery confirmations and ETAs via SMS",
        enabled: false,
      },
    ],
  },
];
