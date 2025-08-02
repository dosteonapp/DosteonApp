"use client";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, CalendarIcon, Menu, Plus, ShoppingCart } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

export default function ScheduleOrdersPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    addDays(new Date(), 2)
  );
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [enableReminder, setEnableReminder] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

  // Dates with scheduled orders
  const scheduledDates = [
    addDays(new Date(), 3),
    addDays(new Date(), 7),
    addDays(new Date(), 10),
  ];

  // Suggested reorder dates based on history
  const suggestedDates = [
    {
      date: addDays(new Date(), 2),
      supplier: "Fresh Farms Inc.",
      reason: "Based on your weekly order pattern",
    },
    {
      date: addDays(new Date(), 5),
      supplier: "Metro Meats",
      reason: "Based on your bi-weekly order pattern",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Schedule Orders</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Schedule Orders
            </h1>
            <p className="text-muted-foreground">
              Plan your future deliveries up to 14 days ahead
            </p>
          </div>
          <Button asChild>
            <a href="/dashboard/orders/new">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </a>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Select a date to schedule your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => {
                    // Disable dates in the past and more than 14 days in the future
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const twoWeeksLater = addDays(today, 14);
                    return date < today || date > twoWeeksLater;
                  }}
                  modifiers={{
                    scheduled: scheduledDates,
                    suggested: suggestedDates.map((s) => s.date),
                  }}
                  modifiersClassNames={{
                    scheduled: "border border-primary",
                    suggested: "border border-dashed border-secondary",
                  }}
                  components={{
                    DayContent: (props) => {
                      const isScheduled = scheduledDates.some((date) =>
                        isSameDay(date, props.date)
                      );

                      const isSuggested = suggestedDates.some((suggestion) =>
                        isSameDay(suggestion.date, props.date)
                      );

                      return (
                        <div className="relative h-9 w-9 p-0 font-normal aria-selected:opacity-100">
                          <div className="flex h-full w-full items-center justify-center">
                            {props.day}
                          </div>
                          {isScheduled && (
                            <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                          )}
                          {isSuggested && !isScheduled && (
                            <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary" />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-xs">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <span className="text-xs">Suggested</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggested Reorder Dates</CardTitle>
                <CardDescription>Based on your order history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedDates.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {format(suggestion.date, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.supplier}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDate(suggestion.date);
                          setSelectedSupplier(suggestion.supplier);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Schedule Details</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `For ${format(selectedDate, "EEEE, MMMM d, yyyy")}`
                    : "Select a date on the calendar"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select
                        value={selectedSupplier}
                        onValueChange={setSelectedSupplier}
                      >
                        <SelectTrigger id="supplier">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fresh Farms Inc.">
                            Fresh Farms Inc.
                          </SelectItem>
                          <SelectItem value="Metro Meats">
                            Metro Meats
                          </SelectItem>
                          <SelectItem value="Global Grocers">
                            Global Grocers
                          </SelectItem>
                          <SelectItem value="Organic Supplies Co.">
                            Organic Supplies Co.
                          </SelectItem>
                          <SelectItem value="Dairy Delights">
                            Dairy Delights
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-slot">Preferred Time Slot</Label>
                      <Select
                        value={selectedTimeSlot}
                        onValueChange={setSelectedTimeSlot}
                      >
                        <SelectTrigger id="time-slot">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (8:00 AM - 12:00 PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (12:00 PM - 4:00 PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            Evening (4:00 PM - 8:00 PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="order-template">Order Template</Label>
                      <Select>
                        <SelectTrigger id="order-template">
                          <SelectValue placeholder="Select a template or create new" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly-produce">
                            Weekly Produce Order
                          </SelectItem>
                          <SelectItem value="bi-weekly-meat">
                            Bi-weekly Meat Order
                          </SelectItem>
                          <SelectItem value="monthly-dry-goods">
                            Monthly Dry Goods
                          </SelectItem>
                          <SelectItem value="new">
                            <div className="flex items-center">
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Template
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="reminder"
                        checked={enableReminder}
                        onCheckedChange={setEnableReminder}
                      />
                      <Label
                        htmlFor="reminder"
                        className="flex items-center gap-1"
                      >
                        <Bell className="h-4 w-4" />
                        Send reminder 2 days before
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any special instructions or notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Select a date on the calendar to schedule an order
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={
                    !selectedDate || !selectedSupplier || !selectedTimeSlot
                  }
                >
                  Schedule Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Scheduled Orders</CardTitle>
            <CardDescription>
              View and manage your scheduled orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4">
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Date
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Supplier
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Time Slot
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: "sched-1",
                            date: "May 5, 2023",
                            supplier: "Fresh Farms Inc.",
                            timeSlot: "Morning (8:00 AM - 12:00 PM)",
                            status: "Confirmed",
                          },
                          {
                            id: "sched-2",
                            date: "May 7, 2023",
                            supplier: "Metro Meats",
                            timeSlot: "Afternoon (12:00 PM - 4:00 PM)",
                            status: "Pending",
                          },
                          {
                            id: "sched-3",
                            date: "May 10, 2023",
                            supplier: "Dairy Delights",
                            timeSlot: "Morning (8:00 AM - 12:00 PM)",
                            status: "Pending",
                          },
                        ].map((order) => (
                          <tr
                            key={order.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">{order.date}</td>
                            <td className="p-4 align-middle">
                              {order.supplier}
                            </td>
                            <td className="p-4 align-middle">
                              {order.timeSlot}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge
                                variant={
                                  order.status === "Confirmed"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Date
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Supplier
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Time Slot
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: "sched-4",
                            date: "April 28, 2023",
                            supplier: "Global Grocers",
                            timeSlot: "Morning (8:00 AM - 12:00 PM)",
                            status: "Delivered",
                          },
                          {
                            id: "sched-5",
                            date: "April 21, 2023",
                            supplier: "Fresh Farms Inc.",
                            timeSlot: "Afternoon (12:00 PM - 4:00 PM)",
                            status: "Delivered",
                          },
                        ].map((order) => (
                          <tr
                            key={order.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">{order.date}</td>
                            <td className="p-4 align-middle">
                              {order.supplier}
                            </td>
                            <td className="p-4 align-middle">
                              {order.timeSlot}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="success">{order.status}</Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
