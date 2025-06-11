"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Download, CheckCircle2, Clock, Star, ArrowUp, ArrowDown } from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PerformancePage() {
  const [timeframe, setTimeframe] = useState("monthly")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Performance</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Performance Metrics</h1>
            <p className="text-muted-foreground">Track and improve your reliability and service quality</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reliability Score</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+3% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Order Fulfillment</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+1% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+0.2 from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Performance</TabsTrigger>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reliability"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        name="Reliability Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="onTimeDelivery"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="On-Time Delivery"
                      />
                      <Line
                        type="monotone"
                        dataKey="orderFulfillment"
                        stroke="#6366f1"
                        strokeWidth={2}
                        name="Order Fulfillment"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                  <CardDescription>Multi-dimensional performance view</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart outerRadius={90} data={performanceRadar}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Current" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                      <Radar
                        name="Previous"
                        dataKey="previousValue"
                        stroke="#6b7280"
                        fill="#6b7280"
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Detailed view of your performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{metric.name}</h3>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{metric.value}%</div>
                          <div
                            className={`flex items-center text-xs ${
                              metric.trend > 0
                                ? "text-green-600"
                                : metric.trend < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {metric.trend > 0 ? (
                              <ArrowUp className="mr-1 h-3 w-3" />
                            ) : metric.trend < 0 ? (
                              <ArrowDown className="mr-1 h-3 w-3" />
                            ) : null}
                            <span>
                              {metric.trend > 0 ? "+" : ""}
                              {metric.trend}% from last period
                            </span>
                          </div>
                        </div>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>On-Time Delivery Rate</CardTitle>
                  <CardDescription>Percentage of orders delivered on time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={deliveryTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="onTimeRate" stroke="#10b981" strokeWidth={2} name="On-Time Rate" />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#6b7280"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Issues</CardTitle>
                  <CardDescription>Breakdown of delivery problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deliveryIssues}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deliveryIssues.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Delivery Performance</CardTitle>
                <CardDescription>Detailed view of recent deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Actual Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.orderId}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell>{delivery.scheduledDate}</TableCell>
                          <TableCell>{delivery.actualDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                delivery.status === "On Time"
                                  ? "bg-green-50 text-green-700"
                                  : delivery.status === "Delayed"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }
                            >
                              {delivery.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{delivery.variance}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Quality Ratings</CardTitle>
                  <CardDescription>Average quality ratings by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={qualityRatings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[3, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rating" fill="#0ea5e9" name="Rating (out of 5)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Issues</CardTitle>
                  <CardDescription>Breakdown of reported quality issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualityIssues}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {qualityIssues.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics Trends</CardTitle>
                <CardDescription>Quality performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[3, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="freshness" stroke="#10b981" strokeWidth={2} name="Freshness" />
                    <Line type="monotone" dataKey="appearance" stroke="#0ea5e9" strokeWidth={2} name="Appearance" />
                    <Line type="monotone" dataKey="taste" stroke="#f59e0b" strokeWidth={2} name="Taste" />
                    <Line type="monotone" dataKey="packaging" stroke="#6366f1" strokeWidth={2} name="Packaging" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback Summary</CardTitle>
                <CardDescription>Overview of customer ratings and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Overall Rating</h3>
                    <div className="text-3xl font-bold">4.8/5</div>
                    <p className="text-sm text-muted-foreground mt-1">Based on 124 reviews</p>

                    <div className="space-y-2 mt-4">
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>5 Stars</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>4 Stars</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>3 Stars</span>
                          <span>2%</span>
                        </div>
                        <Progress value={2} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>2 Stars</span>
                          <span>1%</span>
                        </div>
                        <Progress value={1} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>1 Star</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Feedback Categories</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={feedbackCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {feedbackCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Feedback</CardTitle>
                <CardDescription>Latest reviews and comments from customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerFeedback.map((feedback) => (
                    <div key={feedback.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{feedback.customer}</h3>
                            <Badge
                              variant="outline"
                              className={
                                feedback.rating >= 4
                                  ? "bg-green-50 text-green-700"
                                  : feedback.rating >= 3
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }
                            >
                              {feedback.rating}/5
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.date}</p>
                        </div>
                        <Badge variant="outline">{feedback.category}</Badge>
                      </div>
                      <p className="mt-2">{feedback.comment}</p>
                      {feedback.response && (
                        <div className="mt-2 pl-4 border-l-2 border-muted">
                          <p className="text-sm font-medium">Your response:</p>
                          <p className="text-sm text-muted-foreground">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Feedback
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Sample data
const performanceTrends = [
  { period: "Jan", reliability: 85, onTimeDelivery: 82, orderFulfillment: 90 },
  { period: "Feb", reliability: 87, onTimeDelivery: 85, orderFulfillment: 92 },
  { period: "Mar", reliability: 88, onTimeDelivery: 88, orderFulfillment: 94 },
  { period: "Apr", reliability: 90, onTimeDelivery: 92, orderFulfillment: 96 },
  { period: "May", reliability: 92, onTimeDelivery: 94, orderFulfillment: 98 },
]

const performanceRadar = [
  { metric: "Reliability", value: 92, previousValue: 89 },
  { metric: "On-Time", value: 94, previousValue: 92 },
  { metric: "Fulfillment", value: 98, previousValue: 96 },
  { metric: "Quality", value: 95, previousValue: 93 },
  { metric: "Communication", value: 90, previousValue: 85 },
  { metric: "Responsiveness", value: 88, previousValue: 82 },
]

const performanceMetrics = [
  {
    id: "metric-1",
    name: "Reliability Score",
    description: "Overall reliability based on multiple factors",
    value: 92,
    trend: 3,
  },
  {
    id: "metric-2",
    name: "On-Time Delivery Rate",
    description: "Percentage of orders delivered on schedule",
    value: 94,
    trend: 2,
  },
  {
    id: "metric-3",
    name: "Order Fulfillment Rate",
    description: "Percentage of orders fulfilled completely",
    value: 98,
    trend: 1,
  },
  {
    id: "metric-4",
    name: "Product Quality Rating",
    description: "Average customer rating for product quality",
    value: 95,
    trend: 2,
  },
  {
    id: "metric-5",
    name: "Communication Score",
    description: "Rating for communication effectiveness",
    value: 90,
    trend: 5,
  },
  {
    id: "metric-6",
    name: "Issue Resolution Time",
    description: "Average time to resolve customer issues",
    value: 88,
    trend: 6,
  },
]

const deliveryTrends = [
  { period: "Week 1", onTimeRate: 90, target: 95 },
  { period: "Week 2", onTimeRate: 92, target: 95 },
  { period: "Week 3", onTimeRate: 91, target: 95 },
  { period: "Week 4", onTimeRate: 94, target: 95 },
  { period: "Week 5", onTimeRate: 93, target: 95 },
  { period: "Week 6", onTimeRate: 95, target: 95 },
  { period: "Week 7", onTimeRate: 94, target: 95 },
  { period: "Week 8", onTimeRate: 96, target: 95 },
]

const deliveryIssues = [
  { name: "Traffic Delays", value: 45 },
  { name: "Weather Conditions", value: 25 },
  { name: "Staff Shortages", value: 15 },
  { name: "Vehicle Issues", value: 10 },
  { name: "Other", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const recentDeliveries = [
  {
    id: "del-1",
    orderId: "ORD-7891",
    customer: "Bistro Bella",
    scheduledDate: "May 3, 2023 10:00 AM",
    actualDate: "May 3, 2023 10:15 AM",
    status: "On Time",
    variance: "+15 min",
  },
  {
    id: "del-2",
    orderId: "ORD-7892",
    customer: "Cafe Milano",
    scheduledDate: "May 3, 2023 11:30 AM",
    actualDate: "May 3, 2023 11:25 AM",
    status: "On Time",
    variance: "-5 min",
  },
  {
    id: "del-3",
    orderId: "ORD-7885",
    customer: "Bistro Bella",
    scheduledDate: "May 2, 2023 9:00 AM",
    actualDate: "May 2, 2023 9:45 AM",
    status: "Delayed",
    variance: "+45 min",
  },
  {
    id: "del-4",
    orderId: "ORD-7886",
    customer: "Cafe Milano",
    scheduledDate: "May 2, 2023 2:00 PM",
    actualDate: "May 2, 2023 2:10 PM",
    status: "On Time",
    variance: "+10 min",
  },
  {
    id: "del-5",
    orderId: "ORD-7887",
    customer: "The Green Plate",
    scheduledDate: "May 1, 2023 10:30 AM",
    actualDate: "May 1, 2023 12:15 PM",
    status: "Late",
    variance: "+1 hr 45 min",
  },
]

const qualityRatings = [
  { category: "Produce", rating: 4.8 },
  { category: "Meat & Poultry", rating: 4.7 },
  { category: "Dairy", rating: 4.9 },
  { category: "Dry Goods", rating: 4.6 },
  { category: "Seafood", rating: 4.5 },
]

const qualityIssues = [
  { name: "Freshness", value: 40 },
  { name: "Packaging", value: 25 },
  { name: "Size/Weight", value: 20 },
  { name: "Appearance", value: 10 },
  { name: "Other", value: 5 },
]

const qualityTrends = [
  { period: "Jan", freshness: 4.5, appearance: 4.3, taste: 4.6, packaging: 4.2 },
  { period: "Feb", freshness: 4.6, appearance: 4.4, taste: 4.6, packaging: 4.3 },
  { period: "Mar", freshness: 4.7, appearance: 4.5, taste: 4.7, packaging: 4.4 },
  { period: "Apr", freshness: 4.8, appearance: 4.6, taste: 4.8, packaging: 4.5 },
  { period: "May", freshness: 4.9, appearance: 4.7, taste: 4.8, packaging: 4.6 },
]

const feedbackCategories = [
  { name: "Product Quality", value: 45 },
  { name: "Delivery", value: 30 },
  { name: "Customer Service", value: 15 },
  { name: "Pricing", value: 10 },
]

const customerFeedback = [
  {
    id: "feedback-1",
    customer: "Bistro Bella",
    rating: 5,
    date: "May 3, 2023",
    category: "Product Quality",
    comment:
      "The produce we received was exceptionally fresh. Our chefs were very impressed with the quality of the tomatoes and herbs in particular.",
    response: "Thank you for your kind feedback! We're glad your chefs are happy with our produce quality.",
  },
  {
    id: "feedback-2",
    customer: "Cafe Milano",
    rating: 4,
    date: "May 2, 2023",
    category: "Delivery",
    comment:
      "Delivery was on time and the driver was very professional. The only issue was that one box was slightly damaged, but the contents were fine.",
    response:
      "Thank you for letting us know about the damaged box. We'll make sure our team takes extra care with packaging in the future.",
  },
  {
    id: "feedback-3",
    customer: "The Green Plate",
    rating: 3,
    date: "May 1, 2023",
    category: "Delivery",
    comment:
      "The delivery was significantly delayed which caused some issues with our prep schedule. The quality was good as always, but timeliness needs improvement.",
    response:
      "We sincerely apologize for the delay and the impact it had on your operations. We're reviewing our delivery routes to prevent this from happening again.",
  },
  {
    id: "feedback-4",
    customer: "Spice Garden",
    rating: 5,
    date: "April 30, 2023",
    category: "Customer Service",
    comment:
      "Your team was extremely responsive when we needed to make a last-minute change to our order. The flexibility and service were outstanding.",
    response: null,
  },
]
