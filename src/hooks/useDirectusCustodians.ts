import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "@/lib/directus";
import { toast } from "sonner";
import { Custodian } from "@/types";

export function useDirectusCustodians() {
  const queryClient = useQueryClient();

  const { data: custodians = [], isLoading } = useQuery({
    queryKey: ['custodians'],
    queryFn: async () => {
      try {
        const response = await directus.getItems<Custodian>('custodians');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch custodians:', error);
        toast.error('Failed to load custodians');
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newCustodian: Partial<Custodian>) =>
      directus.createItem<Custodian>('custodians', newCustodian),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      toast.success('Custodian added successfully');
    },
    onError: () => {
      toast.error('Failed to add custodian');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Custodian> }) =>
      directus.updateItem<Custodian>('custodians', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      toast.success('Custodian updated successfully');
    },
    onError: () => {
      toast.error('Failed to update custodian');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => directus.deleteItem('custodians', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      toast.success('Custodian deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete custodian');
    },
  });

  return {
    custodians,
    isLoading,
    createCustodian: createMutation.mutate,
    updateCustodian: updateMutation.mutate,
    deleteCustodian: deleteMutation.mutate,
  };
}
