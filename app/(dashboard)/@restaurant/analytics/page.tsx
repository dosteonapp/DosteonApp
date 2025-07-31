"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Menu,
  Download,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Leaf,
  Droplet,
  Recycle,
  FileText,
} from "lucide-react"
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
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DailyReportsModal } from "@/components/daily-reports-modal"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [esgTimeRange, setEsgTimeRange] = useState("3months")
  const [reportsModalOpen, setReportsModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 md:hidden">
        <Menu className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track consumption, wastage, and predict restocking needs</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1" onClick={() => setReportsModalOpen(true)}>
              <FileText className="h-4 w-4" />
              Daily Reports
            </Button>
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="consumption">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="consumption">Consumption</TabsTrigger>
            <TabsTrigger value="wastage">Wastage</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="esg">ESG Metrics</TabsTrigger>
            <TabsTrigger value="savings">Cost Savings</TabsTrigger>
          </TabsList>

          {/* Consumption Trends Tab */}
          <TabsContent value="consumption" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Daily Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32.5 kg</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last period</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Weekly Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">227.5 kg</div>
                  <p className="text-xs text-muted-foreground">+1.8% from last period</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Most Consumed Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Tomatoes</div>
                  <p className="text-xs text-muted-foreground">45.2 kg this month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Fastest Growing Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Chicken</div>
                  <p className="text-xs text-muted-foreground">+12.3% this month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Consumption Trends by Category</CardTitle>
                <CardDescription>Track your inventory usage patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    produce: {
                      label: "Produce",
                      color: "hsl(var(--primary))",
                    },
                    meat: {
                      label: "Meat & Poultry",
                      color: "hsl(var(--secondary))",
                    },
                    dairy: {
                      label: "Dairy",
                      color: "hsl(var(--chart-3))",
                    },
                    dryGoods: {
                      label: "Dry Goods",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={consumptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="produce" stroke="var(--color-produce)" name="Produce" />
                      <Line type="monotone" dataKey="meat" stroke="var(--color-meat)" name="Meat & Poultry" />
                      <Line type="monotone" dataKey="dairy" stroke="var(--color-dairy)" name="Dairy" />
                      <Line type="monotone" dataKey="dryGoods" stroke="var(--color-dryGoods)" name="Dry Goods" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Supplier-Based Cost Efficiency</CardTitle>
                  <CardDescription>Compare supplier costs for the same items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costEfficiencyData.map((item) => (
                      <div key={item.item} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.item}</span>
                          <span className="text-sm text-muted-foreground">
                            Avg: RWF {item.avgPrice.toLocaleString()}/{item.unit}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {item.suppliers.map((supplier) => (
                            <div key={supplier.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{supplier.name}</span>
                                {supplier.price < item.avgPrice * 0.9 && (
                                  <Badge variant="outline" className="bg-secondary-50 text-secondary border-secondary">
                                    <TrendingDown className="mr-1 h-3 w-3" />
                                    Best Price
                                  </Badge>
                                )}
                                {supplier.price > item.avgPrice * 1.1 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-destructive-50 text-destructive border-destructive"
                                  >
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    High Price
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                RWF {supplier.price.toLocaleString()}
                                <Button variant="ghost" size="sm" className="ml-2 h-6 px-2 text-primary">
                                  Order
                                </Button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/restaurant/suppliers">View All Suppliers</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consumption by Time of Day</CardTitle>
                  <CardDescription>When your inventory is most used</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      morning: {
                        label: "Morning (6am-12pm)",
                        color: "hsl(var(--chart-1))",
                      },
                      afternoon: {
                        label: "Afternoon (12pm-5pm)",
                        color: "hsl(var(--chart-2))",
                      },
                      evening: {
                        label: "Evening (5pm-10pm)",
                        color: "hsl(var(--chart-3))",
                      },
                      night: {
                        label: "Night (10pm-6am)",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeOfDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="morning" fill="var(--color-morning)" name="Morning" />
                        <Bar dataKey="afternoon" fill="var(--color-afternoon)" name="Afternoon" />
                        <Bar dataKey="evening" fill="var(--color-evening)" name="Evening" />
                        <Bar dataKey="night" fill="var(--color-night)" name="Night" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wastage Tab */}
          <TabsContent value="wastage" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-destructive-50 to-white border-destructive-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Wastage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32.8 kg</div>
                  <p className="text-xs text-muted-foreground">-5.2% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-destructive-50 to-white border-destructive-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Wastage Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 78,500</div>
                  <p className="text-xs text-muted-foreground">-3.8% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Most Wasted Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Lettuce</div>
                  <p className="text-xs text-muted-foreground">8.2 kg this month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Wastage Reduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.3%</div>
                  <p className="text-xs text-muted-foreground">Since using Dosteon</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Wastage Trends</CardTitle>
                <CardDescription>Track your food waste over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  config={{
                    expired: {
                      label: "Expired",
                      color: "hsl(var(--destructive))",
                    },
                    overproduction: {
                      label: "Overproduction",
                      color: "hsl(var(--warning))",
                    },
                    damaged: {
                      label: "Damaged",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={wastageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="expired" stroke="var(--color-expired)" name="Expired" />
                      <Line
                        type="monotone"
                        dataKey="overproduction"
                        stroke="var(--color-overproduction)"
                        name="Overproduction"
                      />
                      <Line type="monotone" dataKey="damaged" stroke="var(--color-damaged)" name="Damaged" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Wastage by Category</CardTitle>
                  <CardDescription>Which categories generate the most waste</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wastageByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {wastageByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value} kg`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wastage Reduction Opportunities</CardTitle>
                  <CardDescription>Items with highest potential for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wastageOpportunities.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-destructive font-medium">
                            {item.wastage} kg / RWF {item.cost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.reason}</span>
                          <span className="text-secondary font-medium">Save up to {item.potentialSavings}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Adjust Order Quantity
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Storage Tips
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Recommendations
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Items Needing Restock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Within next 7 days</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-destructive-50 to-white border-destructive-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stockouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Within next 48 hours</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Forecasted Demand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">Next week vs. current</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Optimal Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 245,000</div>
                  <p className="text-xs text-muted-foreground">For next week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Predicted Stockout Dates</CardTitle>
                <CardDescription>When you'll need to reorder based on current usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Daily Usage</TableHead>
                        <TableHead>Stockout Date</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictedStockouts.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell>
                            {item.dailyUsage} {item.unit}
                          </TableCell>
                          <TableCell>{item.stockoutDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  item.daysLeft <= 2 ? "destructive" : item.daysLeft <= 5 ? "warning" : "secondary"
                                }
                              >
                                {item.daysLeft} days
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="h-8">
                              Order Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Demand Forecast</CardTitle>
                  <CardDescription>Predicted usage for next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      actual: {
                        label: "Actual Usage",
                        color: "hsl(var(--primary))",
                      },
                      predicted: {
                        label: "Predicted Usage",
                        color: "hsl(var(--primary-light))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={demandForecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="var(--color-actual)"
                          strokeWidth={2}
                          name="Actual Usage"
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="var(--color-predicted)"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          name="Predicted Usage"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Trends</CardTitle>
                  <CardDescription>How your inventory needs change throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      produce: {
                        label: "Produce",
                        color: "hsl(var(--primary))",
                      },
                      meat: {
                        label: "Meat & Poultry",
                        color: "hsl(var(--secondary))",
                      },
                      dairy: {
                        label: "Dairy",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={seasonalTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="produce" stroke="var(--color-produce)" name="Produce" />
                        <Line type="monotone" dataKey="meat" stroke="var(--color-meat)" name="Meat & Poultry" />
                        <Line type="monotone" dataKey="dairy" stroke="var(--color-dairy)" name="Dairy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Smart Reorder Recommendations</CardTitle>
                <CardDescription>Optimized order quantities based on your usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reorderRecommendations.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last ordered: {item.lastOrdered} • Supplier: {item.supplier}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
                            <Calendar className="mr-1 h-3 w-3" />
                            Order by {item.orderBy}
                          </Badge>
                          {item.priceChange && (
                            <Badge
                              variant="outline"
                              className={
                                item.priceChange > 0
                                  ? "bg-destructive-50 text-destructive border-destructive"
                                  : "bg-secondary-50 text-secondary border-secondary"
                              }
                            >
                              {item.priceChange > 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3" />
                              ) : (
                                <TrendingDown className="mr-1 h-3 w-3" />
                              )}
                              {item.priceChange > 0 ? "+" : ""}
                              {item.priceChange}% price change
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          Recommended: {item.recommendedQty} {item.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Est. cost: RWF {item.estimatedCost.toLocaleString()}
                        </div>
                        <Button size="sm" className="mt-2 bg-primary hover:bg-primary-600">
                          One-Tap Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Recommendations
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ESG Metrics Tab */}
          <TabsContent value="esg" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold">Environmental, Social & Governance Metrics</h2>
                <p className="text-sm text-muted-foreground">Track your restaurant's sustainability impact</p>
              </div>
              <Select value={esgTimeRange} onValueChange={setEsgTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last month</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Leaf className="mr-2 h-4 w-4 text-secondary" />
                    Carbon Footprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,245 kg CO₂e</div>
                  <p className="text-xs text-muted-foreground">-8.5% from previous period</p>
                  <Progress value={65} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">65% of your sustainability goal</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Droplet className="mr-2 h-4 w-4 text-secondary" />
                    Water Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28,500 liters</div>
                  <p className="text-xs text-muted-foreground">-3.2% from previous period</p>
                  <Progress value={42} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">42% of your sustainability goal</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Recycle className="mr-2 h-4 w-4 text-secondary" />
                    Waste Diverted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+5.3% from previous period</p>
                  <Progress value={78} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">78% of your sustainability goal</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ESG Indicators by Transaction</CardTitle>
                <CardDescription>Tracking sustainability metrics across your supply chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Food Miles</TableHead>
                        <TableHead>Packaging</TableHead>
                        <TableHead>Local Sourcing</TableHead>
                        <TableHead>Certifications</TableHead>
                        <TableHead>Overall Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {esgIndicators.map((item) => (
                        <TableRow key={item.supplier}>
                          <TableCell className="font-medium">{item.supplier}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className={`bg-${getEsgRatingColor(item.foodMiles.rating)}-50 text-${getEsgRatingColor(
                                        item.foodMiles.rating,
                                      )} border-${getEsgRatingColor(item.foodMiles.rating)}`}
                                    >
                                      {item.foodMiles.value} km
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Average distance food travels from source to your restaurant</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className={`bg-${getEsgRatingColor(item.packaging.rating)}-50 text-${getEsgRatingColor(
                                        item.packaging.rating,
                                      )} border-${getEsgRatingColor(item.packaging.rating)}`}
                                    >
                                      {item.packaging.value}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Type of packaging used (recyclable, compostable, etc.)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className={`bg-${getEsgRatingColor(item.localSourcing.rating)}-50 text-${getEsgRatingColor(
                                        item.localSourcing.rating,
                                      )} border-${getEsgRatingColor(item.localSourcing.rating)}`}
                                    >
                                      {item.localSourcing.value}%
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Percentage of products sourced locally (within 100km)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.certifications.map((cert, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className={`bg-${getEsgRatingColor(item.overallRating)}-50 text-${getEsgRatingColor(
                                  item.overallRating,
                                )} border-${getEsgRatingColor(item.overallRating)}`}
                              >
                                {item.overallRating}/5
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Download ESG Report</Button>
                <Button variant="outline" asChild>
                  <Link href="/restaurant/suppliers">View Supplier Details</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carbon Footprint Breakdown</CardTitle>
                <CardDescription>Sources of emissions in your supply chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carbonFootprintData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {carbonFootprintData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`${value} kg CO₂e`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Savings Tab */}
          <TabsContent value="savings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 1,245,000</div>
                  <p className="text-xs text-muted-foreground">Since using Dosteon</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 185,500</div>
                  <p className="text-xs text-muted-foreground">+12.3% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Waste Reduction Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 78,200</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-secondary-50 to-white border-secondary-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Supplier Comparison Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RWF 107,300</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Savings Breakdown</CardTitle>
                <CardDescription>Where you're saving the most money</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    wasteReduction: {
                      label: "Waste Reduction",
                      color: "hsl(var(--secondary))",
                    },
                    supplierComparison: {
                      label: "Supplier Comparison",
                      color: "hsl(var(--primary))",
                    },
                    bulkOrdering: {
                      label: "Bulk Ordering",
                      color: "hsl(var(--chart-3))",
                    },
                    seasonalPurchasing: {
                      label: "Seasonal Purchasing",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsBreakdownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="wasteReduction"
                        stackId="a"
                        fill="var(--color-wasteReduction)"
                        name="Waste Reduction"
                      />
                      <Bar
                        dataKey="supplierComparison"
                        stackId="a"
                        fill="var(--color-supplierComparison)"
                        name="Supplier Comparison"
                      />
                      <Bar dataKey="bulkOrdering" stackId="a" fill="var(--color-bulkOrdering)" name="Bulk Ordering" />
                      <Bar
                        dataKey="seasonalPurchasing"
                        stackId="a"
                        fill="var(--color-seasonalPurchasing)"
                        name="Seasonal Purchasing"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>Notifications for price changes on frequently purchased items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceAlerts.map((alert) => (
                    <div key={alert.item} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="font-medium">{alert.item}</div>
                        <div className="text-sm text-muted-foreground">
                          Supplier: {alert.supplier} • Last ordered: {alert.lastOrdered}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              alert.priceChange > 0
                                ? "bg-destructive-50 text-destructive border-destructive"
                                : "bg-secondary-50 text-secondary border-secondary"
                            }
                          >
                            {alert.priceChange > 0 ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {alert.priceChange > 0 ? "+" : ""}
                            {alert.priceChange}% price change
                          </Badge>
                          {alert.alternativeSupplier && (
                            <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Better price available
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          New price: RWF {alert.newPrice.toLocaleString()}/{alert.unit}
                        </div>
                        {alert.alternativeSupplier && (
                          <div className="text-sm text-secondary">
                            {alert.alternativeSupplier}: RWF {alert.alternativePrice.toLocaleString()}/{alert.unit}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2 justify-end">
                          {alert.alternativeSupplier && (
                            <Button size="sm" className="bg-primary hover:bg-primary-600">
                              Switch Supplier
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Set Up Custom Price Alerts
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>One-Tap Reorder Suggestions</CardTitle>
                <CardDescription>Quick reorders based on your purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reorderSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="overflow-hidden border-primary-100">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{suggestion.name}</h3>
                          <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
                            {suggestion.frequency}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Last ordered: {suggestion.lastOrdered} • Supplier: {suggestion.supplier}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm">
                            Typical order: {suggestion.typicalQuantity} {suggestion.unit}
                          </span>
                          <span className="text-sm font-medium">
                            RWF {suggestion.price.toLocaleString()}/{suggestion.unit}
                          </span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary-600">One-Tap Reorder</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DailyReportsModal open={reportsModalOpen} onOpenChange={setReportsModalOpen} type="analytics" />
      </main>
    </div>
  )
}

// Helper function for ESG rating colors
function getEsgRatingColor(rating: number) {
  if (rating >= 4) return "secondary"
  if (rating >= 3) return "primary"
  if (rating >= 2) return "warning"
  return "destructive"
}

// Sample data
const COLORS = ["#3851DD", "#02CA4E", "#FF6B6B", "#FFD166", "#06D6A0", "#118AB2"]

const consumptionData = [
  { date: "Apr 1", produce: 120, meat: 80, dairy: 40, dryGoods: 100 },
  { date: "Apr 8", produce: 110, meat: 85, dairy: 45, dryGoods: 95 },
  { date: "Apr 15", produce: 130, meat: 75, dairy: 50, dryGoods: 90 },
  { date: "Apr 22", produce: 125, meat: 90, dairy: 55, dryGoods: 85 },
  { date: "Apr 29", produce: 140, meat: 95, dairy: 60, dryGoods: 80 },
  { date: "May 6", produce: 135, meat: 100, dairy: 65, dryGoods: 75 },
]

const costEfficiencyData = [
  {
    item: "Tomatoes",
    avgPrice: 2500,
    unit: "kg",
    suppliers: [
      { name: "Fresh Farms Inc.", price: 2200 },
      { name: "Kigali Produce", price: 2800 },
      { name: "Organic Supplies Co.", price: 2400 },
    ],
  },
  {
    item: "Chicken Breast",
    avgPrice: 5500,
    unit: "kg",
    suppliers: [
      { name: "Metro Meats", price: 5800 },
      { name: "Rwanda Poultry", price: 4950 },
      { name: "Kigali Farms", price: 6100 },
    ],
  },
  {
    item: "Rice",
    avgPrice: 1800,
    unit: "kg",
    suppliers: [
      { name: "Global Grocers", price: 1750 },
      { name: "Nyarutarama Grocers", price: 1900 },
      { name: "Kigali Wholesale", price: 1650 },
    ],
  },
]

const timeOfDayData = [
  { category: "Produce", morning: 25, afternoon: 35, evening: 30, night: 10 },
  { category: "Meat", morning: 15, afternoon: 25, evening: 45, night: 15 },
  { category: "Dairy", morning: 30, afternoon: 30, evening: 25, night: 15 },
  { category: "Dry Goods", morning: 20, afternoon: 30, evening: 35, night: 15 },
]

const wastageData = [
  { date: "Apr 1", expired: 5.2, overproduction: 3.1, damaged: 1.2 },
  { date: "Apr 8", expired: 4.8, overproduction: 3.5, damaged: 1.0 },
  { date: "Apr 15", expired: 4.5, overproduction: 2.8, damaged: 1.5 },
  { date: "Apr 22", expired: 4.2, overproduction: 2.5, damaged: 0.8 },
  { date: "Apr 29", expired: 3.8, overproduction: 2.2, damaged: 1.1 },
  { date: "May 6", expired: 3.5, overproduction: 2.0, damaged: 0.9 },
]

const wastageByCategory = [
  { name: "Produce", value: 18.5 },
  { name: "Meat & Poultry", value: 5.2 },
  { name: "Dairy", value: 4.8 },
  { name: "Dry Goods", value: 2.1 },
  { name: "Beverages", value: 2.2 },
]

const wastageOpportunities = [
  {
    name: "Lettuce",
    wastage: 8.2,
    cost: 24600,
    reason: "Short shelf life, over-ordering",
    potentialSavings: 65,
  },
  {
    name: "Tomatoes",
    wastage: 5.5,
    cost: 13750,
    reason: "Improper storage, quality issues",
    potentialSavings: 45,
  },
  {
    name: "Milk",
    wastage: 4.2,
    cost: 13860,
    reason: "Expiration before use",
    potentialSavings: 50,
  },
]

const predictedStockouts = [
  {
    name: "Tomatoes",
    currentStock: 2.5,
    dailyUsage: 1.2,
    stockoutDate: "May 8, 2023",
    daysLeft: 2,
    unit: "kg",
  },
  {
    name: "Chicken Breast",
    currentStock: 8.0,
    dailyUsage: 1.5,
    stockoutDate: "May 13, 2023",
    daysLeft: 5,
    unit: "kg",
  },
  {
    name: "Rice",
    currentStock: 10.0,
    dailyUsage: 1.0,
    stockoutDate: "May 18, 2023",
    daysLeft: 10,
    unit: "kg",
  },
  {
    name: "Onions",
    currentStock: 5.0,
    dailyUsage: 0.8,
    stockoutDate: "May 14, 2023",
    daysLeft: 6,
    unit: "kg",
  },
  {
    name: "Milk",
    currentStock: 4.0,
    dailyUsage: 2.0,
    stockoutDate: "May 9, 2023",
    daysLeft: 2,
    unit: "liter",
  },
]

const demandForecastData = [
  { date: "Apr 15", actual: 45, predicted: null },
  { date: "Apr 22", actual: 48, predicted: null },
  { date: "Apr 29", actual: 52, predicted: null },
  { date: "May 6", actual: 55, predicted: null },
  { date: "May 13", actual: null, predicted: 58 },
  { date: "May 20", actual: null, predicted: 62 },
  { date: "May 27", actual: null, predicted: 65 },
  { date: "Jun 3", actual: null, predicted: 68 },
]

const seasonalTrendsData = [
  { month: "Jan", produce: 100, meat: 120, dairy: 90 },
  { month: "Feb", produce: 110, meat: 115, dairy: 85 },
  { month: "Mar", produce: 120, meat: 110, dairy: 80 },
  { month: "Apr", produce: 130, meat: 105, dairy: 85 },
  { month: "May", produce: 140, meat: 100, dairy: 90 },
  { month: "Jun", produce: 150, meat: 95, dairy: 95 },
  { month: "Jul", produce: 145, meat: 90, dairy: 100 },
  { month: "Aug", produce: 140, meat: 95, dairy: 105 },
  { month: "Sep", produce: 135, meat: 100, dairy: 100 },
  { month: "Oct", produce: 125, meat: 105, dairy: 95 },
  { month: "Nov", produce: 115, meat: 110, dairy: 90 },
  { month: "Dec", produce: 105, meat: 125, dairy: 95 },
]

const reorderRecommendations = [
  {
    name: "Tomatoes",
    lastOrdered: "Apr 28, 2023",
    supplier: "Fresh Farms Inc.",
    orderBy: "May 8",
    recommendedQty: 15,
    unit: "kg",
    estimatedCost: 37500,
    priceChange: -5,
  },
  {
    name: "Chicken Breast",
    lastOrdered: "May 1, 2023",
    supplier: "Metro Meats",
    orderBy: "May 10",
    recommendedQty: 10,
    unit: "kg",
    estimatedCost: 55000,
    priceChange: 3,
  },
  {
    name: "Rice",
    lastOrdered: "Apr 15, 2023",
    supplier: "Global Grocers",
    orderBy: "May 15",
    recommendedQty: 25,
    unit: "kg",
    estimatedCost: 45000,
    priceChange: 0,
  },
]

const esgIndicators = [
  {
    supplier: "Fresh Farms Inc.",
    foodMiles: { value: 25, rating: 4 },
    packaging: { value: "Compostable", rating: 5 },
    localSourcing: { value: 85, rating: 4 },
    certifications: ["Organic", "Fair Trade"],
    overallRating: 4.5,
  },
  {
    supplier: "Metro Meats",
    foodMiles: { value: 120, rating: 2 },
    packaging: { value: "Recyclable", rating: 3 },
    localSourcing: { value: 45, rating: 2 },
    certifications: ["HACCP"],
    overallRating: 2.8,
  },
  {
    supplier: "Global Grocers",
    foodMiles: { value: 350, rating: 1 },
    packaging: { value: "Mixed", rating: 2 },
    localSourcing: { value: 20, rating: 1 },
    certifications: ["ISO 22000"],
    overallRating: 2.0,
  },
  {
    supplier: "Organic Supplies Co.",
    foodMiles: { value: 35, rating: 4 },
    packaging: { value: "Compostable", rating: 5 },
    localSourcing: { value: 90, rating: 5 },
    certifications: ["Organic", "Rainforest Alliance"],
    overallRating: 4.8,
  },
  {
    supplier: "Kigali Farms",
    foodMiles: { value: 15, rating: 5 },
    packaging: { value: "Reusable", rating: 5 },
    localSourcing: { value: 95, rating: 5 },
    certifications: ["Organic", "Local First"],
    overallRating: 5.0,
  },
]

const carbonFootprintData = [
  { name: "Transportation", value: 450 },
  { name: "Refrigeration", value: 320 },
  { name: "Packaging", value: 180 },
  { name: "Food Production", value: 295 },
]

const savingsBreakdownData = [
  {
    month: "Jan",
    wasteReduction: 45000,
    supplierComparison: 65000,
    bulkOrdering: 25000,
    seasonalPurchasing: 15000,
  },
  {
    month: "Feb",
    wasteReduction: 48000,
    supplierComparison: 62000,
    bulkOrdering: 28000,
    seasonalPurchasing: 18000,
  },
  {
    month: "Mar",
    wasteReduction: 52000,
    supplierComparison: 68000,
    bulkOrdering: 30000,
    seasonalPurchasing: 20000,
  },
  {
    month: "Apr",
    wasteReduction: 58000,
    supplierComparison: 72000,
    bulkOrdering: 35000,
    seasonalPurchasing: 22000,
  },
]

const priceAlerts = [
  {
    item: "Chicken Breast",
    supplier: "Metro Meats",
    lastOrdered: "May 1, 2023",
    priceChange: 8,
    newPrice: 5940,
    unit: "kg",
    alternativeSupplier: "Rwanda Poultry",
    alternativePrice: 5200,
  },
  {
    item: "Olive Oil",
    supplier: "Global Grocers",
    lastOrdered: "Apr 20, 2023",
    priceChange: 12,
    newPrice: 11200,
    unit: "liter",
    alternativeSupplier: "Organic Supplies Co.",
    alternativePrice: 9800,
  },
  {
    item: "Rice",
    supplier: "Nyarutarama Grocers",
    lastOrdered: "Apr 15, 2023",
    priceChange: -5,
    newPrice: 1710,
    unit: "kg",
    alternativeSupplier: null,
    alternativePrice: null,
  },
]

const reorderSuggestions = [
  {
    id: "1",
    name: "Weekly Produce Pack",
    frequency: "Weekly",
    lastOrdered: "Apr 28, 2023",
    supplier: "Fresh Farms Inc.",
    typicalQuantity: 25,
    unit: "kg",
    price: 62500,
  },
  {
    id: "2",
    name: "Meat Essentials",
    frequency: "Bi-weekly",
    lastOrdered: "Apr 22, 2023",
    supplier: "Metro Meats",
    typicalQuantity: 15,
    unit: "kg",
    price: 82500,
  },
  {
    id: "3",
    name: "Dairy Bundle",
    frequency: "Weekly",
    lastOrdered: "May 1, 2023",
    supplier: "Dairy Delights",
    typicalQuantity: 20,
    unit: "liter",
    price: 45000,
  },
  {
    id: "4",
    name: "Dry Goods Restock",
    frequency: "Monthly",
    lastOrdered: "Apr 10, 2023",
    supplier: "Global Grocers",
    typicalQuantity: 50,
    unit: "kg",
    price: 90000,
  },
]
