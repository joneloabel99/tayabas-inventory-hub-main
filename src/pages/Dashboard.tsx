import { useMemo } from "react";
import { Package, TrendingUp, AlertTriangle, PackagePlus, PackageMinus, Users, FileText, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useCustodians } from "@/hooks/useCustodians";
import { useDepartmentRequests } from "@/hooks/useDepartmentRequests";
import { usePhysicalCounts } from "@/hooks/usePhysicalCounts";

const formatCurrencyValue = (value: number) => {
  if (value === 0) return "₱0";
  if (Math.abs(value) >= 1_000_000_000) {
    return `₱${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `₱${(value / 1_000).toFixed(0)}K`;
  }
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export default function Dashboard() {
  const { items, isLoading: itemsLoading } = useItems();
  const { movements, isLoading: movementsLoading } = useStockMovements();
  const { custodians, isLoading: custodiansLoading } = useCustodians();
  const { requests, isLoading: requestsLoading } = useDepartmentRequests();
  const { counts: physicalCounts, isLoading: countsLoading } = usePhysicalCounts();

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalValue = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0), [items]);
  const lowStockCount = useMemo(() => items.filter(item => item.quantity <= item.reorderLevel).length, [items]);

  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();
    const issuedToday = movements.filter(m => m.type === 'issued' && new Date(m.date).toDateString() === today).reduce((sum, m) => sum + m.quantity, 0);
    const receivedToday = movements.filter(m => m.type === 'received' && new Date(m.date).toDateString() === today).reduce((sum, m) => sum + m.quantity, 0);
    const pendingRis = requests.filter(r => r.status === 'pending').length;
    const activeCustodians = custodians.length;
    const now = new Date();
    const completedCountsThisMonth = physicalCounts.filter(c => c.status === 'Completed' && new Date(c.countDate).getMonth() === now.getMonth() && new Date(c.countDate).getFullYear() === now.getFullYear()).length;

    return { issuedToday, receivedToday, pendingRis, activeCustodians, completedCountsThisMonth };
  }, [movements, custodians, requests, physicalCounts]);

  const monthlyStockData = useMemo(() => {
    const monthMap: { [key: string]: { received: number, issued: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    movements.forEach(m => {
        const date = new Date(m.date);
        const monthKey = monthNames[date.getMonth()];
        if (!monthMap[monthKey]) {
            monthMap[monthKey] = { received: 0, issued: 0 };
        }
        if (m.type === 'received') {
            monthMap[monthKey].received += m.quantity;
        } else {
            monthMap[monthKey].issued += m.quantity;
        }
    });

    return monthNames.map(month => ({ month, ... (monthMap[month] || { received: 0, issued: 0 }) }));
  }, [movements]);

  const categoryDistData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    items.forEach(item => {
        if (!categoryMap[item.category]) {
            categoryMap[item.category] = 0;
        }
        categoryMap[item.category] += item.quantity;
    });
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    return Object.entries(categoryMap).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
  }, [items]);

  const topIssuedData = useMemo(() => {
    const itemMap: { [key: string]: number } = {};
    movements.filter(m => m.type === 'issued' && m.item).forEach(m => {
        const itemName = (m.item as any).itemName;
        if (!itemMap[itemName]) {
            itemMap[itemName] = 0;
        }
        itemMap[itemName] += m.quantity;
    });
    return Object.entries(itemMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
  }, [movements]);

  const custodianAssetData = useMemo(() => {
    const departmentMap: { [key: string]: number } = {};
    movements.filter(m => m.type === 'issued' && m.custodian).forEach(m => {
        const department = (m.custodian as any).department;
        if (!departmentMap[department]) {
            departmentMap[department] = 0;
        }
        departmentMap[department] += m.quantity;
    });
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    return Object.entries(departmentMap).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
  }, [movements]);

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
        <StatsCard title="Total Items" value={totalItems.toLocaleString()} subtitle="Across all categories" icon={Package} variant="default" />
        <StatsCard title="Total Stock Value" value={formatCurrencyValue(totalValue)} subtitle="Current inventory worth" icon={TrendingUp} variant="success" />
        <StatsCard title="Low Stock Alerts" value={lowStockCount} subtitle="Items need reordering" icon={AlertTriangle} variant="warning" />
        <StatsCard title="Active Custodians" value={dashboardStats.activeCustodians} subtitle="Asset holders" icon={Users} variant="default" />
      </div>

      {/* Second Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Items Issued Today" value={dashboardStats.issuedToday} subtitle="RIS processed" icon={PackageMinus} variant="default" />
        <StatsCard title="Items Received Today" value={dashboardStats.receivedToday} subtitle="Stock added" icon={PackagePlus} variant="success" />
        <StatsCard title="Pending RIS" value={dashboardStats.pendingRis} subtitle="Awaiting approval" icon={FileText} variant="warning" />
        <StatsCard title="Physical Counts" value={dashboardStats.completedCountsThisMonth} subtitle="Completed this month" icon={CheckCircle} variant="success" />
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
              <LineChart data={monthlyStockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                <Legend />
                <Line type="monotone" dataKey="received" stroke="hsl(var(--success))" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="issued" stroke="hsl(var(--primary))" strokeWidth={2} name="Issued" />
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
                <Pie data={categoryDistData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {categoryDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
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
              <BarChart data={topIssuedData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
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
                <Pie data={custodianAssetData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {custodianAssetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
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
