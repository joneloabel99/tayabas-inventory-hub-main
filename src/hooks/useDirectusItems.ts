import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "@/lib/directus";
import { toast } from "sonner";
import { InventoryItem } from "@/types";

export function useDirectusItems() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        const response = await directus.getItems<InventoryItem>('items');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch items:', error);
        toast.error('Failed to load items from Directus');
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newItem: Partial<InventoryItem>) => 
      directus.createItem<InventoryItem>('items', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item added successfully');
    },
    onError: () => {
      toast.error('Failed to add item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      directus.updateItem<InventoryItem>('items', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
    },
    onError: () => {
      toast.error('Failed to update item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => directus.deleteItem('items', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  return {
    items,
    isLoading,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
  };
}
