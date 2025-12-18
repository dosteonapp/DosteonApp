"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  Flag,
  ImageIcon,
  Menu,
  Paperclip,
  Send,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function SupplierChatPage({
  params,
}: {
  params: { id: string };
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [isUrgent, setIsUrgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find supplier based on ID
  const supplier = suppliers.find((s) => s.id === params.id) || suppliers[0];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg-${messages.length + 1}`,
      content: message,
      sender: "restaurant",
      timestamp: new Date(),
      isUrgent,
      attachments: [],
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    setIsUrgent(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Chat with Supplier</h1>
        </div>
      </header> */}
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dahboard/suppliers/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Supplier
              </Link>
            </Button>
          </div>

          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={supplier.logo || "/placeholder.svg"}
                  alt={supplier.name}
                />
                <AvatarFallback>
                  {supplier.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{supplier.name}</CardTitle>
                <CardDescription>
                  {supplier.online ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                      Offline - Last seen 2 hours ago
                    </span>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center text-sm text-muted-foreground py-2">
                <span>Today</span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "restaurant"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === "restaurant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.isUrgent && (
                      <Badge variant="destructive" className="mb-2">
                        Urgent
                      </Badge>
                    )}
                    {msg.orderId && (
                      <Badge variant="outline" className="mb-2 bg-background">
                        Order #{msg.orderId}
                      </Badge>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {msg.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-md overflow-hidden"
                          >
                            <img
                              src={attachment || "/placeholder.svg"}
                              alt="Attachment"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "restaurant"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(msg.timestamp, "h:mm a")}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isUrgent ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsUrgent(!isUrgent)}
                    className="ml-auto"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {isUrgent ? "Urgent" : "Mark as Urgent"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Types
interface Message {
  id: string;
  content: string;
  sender: "restaurant" | "supplier";
  timestamp: Date;
  isUrgent?: boolean;
  orderId?: string;
  attachments?: string[];
}

// Sample data
const suppliers = [
  {
    id: "supplier-1",
    name: "Fresh Farms Inc.",
    logo: "/placeholder.svg?height=40&width=40",
    online: true,
  },
  {
    id: "supplier-2",
    name: "Metro Meats",
    logo: "/placeholder.svg?height=40&width=40",
    online: false,
  },
];

const sampleMessages: Message[] = [
  {
    id: "msg-1",
    content:
      "Good morning! I wanted to check if our order #ORD-7891 is confirmed for delivery tomorrow?",
    sender: "restaurant",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 3)),
    orderId: "ORD-7891",
  },
  {
    id: "msg-2",
    content:
      "Good morning! Yes, your order #ORD-7891 is confirmed and scheduled for delivery tomorrow between 9:00 AM and 12:00 PM.",
    sender: "supplier",
    timestamp: new Date(
      new Date().setHours(
        new Date().getHours() - 3,
        new Date().getMinutes() - 5
      )
    ),
    orderId: "ORD-7891",
  },
  {
    id: "msg-3",
    content:
      "Great, thank you! Could we request delivery closer to 9:00 AM if possible? We have a large event tomorrow.",
    sender: "restaurant",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
  },
  {
    id: "msg-4",
    content:
      "I'll check with our delivery team and try to prioritize your delivery for early morning. I'll update you once confirmed.",
    sender: "supplier",
    timestamp: new Date(
      new Date().setHours(
        new Date().getHours() - 2,
        new Date().getMinutes() - 5
      )
    ),
  },
  {
    id: "msg-5",
    content:
      "We've had some issues with the quality of tomatoes in our last few orders. They're ripening too quickly. Could you ensure we get fresher ones this time?",
    sender: "restaurant",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
    attachments: ["/placeholder.svg?height=200&width=200"],
  },
  {
    id: "msg-6",
    content:
      "I apologize for the quality issues. I've noted your concern and will personally inspect the tomatoes before they're sent out. We'll make sure you receive the freshest produce available.",
    sender: "supplier",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 45)),
  },
  {
    id: "msg-7",
    content: "Thank you, I appreciate your attention to this matter.",
    sender: "restaurant",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
  },
];
