import { useQuery } from "@tanstack/react-query";
import { directusService } from "@/lib/directus";
import { toast } from "sonner";
import { Custodian } from "@/types";
import { useAuth } from "./useAuth";

export function useCustodian(id: string) {
  const { user } = useAuth();

  const { data: custodian, isLoading } = useQuery({
    queryKey: ['custodian', id],
    queryFn: async () => {
      try {
        const response = await directusService.getItem<Custodian>('custodians', id);
        return { ...response.data, id: String(response.data.id) };
      } catch (error) {
        console.error(`Failed to fetch custodian ${id}:`, error);
        toast.error('Failed to load custodian data');
        return null;
      }
    },
    enabled: !!user && !!id,
  });

  return {
    custodian,
    isLoading,
  };
}
