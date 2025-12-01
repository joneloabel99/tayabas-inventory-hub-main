import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { directus } from "@/lib/directus"; // Import directus client
import { DirectusUser } from "./useAuth"; // Assuming DirectusUser is sufficient for profile

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await directus.getItem<DirectusUser>('users', user.id);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load user profile");
        return null;
      }
    },
    enabled: !!user?.id, // Only run query if user ID is available
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { first_name: string; last_name?: string; department?: string }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      await directus.updateItem<DirectusUser>('users', user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      // Invalidate users list as well if profile changes might affect it
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const updatePassword = useMutation({
    mutationFn: async (newPassword: string) => {
      if (!user?.id) throw new Error("User not authenticated.");
      // Directus API for updating password for the authenticated user
      // This typically goes through a specific endpoint or update the user item itself.
      // Assuming a direct update on the user item for simplicity, this might vary based on Directus setup.
      await directus.updateItem('users', user.id, { password: newPassword });
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update password:", error);
      toast.error(`Failed to update password: ${error.message}`);
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
    updatePassword,
  };
}
