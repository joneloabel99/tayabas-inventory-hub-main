import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  description: string | null;
  category: string | null;
  unit: string;
  unit_cost: number;
  quantity: number;
  reorder_level: number;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export function useItems() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("item_name");

      if (error) throw error;
      return data as Item[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: Omit<Item, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      ...item
    }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase
        .from("items")
        .update(item)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("items").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
  };
}
