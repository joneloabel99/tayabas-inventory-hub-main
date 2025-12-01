import { Package, TrendingUp, AlertTriangle, PackagePlus, PackageMinus, Users, FileText, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useItems } from "@/hooks/useItems";

// Mock chart data for now - can be replaced with real data from Directus
const monthlyStockMovement = [
  { month: "Jul", received: 150, issued: 120 },
  { month: "Aug", received: 180, issued: 145 },
  { month: "Sep", received: 165, issued: 150 },
  { month: "Oct", received: 200, issued: 170 },
  { month: "Nov", received: 220, issued: 190 },
  { month: "Dec", received: 195, issued: 175 },
  { month: "Jan", received: 210, issued: 160 },
];

const categoryDistribution = [
  { name: "Office Supplies", value: 450, fill: "hsl(var(--chart-1))" },
  { name: "Equipment", value: 180, fill: "hsl(var(--chart-2))" },
  { name: "PPE", value: 280, fill: "hsl(var(--chart-3))" },
  { name: "Cleaning Supplies", value: 150, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 90, fill: "hsl(var(--chart-5))" },
];

const topIssuedItems = [
  { name: "A4 Bond Paper", count: 450 },
  { name: "Ballpoint Pen", count: 380 },
  { name: "Folder", count: 320 },
  { name: "Stapler Wire", count: 280 },
  { name: "Printer Ink", count: 250 },
  { name: "Envelope", count: 220 },
  { name: "Tape", count: 180 },
  { name: "Paper Clip", count: 160 },
  { name: "Rubber Band", count: 140 },
  { name: "Correction Fluid", count: 120 },
];

const custodianAssets = [
  { name: "Human Resources", value: 45, fill: "hsl(var(--chart-1))" },
  { name: "Finance", value: 32, fill: "hsl(var(--chart-2))" },
  { name: "IT Department", value: 28, fill: "hsl(var(--chart-3))" },
  { name: "Engineering", value: 25, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 20, fill: "hsl(var(--chart-5))" },
];

export default function Dashboard() {
  const { items, isLoading } = useItems();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = items.filter(item => item.quantity <= item.reorderLevel).length;
  
  const lowStockItems = items
    .filter(item => item.quantity <= item.reorderLevel)
    .sort((a, b) => (a.quantity / a.reorderLevel) - (b.quantity / b.reorderLevel));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time inventory insights and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Items"
          value={totalItems.toLocaleString()}
          subtitle="Across all categories"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Total Stock Value"
          value={`₱${(totalValue / 1000000).toFixed(2)}M`}
          subtitle="Current inventory worth"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle="Items need reordering"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="Active Custodians"
          value={45}
          subtitle="Asset holders"
          icon={Users}
          variant="default"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Items Issued Today"
          value={23}
          subtitle="RIS processed"
          icon={PackageMinus}
          variant="default"
        />
        <StatsCard
          title="Items Received Today"
          value={15}
          subtitle="Stock added"
          icon={PackagePlus}
          variant="success"
        />
        <StatsCard
          title="Pending RIS"
          value={8}
          subtitle="Awaiting approval"
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Physical Counts"
          value={12}
          subtitle="Completed this month"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Stock Movement */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStockMovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="received" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Received"
                />
                <Line 
                  type="monotone" 
                  dataKey="issued" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Issued"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Most Issued Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Most Issued Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topIssuedItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Custodian Asset Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Custodian Asset Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={custodianAssets}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {custodianAssets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Low Stock Items - Critical Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current Stock</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{item.itemCode}</td>
                    <td className="py-3 px-4 text-sm">{item.itemName}</td>
                    <td className="py-3 px-4 text-sm">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className="text-destructive font-semibold">{item.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{item.reorderLevel}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
