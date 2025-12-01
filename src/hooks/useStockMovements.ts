import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StockMovement {
  id: string;
  item_id: string;
  movement_type: "received" | "issued";
  quantity: number;
  reference: string;
  custodian: string | null;
  department: string | null;
  purpose: string | null;
  movement_date: string;
  created_by: string | null;
  created_at: string;
}

export function useStockMovements(itemId?: string) {
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading, error } = useQuery({
    queryKey: itemId ? ["stock_movements", itemId] : ["stock_movements"],
    queryFn: async () => {
      let query = supabase
        .from("stock_movements")
        .select("*")
        .order("movement_date", { ascending: false });

      if (itemId) {
        query = query.eq("item_id", itemId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as StockMovement[];
    },
  });

  const createMovement = useMutation({
    mutationFn: async (
      movement: Omit<StockMovement, "id" | "created_at" | "created_by">
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("stock_movements")
        .insert({
          ...movement,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Movement recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record movement: ${error.message}`);
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stock_movements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
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
    error,
    createMovement,
    deleteMovement,
  };
}
