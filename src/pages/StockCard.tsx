import { useState } from "react";
import { FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StockCard() {
  const { movements, isLoading } = useStockMovements();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredMovements = movements.filter(movement => {
    const searchMatch = (movement.item?.itemName || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!searchMatch) return false;

    if (dateFilter === "all") return true;

    const movementDate = new Date(movement.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        return movementDate.toDateString() === new Date().toDateString();
      case 'last7': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return movementDate >= sevenDaysAgo;
      }
      case 'last30': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return movementDate >= thirtyDaysAgo;
      }
      case 'this_month':
        return movementDate.getMonth() === today.getMonth() && movementDate.getFullYear() === today.getFullYear();
      case 'this_year':
        return movementDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Card</h1>
        <p className="text-muted-foreground mt-1">View detailed stock movement history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Stock Card Records
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No stock movements found.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Item Name</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-right p-4">Quantity</th>
                    <th className="text-left p-4">Custodian</th>
                    <th className="text-left p-4">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b">
                      <td className="p-4">{new Date(movement.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{movement.item?.itemName || 'N/A'}</td>
                      <td className="p-4">
                        <Badge variant={movement.type === 'received' ? 'success' : 'destructive'}>
                          {movement.type}
                        </Badge>
                      </td>
                      <td className="text-right p-4">{movement.quantity}</td>
                      <td className="p-4">{movement.custodian?.name || 'N/A'}</td>
                      <td className="p-4">{movement.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
