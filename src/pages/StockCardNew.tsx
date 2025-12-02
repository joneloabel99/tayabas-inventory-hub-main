import { useState, useMemo } from "react";
import { FileText, Search, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";
import { format } from "date-fns";

interface StockCardEntry {
  id: string;
  date: string;
  reference: string;
  type: "received" | "issued";
  quantity: number;
  balance: number;
  unitCost: number;
  totalValue: number;
  remarks: string;
}

export default function StockCardNew() {
  const [selectedItem, setSelectedItem] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, isLoading: itemsLoading } = useItems();
  const { movements, isLoading: movementsLoading } = useStockMovements();

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item =>
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const selectedItemData = useMemo(() => {
    if (!items) return null;
    return items.find(item => item.id === selectedItem);
  }, [items, selectedItem]);

  // Calculate stock card entries with running balance
  const stockCardEntries = useMemo(() => {
    if (!selectedItem || !selectedItemData || !movements) return [];

    const sortedMovements = [...movements]
      .filter(m => m.item && m.item.id === selectedItem)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const entries: StockCardEntry[] = [];

    sortedMovements.forEach(movement => {
      if (movement.type === 'received') {
        runningBalance += movement.quantity;
      } else {
        runningBalance -= movement.quantity;
      }

      entries.push({
        id: movement.id,
        date: format(new Date(movement.date), 'yyyy-MM-dd'),
        reference: movement.reference,
        type: movement.type,
        quantity: movement.quantity,
        balance: runningBalance,
        unitCost: selectedItemData.unitCost,
        totalValue: runningBalance * selectedItemData.unitCost,
        remarks: movement.custodian 
          ? `Custodian: ${movement.custodian.name}`
          : '',
      });
    });

    return entries;
  }, [movements, selectedItem, selectedItemData]);

  const handleExport = () => {
    if (!selectedItemData || stockCardEntries.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Reference', 'Type', 'Quantity', 'Balance', 'Unit Cost', 'Total Value', 'Remarks'];
    const rows = stockCardEntries.map(entry => [
      entry.date,
      entry.reference,
      entry.type,
      entry.quantity,
      entry.balance,
      entry.unitCost,
      entry.totalValue,
      entry.remarks
    ]);

    const csvContent = [
      `Stock Card for: ${selectedItemData.itemName} (${selectedItemData.itemCode})`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-card-${selectedItemData.itemCode}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Card</h1>
          <p className="text-muted-foreground mt-1">View detailed stock movement history by item</p>
        </div>
        {selectedItem && stockCardEntries.length > 0 && (
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Item Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Item</CardTitle>
          <CardDescription>Choose an item to view its complete movement history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={itemsLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Select value={selectedItem} onValueChange={setSelectedItem} disabled={itemsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.itemCode} - {item.itemName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-items" disabled>
                      No items found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item Summary */}
          {selectedItemData && (
            <div className="grid gap-4 md:grid-cols-4 mt-6 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{selectedItemData.quantity}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedItemData.unit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit Cost</p>
                <p className="text-2xl font-bold">₱{selectedItemData.unitCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ₱{(selectedItemData.quantity * selectedItemData.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{selectedItemData.location || "N/A"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Card History */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stock Movement History
            </CardTitle>
            <CardDescription>
              {movementsLoading ? "Loading movements..." : `${stockCardEntries.length} movement(s) recorded`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : stockCardEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Unit Cost</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Value</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockCardEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm">{entry.date}</td>
                        <td className="py-3 px-4 text-sm font-medium">{entry.reference}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.type === "received" 
                              ? "bg-success/10 text-success" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {entry.type === "received" ? "Received" : "Issued"}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm text-right font-semibold ${
                          entry.type === "received" ? "text-success" : "text-primary"
                        }`}>
                          {entry.type === "received" ? "+" : "-"}{entry.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold">{entry.balance}</td>
                        <td className="py-3 px-4 text-sm text-right">₱{entry.unitCost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          ₱{entry.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{entry.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No movements recorded for this item</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedItem && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Please select an item to view its stock card</p>
              <p className="text-sm mt-2">Search or select from the dropdown above</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
