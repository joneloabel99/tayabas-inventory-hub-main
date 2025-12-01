import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { directus } from "@/lib/directus"; // Import directus client
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  first_name: string | null; // Changed from full_name
  last_name: string | null; // Added last_name
  email: string | null;
  department: string | null; // Assuming department is a custom field in Directus user
  role: "admin" | "manager" | "staff" | "viewer"; // Assuming role is a custom field in Directus user
}

export function useUserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await directus.getItems<UserProfile>('users', {
          // You might need to specify fields to fetch related data like role and department
          fields: 'id,first_name,last_name,email,department,role', 
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users from Directus");
        return [];
      }
    },
    enabled: !!user,
  });

  // Update user profile
  const updateProfile = useMutation({
    mutationFn: async (data: { userId: string; first_name: string; last_name?: string; department: string }) => {
      const { userId, ...updateData } = data;
      await directus.updateItem<UserProfile>('users', userId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User profile updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update user profile:", error);
      toast.error(`Failed to update user profile: ${error.message}`);
    },
  });

  // Update user role
  const updateRole = useMutation({
    mutationFn: async (data: { userId: string; role: "admin" | "manager" | "staff" | "viewer" }) => {
      const { userId, role } = data;
      await directus.updateItem<UserProfile>('users', userId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update user role:", error);
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  return {
    users,
    isLoading,
    updateProfile,
    updateRole,
  };
}
