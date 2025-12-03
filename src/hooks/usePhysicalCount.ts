import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus, directusService } from "@/lib/directus";
import { PhysicalCount } from "@/types";
import { toast } from "sonner";

export function usePhysicalCount(id: string | undefined) {
  const queryClient = useQueryClient();

  const { data: count, isLoading } = useQuery<PhysicalCount | null>({
    queryKey: ["physical_counts", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await directusService.getItem<PhysicalCount>("physical_counts", id);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch physical count:", error);
        return null;
      }
    },
    enabled: !!id,
  });

  const updateCount = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PhysicalCount> }) => {
      return directus.updateItem("physical_counts", id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["physical_counts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["physical_counts"] });
      toast.success("Physical count updated successfully.");
    },
    onError: (error) => {
      toast.error("Failed to update physical count.", {
        description: error.message,
      });
    },
  });

  return { count, isLoading, updateCount };
}
