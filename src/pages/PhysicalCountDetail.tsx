import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhysicalCount } from '@/hooks/usePhysicalCount';
import { useItems } from '@/hooks/useItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";

export default function PhysicalCountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { count, isLoading: isLoadingCount, updateCount } = usePhysicalCount(id);
  const { items, isLoading: isLoadingItems, updateItem } = useItems();
  const [countedQuantities, setCountedQuantities] = useState<Record<string, string>>({});
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);

  useEffect(() => {
    if (count?.items) {
      const initialCounts = count.items.reduce((acc: Record<string, string>, item: any) => {
        acc[item.item_id] = String(item.counted_quantity);
        return acc;
      }, {});
      setCountedQuantities(initialCounts);
    } else if (count && count.status === 'Completed') {
      // If completed but no items, there's nothing to count.
      setCountedQuantities({});
    }
  }, [count]);

  const handleQuantityChange = (itemId: string, quantity: string) => {
    setCountedQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };
  
  const handleSaveProgress = () => {
    if (!id) return;
    const countedItems = Object.entries(countedQuantities)
      .filter(([, quantity]) => quantity.trim() !== '')
      .map(([itemId, quantity]) => ({
        item_id: itemId,
        counted_quantity: parseInt(quantity, 10),
        system_quantity: items.find(i => i.id === itemId)?.quantity ?? 0,
    }));

    updateCount.mutate({
      id,
      data: {
        items: countedItems,
        status: "In Progress",
      },
    });
  };

  const handleFinalizeCount = () => {
    if (!id) return;

    let itemsCounted = 0;
    let discrepanciesFound = 0;
    const countedItemsForUpdate = items.map(item => {
      const countedQuantityStr = countedQuantities[item.id];
      const countedQuantity = countedQuantityStr !== undefined && countedQuantityStr !== '' ? parseInt(countedQuantityStr, 10) : item.quantity;
      
      if (countedQuantityStr !== undefined && countedQuantityStr.trim() !== '') {
        itemsCounted++;
      }

      const discrepancy = countedQuantity - item.quantity;
      if (discrepancy !== 0) {
        discrepanciesFound++;
        // Adjust inventory
        updateItem.mutate({
          id: item.id,
          data: { quantity: countedQuantity },
        });
      }
      return {
        item_id: item.id,
        counted_quantity: countedQuantity,
        system_quantity: item.quantity,
        discrepancy: discrepancy
      };
    });

    updateCount.mutate(
      {
        id,
        data: {
          items: countedItemsForUpdate,
          status: 'Completed',
          itemsCounted,
          discrepanciesFound,
        },
      },
      {
        onSuccess: () => {
          toast.success('Physical count finalized and inventory updated.');
          navigate('/physical-count');
        },
      }
    );

    setIsFinalizeDialogOpen(false);
  };


  if (isLoadingCount || isLoadingItems) {
    return <div>Loading...</div>;
  }

  if (!count) {
    return <div>Physical count not found.</div>;
  }

  const isCountEditable = count.status === 'Scheduled' || count.status === 'In Progress';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/physical-count')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Physical Count Details</h1>
          <p className="text-muted-foreground mt-1">
            Status: {count.status} | {count.location} - {count.countDate}
            {count.status === 'Completed' && (
              <>
                {' '} | Items Counted: {count.itemsCounted ?? 0} | Discrepancies Found: {count.discrepanciesFound ?? 0}
              </>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Item Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Item</th>
                  <th className="text-right p-4">System Quantity</th>
                  <th className="text-right p-4">Counted Quantity</th>
                  <th className="text-right p-4">Discrepancy</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const systemQuantity = item.quantity;
                  const countedQuantityStr = countedQuantities[item.id];
                  const countedQuantity = countedQuantityStr !== undefined && countedQuantityStr !== '' ? parseInt(countedQuantityStr, 10) : undefined;
                  const discrepancy = countedQuantity !== undefined ? countedQuantity - systemQuantity : 0;
                  
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="p-4">{item.itemName}</td>
                      <td className="text-right p-4">{systemQuantity}</td>
                      <td className="p-4">
                        <Input
                          type="number"
                          className="w-24 float-right text-right"
                          placeholder="0"
                          value={countedQuantities[item.id] ?? ''}
                          onChange={e => handleQuantityChange(item.id, e.target.value)}
                          disabled={!isCountEditable}
                        />
                      </td>
                      <td className={`text-right p-4 font-semibold ${discrepancy > 0 ? 'text-success' : discrepancy < 0 ? 'text-destructive' : ''}`}>
                        {countedQuantity === undefined ? '-' : discrepancy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isCountEditable && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleSaveProgress}>Save Progress</Button>
          <Button onClick={() => setIsFinalizeDialogOpen(true)}>Finalize Count</Button>
        </div>
      )}

      <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Physical Count</DialogTitle>
            <DialogDescription>
              This will mark the count as complete and adjust inventory quantities based on your entries. This action cannot be undone. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleFinalizeCount}>Finalize and Adjust Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}