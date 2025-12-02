import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus, directusService } from "@/lib/directus";
import { toast } from "sonner";
import { StockMovement } from "@/types";
import { useAuth } from "./useAuth";

export function useStockMovements(type?: 'received' | 'issued', custodianId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements', type, custodianId],
    queryFn: async () => {
      try {
        let filter: any = {};
        if (type) {
          filter.type = { _eq: type };
        }
        if (custodianId) {
          filter.custodian = { _eq: custodianId };
        }

        const params = {
          filter: JSON.stringify(filter),
          fields: '*,custodian.*,item.*',
        };
        const response = await directusService.getItems<StockMovement>('stock_movements', params);
        return response.data.map(movement => ({
          ...movement,
          item: movement.item ? { ...movement.item, id: String(movement.item.id) } : movement.item,
          custodian: movement.custodian ? { ...movement.custodian, id: String(movement.custodian.id) } : movement.custodian,
        }));
      } catch (error) {
        console.error('Failed to fetch movements:', error);
        toast.error('Failed to load stock movements');
        return [];
      }
    },
    enabled: !!user,
  });

  const createMovement = useMutation({
    mutationFn: (newMovement: Partial<StockMovement>) =>
      directus.createItem<StockMovement>('stock_movements', newMovement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success('Movement recorded successfully');
    },
    onError: () => {
      toast.error('Failed to record movement');
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (id: string) => {
      await directus.deleteItem('stock_movements', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Movement deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete movement: ${error.message}`);
    },
  });

  return {
    movements,
    isLoading,
    createMovement,
    deleteMovement,
  };
}
