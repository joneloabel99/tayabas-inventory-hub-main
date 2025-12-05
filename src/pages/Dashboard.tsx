import { useMemo, useState } from "react";
import { Package, TrendingUp, AlertTriangle, PackagePlus, PackageMinus, Users, FileText, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DetailsDialog } from "@/components/dashboard/DetailsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useCustodians } from "@/hooks/useCustodians";
import { useDepartmentRequests } from "@/hooks/useDepartmentRequests";
import { usePhysicalCounts } from "@/hooks/usePhysicalCounts";
import { Item, Custodian, DepartmentRequest, PhysicalCount, StockMovement } from "@/types";

type DialogDataType = {
  title: string;
  description?: string;
  content: React.ReactNode;
}

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

  const [dialogData, setDialogData] = useState<DialogDataType | null>(null);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalValue = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0), [items]);
  const lowStockItems = useMemo(() => items.filter(item => item.quantity <= item.reorderLevel), [items]);
  const lowStockCount = lowStockItems.length;

  const today = new Date().toDateString();
  const issuedTodayMovements = useMemo(() => movements.filter(m => m.type === 'issued' && new Date(m.date).toDateString() === today), [movements, today]);
  const receivedTodayMovements = useMemo(() => movements.filter(m => m.type === 'received' && new Date(m.date).toDateString() === today), [movements, today]);
  const pendingRisRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  
  const now = new Date();
  const completedCountsThisMonth = useMemo(() => physicalCounts.filter(c => c.status === 'Completed' && new Date(c.countDate).getMonth() === now.getMonth() && new Date(c.countDate).getFullYear() === now.getFullYear()), [physicalCounts, now]);

  const dashboardStats = useMemo(() => {
    const issuedToday = issuedTodayMovements.reduce((sum, m) => sum + m.quantity, 0);
    const receivedToday = receivedTodayMovements.reduce((sum, m) => sum + m.quantity, 0);
    const pendingRis = pendingRisRequests.length;
    const activeCustodians = custodians.length;
    
    return { issuedToday, receivedToday, pendingRis, activeCustodians, completedCountsThisMonth: completedCountsThisMonth.length };
  }, [issuedTodayMovements, receivedTodayMovements, pendingRisRequests, custodians, completedCountsThisMonth]);
  
  const handleCardClick = (cardTitle: string) => {
    let data: DialogDataType | null = null;
    switch(cardTitle) {
      case 'Total Items':
        data = {
          title: "All Items",
          description: "A complete list of all items in the inventory.",
          content: <ItemsTable items={items} />
        };
        break;
      case 'Total Stock Value':
        data = {
          title: "Stock Value Breakdown",
          description: "The value of each item in the inventory.",
          content: <StockValueTable items={items} />
        };
        break;
      case 'Low Stock Alerts':
        data = {
          title: "Low Stock Items",
          description: "Items that have fallen below their reorder level.",
          content: <LowStockTable items={lowStockItems} />
        };
        break;
      case 'Active Custodians':
        data = {
          title: "Active Custodians",
          description: "List of all active custodians.",
          content: <CustodiansTable custodians={custodians} />
        };
        break;
      case 'Items Issued Today':
        data = {
          title: "Items Issued Today",
          description: `All items issued on ${today}.`,
          content: <MovementsTable movements={issuedTodayMovements} />
        };
        break;
      case 'Items Received Today':
        data = {
          title: "Items Received Today",
          description: `All items received on ${today}.`,
          content: <MovementsTable movements={receivedTodayMovements} />
        };
        break;
      case 'Pending RIS':
        data = {
          title: "Pending Requisition and Issue Slips",
          description: "RIS awaiting approval.",
          content: <RequestsTable requests={pendingRisRequests} />
        };
        break;
      case 'Physical Counts':
        data = {
          title: "Physical Counts (This Month)",
          description: `Physical counts completed in ${now.toLocaleString('default', { month: 'long' })}.`,
          content: <PhysicalCountsTable counts={completedCountsThisMonth} />
        };
        break;
    }
    if (data) {
      setDialogData(data);
    }
  };

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

  const sortedLowStockItems = items
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
        <StatsCard title="Total Items" value={totalItems.toLocaleString()} subtitle="Across all categories" icon={Package} variant="default" onClick={() => handleCardClick('Total Items')} />
        <StatsCard title="Total Stock Value" value={formatCurrencyValue(totalValue)} subtitle="Current inventory worth" icon={TrendingUp} variant="success" onClick={() => handleCardClick('Total Stock Value')} />
        <StatsCard title="Low Stock Alerts" value={lowStockCount} subtitle="Items need reordering" icon={AlertTriangle} variant="warning" onClick={() => handleCardClick('Low Stock Alerts')} />
        <StatsCard title="Active Custodians" value={dashboardStats.activeCustodians} subtitle="Asset holders" icon={Users} variant="default" onClick={() => handleCardClick('Active Custodians')} />
      </div>

      {/* Second Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Items Issued Today" value={dashboardStats.issuedToday} subtitle="RIS processed" icon={PackageMinus} variant="default" onClick={() => handleCardClick('Items Issued Today')} />
        <StatsCard title="Items Received Today" value={dashboardStats.receivedToday} subtitle="Stock added" icon={PackagePlus} variant="success" onClick={() => handleCardClick('Items Received Today')} />
        <StatsCard title="Pending RIS" value={dashboardStats.pendingRis} subtitle="Awaiting approval" icon={FileText} variant="warning" onClick={() => handleCardClick('Pending RIS')} />
        <StatsCard title="Physical Counts" value={dashboardStats.completedCountsThisMonth} subtitle="Completed this month" icon={CheckCircle} variant="success" onClick={() => handleCardClick('Physical Counts')} />
      </div>

      {dialogData && (
        <DetailsDialog
          open={!!dialogData}
          onOpenChange={(open) => !open && setDialogData(null)}
          title={dialogData.title}
          description={dialogData.description}
        >
          {dialogData.content}
        </DetailsDialog>
      )}

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
                {sortedLowStockItems.map((item) => (
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

// Dialog Content Components

const ItemsTable = ({ items }: { items: Item[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Code</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Category</TableHead>
        <TableHead className="text-right">Quantity</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.itemCode}</TableCell>
          <TableCell>{item.itemName}</TableCell>
          <TableCell>{item.category}</TableCell>
          <TableCell className="text-right">{item.quantity}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const StockValueTable = ({ items }: { items: Item[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Code</TableHead>
        <TableHead>Name</TableHead>
        <TableHead className="text-right">Quantity</TableHead>
        <TableHead className="text-right">Unit Cost</TableHead>
        <TableHead className="text-right">Total Value</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.itemCode}</TableCell>
          <TableCell>{item.itemName}</TableCell>
          <TableCell className="text-right">{item.quantity}</TableCell>
          <TableCell className="text-right">{formatCurrencyValue(item.unitCost)}</TableCell>
          <TableCell className="text-right font-medium">{formatCurrencyValue(item.quantity * item.unitCost)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const LowStockTable = ({ items }: { items: Item[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Code</TableHead>
        <TableHead>Name</TableHead>
        <TableHead className="text-right">Quantity</TableHead>
        <TableHead className="text-right">Reorder Level</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.itemCode}</TableCell>
          <TableCell>{item.itemName}</TableCell>
          <TableCell className="text-right text-destructive font-bold">{item.quantity}</TableCell>
          <TableCell className="text-right">{item.reorderLevel}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const CustodiansTable = ({ custodians }: { custodians: Custodian[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Contact</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {custodians.map(c => (
        <TableRow key={c.id}>
          <TableCell>{c.name}</TableCell>
          <TableCell>{c.department}</TableCell>
          <TableCell>{c.contactNumber}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const MovementsTable = ({ movements }: { movements: StockMovement[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Item</TableHead>
        <TableHead className="text-right">Quantity</TableHead>
        <TableHead>Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {movements.map(m => (
        <TableRow key={m.id}>
          <TableCell>{(m.item as any)?.itemName || 'N/A'}</TableCell>
          <TableCell className="text-right">{m.quantity}</TableCell>
          <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const RequestsTable = ({ requests }: { requests: DepartmentRequest[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>RIS No.</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {requests.map(r => (
        <TableRow key={r.id}>
          <TableCell>{r.risNumber}</TableCell>
          <TableCell>{r.department}</TableCell>
          <TableCell>{r.status}</TableCell>
          <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const PhysicalCountsTable = ({ counts }: { counts: PhysicalCount[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Count Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Location</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {counts.map(c => (
        <TableRow key={c.id}>
          <TableCell>{new Date(c.countDate).toLocaleDateString()}</TableCell>
          <TableCell>{c.status}</TableCell>
          <TableCell>{c.location}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
