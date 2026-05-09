"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Menu, Star, StarHalf, StarOff } from "lucide-react";
import Link from "next/link";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function CustomerEngagementPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Customer Engagement</h1>
        </div>
      </header> */}
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Engagement Analytics
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                High Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8 Customers</div>
              <p className="text-xs text-muted-foreground">
                Order frequency: 2+ orders per week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Medium Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Customers</div>
              <p className="text-xs text-muted-foreground">
                Order frequency: 2-4 orders per month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Low Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Customers</div>
              <p className="text-xs text-muted-foreground">
                Order frequency: Less than 2 orders per month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>
              Breakdown of your customer base by engagement level
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {engagementDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ENGAGEMENT_COLORS[index % ENGAGEMENT_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} customers`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
            <CardDescription>
              Customer engagement trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer
              config={{
                high: {
                  label: "High Engagement",
                  color: "hsl(142, 76%, 36%)",
                },
                medium: {
                  label: "Medium Engagement",
                  color: "hsl(221, 83%, 53%)",
                },
                low: {
                  label: "Low Engagement",
                  color: "hsl(45, 93%, 47%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={engagementTrendsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="var(--color-high)"
                    name="High Engagement"
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke="var(--color-medium)"
                    name="Medium Engagement"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="var(--color-low)"
                    name="Low Engagement"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="high">
          <TabsList>
            <TabsTrigger value="high">High Engagement</TabsTrigger>
            <TabsTrigger value="medium">Medium Engagement</TabsTrigger>
            <TabsTrigger value="low">Low Engagement</TabsTrigger>
          </TabsList>
          <TabsContent value="high" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>High Engagement Customers</CardTitle>
                <CardDescription>
                  Customers with 2+ orders per week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders (Last 30 Days)</TableHead>
                      <TableHead>Avg. Order Value</TableHead>
                      <TableHead>Engagement Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersByEngagement.high.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.contact}</TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>
                          RWF {customer.avgOrderValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {renderEngagementScore(customer.engagementScore)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>High Engagement Insights</CardTitle>
                <CardDescription>Key metrics and opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Frequency
                      </p>
                      <p className="text-xl font-bold">9.2 orders/month</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Value
                      </p>
                      <p className="text-xl font-bold">RWF 285,000</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Customer Retention Rate
                      </p>
                      <p className="text-xl font-bold">98%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Opportunities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Implement a loyalty program for high-engagement customers
                    </li>
                    <li>Offer volume discounts on frequently ordered items</li>
                    <li>Provide early access to new products</li>
                    <li>
                      Schedule quarterly business reviews to strengthen
                      relationships
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="medium" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Medium Engagement Customers</CardTitle>
                <CardDescription>
                  Customers with 2-4 orders per month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders (Last 30 Days)</TableHead>
                      <TableHead>Avg. Order Value</TableHead>
                      <TableHead>Engagement Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersByEngagement.medium.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.contact}</TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>
                          RWF {customer.avgOrderValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {renderEngagementScore(customer.engagementScore)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Medium Engagement Insights</CardTitle>
                <CardDescription>
                  Key metrics and growth strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Frequency
                      </p>
                      <p className="text-xl font-bold">3.5 orders/month</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Value
                      </p>
                      <p className="text-xl font-bold">RWF 210,000</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Customer Retention Rate
                      </p>
                      <p className="text-xl font-bold">85%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Growth Strategies</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Implement targeted email campaigns highlighting
                      complementary products
                    </li>
                    <li>Offer incentives for increasing order frequency</li>
                    <li>
                      Schedule regular check-ins to understand changing needs
                    </li>
                    <li>
                      Provide educational content on inventory management best
                      practices
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="low" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Engagement Customers</CardTitle>
                <CardDescription>
                  Customers with less than 2 orders per month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders (Last 30 Days)</TableHead>
                      <TableHead>Avg. Order Value</TableHead>
                      <TableHead>Engagement Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersByEngagement.low.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.contact}</TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>
                          RWF {customer.avgOrderValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {renderEngagementScore(customer.engagementScore)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Low Engagement Insights</CardTitle>
                <CardDescription>
                  Reactivation strategies and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Frequency
                      </p>
                      <p className="text-xl font-bold">0.8 orders/month</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Average Order Value
                      </p>
                      <p className="text-xl font-bold">RWF 150,000</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Churn Risk
                      </p>
                      <p className="text-xl font-bold text-red-500">High</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Reactivation Strategies</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Conduct customer satisfaction surveys to identify pain
                      points
                    </li>
                    <li>Offer special promotions or discounts on next order</li>
                    <li>Personalized outreach from account manager</li>
                    <li>
                      Showcase new products or services that may better meet
                      their needs
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function renderEngagementScore(score: number) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />
      ))}
      {hasHalfStar && (
        <StarHalf className="h-4 w-4 fill-primary text-primary" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarOff key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      ))}
    </div>
  );
}

// Sample data
const ENGAGEMENT_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

const engagementDistributionData = [
  { name: "High Engagement", value: 8 },
  { name: "Medium Engagement", value: 15 },
  { name: "Low Engagement", value: 12 },
];

const engagementTrendsData = [
  { month: "Jan", high: 5, medium: 12, low: 15 },
  { month: "Feb", high: 6, medium: 13, low: 14 },
  { month: "Mar", high: 7, medium: 14, low: 13 },
  { month: "Apr", high: 7, medium: 15, low: 12 },
  { month: "May", high: 8, medium: 15, low: 12 },
];

const customersByEngagement = {
  high: [
    {
      id: "cust-001",
      name: "Bistro Bella",
      contact: "contact@bistrobella.com",
      orders: 10,
      avgOrderValue: 285000,
      engagementScore: 5,
    },
    {
      id: "cust-002",
      name: "Cafe Milano",
      contact: "orders@cafemilano.com",
      orders: 9,
      avgOrderValue: 320000,
      engagementScore: 4.5,
    },
    {
      id: "cust-003",
      name: "The Green Plate",
      contact: "info@greenplate.com",
      orders: 8,
      avgOrderValue: 275000,
      engagementScore: 4.5,
    },
  ],
  medium: [
    {
      id: "cust-004",
      name: "Spice Garden",
      contact: "orders@spicegarden.com",
      orders: 4,
      avgOrderValue: 210000,
      engagementScore: 3.5,
    },
    {
      id: "cust-006",
      name: "Ocean Delights",
      contact: "orders@oceandelights.com",
      orders: 3,
      avgOrderValue: 195000,
      engagementScore: 3,
    },
    {
      id: "cust-008",
      name: "Sunset Grill",
      contact: "info@sunsetgrill.com",
      orders: 2,
      avgOrderValue: 180000,
      engagementScore: 3,
    },
  ],
  low: [
    {
      id: "cust-005",
      name: "Taste of Asia",
      contact: "hello@tasteofasia.com",
      orders: 1,
      avgOrderValue: 150000,
      engagementScore: 2,
    },
    {
      id: "cust-007",
      name: "Urban Bites",
      contact: "contact@urbanbites.com",
      orders: 0,
      avgOrderValue: 0,
      engagementScore: 1,
    },
    {
      id: "cust-009",
      name: "Mountain View Restaurant",
      contact: "orders@mountainview.com",
      orders: 1,
      avgOrderValue: 125000,
      engagementScore: 1.5,
    },
  ],
};
