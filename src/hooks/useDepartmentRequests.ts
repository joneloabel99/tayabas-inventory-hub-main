import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus, directusService } from "@/lib/directus";
import { toast } from "sonner";
import { DepartmentRequest } from "@/types";
import { useAuth } from "./useAuth";

export function useDepartmentRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['department_requests'],
    queryFn: async () => {
      try {
        const response = await directusService.getItems<DepartmentRequest>('department_requests', { fields: '*,items.*' });
        return response.data.map(request => ({ ...request, id: String(request.id) }));
      } catch (error) {
        console.error('Failed to fetch department requests:', error);
        toast.error('Failed to load department requests');
        return [];
      }
    },
    enabled: !!user,
  });

  const createRequest = useMutation({
    mutationFn: (newRequest: Partial<DepartmentRequest>) =>
      directus.createItem<DepartmentRequest>('department_requests', newRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department_requests'] });
      toast.success('Request submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit request');
    },
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DepartmentRequest> }) =>
      directus.updateItem<DepartmentRequest>('department_requests', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department_requests'] });
    },
    onError: () => {
      toast.error('Failed to update request');
    },
  });

  return {
    requests,
    isLoading,
    createRequest,
    updateRequest,
  };
}
