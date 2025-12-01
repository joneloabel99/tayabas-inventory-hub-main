import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "@/lib/directus";
import { toast } from "sonner";
import { StockMovement } from "@/types";

export function useDirectusMovements(type?: 'received' | 'issued') {
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements', type],
    queryFn: async () => {
      try {
        const params = type ? { filter: JSON.stringify({ type: { _eq: type } }) } : {};
        const response = await directus.getItems<StockMovement>('stock_movements', params);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch movements:', error);
        toast.error('Failed to load stock movements');
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newMovement: Partial<StockMovement>) =>
      directus.createItem<StockMovement>('stock_movements', newMovement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Movement recorded successfully');
    },
    onError: () => {
      toast.error('Failed to record movement');
    },
  });

  return {
    movements,
    isLoading,
    createMovement: createMutation.mutate,
  };
}
