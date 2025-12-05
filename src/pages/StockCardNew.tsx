import { useState, useMemo } from "react";
import { FileText, Search, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    console.log("All movements from hook:", movements);
    console.log("Selected Item ID:", selectedItem);

    const sortedMovements = [...movements]
      .filter(m => {
        if (!m.item) {
          console.log("Movement filtered out (no item property):", m.type, m);
          return false;
        }
        const itemId = typeof m.item === 'object' ? (m.item as any).id : m.item;
        const isMatch = String(itemId) === selectedItem;
        if (!isMatch) {
            console.log("Movement filtered out (item ID mismatch):", m.type, `Movement Item ID: ${itemId}`, `Selected Item ID: ${selectedItem}`, m);
        }
        return isMatch;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log("Filtered & Sorted Movements for this item:", sortedMovements);
    
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
                remarks: movement.type === 'received'
                  ? `Received on: ${format(new Date(movement.date), 'yyyy-MM-dd')}`
                  : movement.custodian
                    ? `Issued to: ${movement.custodian.name}`
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

  const handleExportPdf = () => {
    if (!selectedItemData || stockCardEntries.length === 0) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;

    // A. Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Tayabas City General Services Office", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Stock Card Report", doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });

    // B. Item Details (using doc.text instead of autoTable for tighter control)
    let currentY = 38;
    const textMargin = 14;
    const lineHeight = 7; // Adjust as needed for spacing

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Item Code:`, textMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedItemData.itemCode, textMargin + doc.getTextWidth(`Item Code:  `), currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.text(`Item Name:`, textMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedItemData.itemName, textMargin + doc.getTextWidth(`Item Name:  `), currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.text(`Unit:`, textMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedItemData.unit, textMargin + doc.getTextWidth(`Unit:  `), currentY);
    currentY += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.text(`Location:`, textMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedItemData.location || 'N/A', textMargin + doc.getTextWidth(`Location:  `), currentY);
    currentY += lineHeight + 5; // Add a bit more space before the main table

    const tableStartY = currentY; // Update table start Y

    // C. Main Movements Table
    const tableColumns = ["Date", "Reference", "Type", "Qty", "Balance", "Unit Cost", "Total Value", "Remarks"]; // Removed "Status"
    const tableRows = stockCardEntries.map(entry => ([
      entry.date,
      entry.reference,
      entry.type.charAt(0).toUpperCase() + entry.type.slice(1), // Full word: Received or Issued
      { content: (entry.type === 'received' ? '+' : '-') + entry.quantity, styles: { halign: 'right' } },
      { content: entry.balance, styles: { halign: 'right' } }, // Removed fontStyle: 'bold'
      { content: entry.unitCost.toFixed(2), styles: { halign: 'right' } }, // Removed '₱'
      { content: entry.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' } }, // Removed '₱'
      entry.remarks
    ]));

    autoTable(doc, {
      startY: tableStartY,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
          fillColor: '#495057', // Darker grey
          textColor: 255, 
          fontStyle: 'bold',
          halign: 'center'
      },
      styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle'
      },
      alternateRowStyles: { fillColor: '#f8f9fa' }, // Light grey for stripes
      columnStyles: {
        2: { minCellWidth: 15 }, // Type (now at index 2)
        3: { halign: 'right', minCellWidth: 15 }, // Qty (now at index 3)
        4: { halign: 'right', minCellWidth: 18 }, // Balance (now at index 4)
        5: { halign: 'right', minCellWidth: 22 }, // Unit Cost (now at index 5)
        6: { halign: 'right', minCellWidth: 28 }, // Total Value (now at index 6)
      },
      didDrawPage: (data) => {
          // D. Footer
          doc.setFontSize(8);
          doc.setTextColor(100);
          const pageNumberText = `Page ${data.pageNumber}`;
          doc.text(pageNumberText, doc.internal.pageSize.getWidth() / 2, pageHeight - 7, { align: "center" });
          doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, pageHeight - 7);
          doc.text(`Tayabas Inventory Hub`, doc.internal.pageSize.getWidth() - 14, pageHeight - 7, { align: 'right'});
      }
    });

    // Add total page count to footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`of ${pageCount}`, doc.internal.pageSize.getWidth() / 2 + 10, pageHeight - 7);
    }

    // E. Save PDF
    doc.save(`stock-card-${selectedItemData.itemCode}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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
          <div className="flex gap-2">
            <Button onClick={handleExportPdf} className="gap-2">
              <Download className="w-4 h-4" />
              Export to PDF
            </Button>
          </div>
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
