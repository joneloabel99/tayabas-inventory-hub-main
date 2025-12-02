import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus, directusService } from "@/lib/directus";
import { toast } from "sonner";
import { PhysicalCount } from "@/types";
import { useAuth } from "./useAuth";

export function usePhysicalCounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: counts = [], isLoading } = useQuery({
    queryKey: ['physical_counts'],
    queryFn: async () => {
      try {
        const response = await directusService.getItems<PhysicalCount>('physical_counts');
        return response.data.map(count => ({ ...count, id: String(count.id) }));
      } catch (error) {
        console.error('Failed to fetch physical counts:', error);
        toast.error('Failed to load physical counts');
        return [];
      }
    },
    enabled: !!user,
  });

  const createCount = useMutation({
    mutationFn: (newCount: Partial<PhysicalCount>) =>
      directus.createItem<PhysicalCount>('physical_counts', newCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical_counts'] });
      toast.success('Physical count scheduled successfully');
    },
    onError: () => {
      toast.error('Failed to schedule physical count');
    },
  });

  return {
    counts,
    isLoading,
    createCount,
  };
}
