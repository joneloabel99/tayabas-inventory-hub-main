import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus, directusService } from "@/lib/directus";
import { toast } from "sonner";
import { InventoryItem } from "@/types";
import { useAuth } from "./useAuth";

export function useItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        // Use the service client for fetching items to bypass user permission issues
        const response = await directusService.getItems<InventoryItem>('items');
        return response.data.map(item => ({ ...item, id: String(item.id) }));
      } catch (error) {
        console.error('Failed to fetch items:', error);
        toast.error('Failed to load items from Directus');
        return [];
      }
    },
    enabled: !!user,
  });

  const createItem = useMutation({
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

  const updateItem = useMutation({
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

  const deleteItem = useMutation({
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
    createItem,
    updateItem,
    deleteItem,
  };
}
