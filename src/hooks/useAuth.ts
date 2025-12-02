import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { directus } from "@/lib/directus";
import { toast } from "sonner"; // Assuming toast is available for notifications

// Define Directus user interface based on what Directus returns
export interface DirectusUser {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: {
    id: string;
    name: string;
  } | null;
  // Add other relevant user fields from Directus
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("directus_access_token");
      if (token) {
        try {
          const response = await directus.getMe();
          setUser(response.data);
        } catch (error) {
          console.error("Failed to verify user from token:", error);
          localStorage.removeItem("directus_access_token");
          localStorage.removeItem("directus_refresh_token");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await directus.login(email, password);
      const fetchedUser: DirectusUser = {
        id: response.data.id, // Assuming Directus returns user ID on login
        email: email, // Directus usually returns email in user data
        first_name: response.data.first_name || "User", // Assuming first_name is available
        last_name: response.data.last_name,
        role: response.data.role || null,
      };
      setUser(fetchedUser);
      toast.success("Logged in successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || "Failed to sign in.");
      return { error: new Error(error.message || "Failed to sign in") };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const [first_name, ...last_name_parts] = fullName.split(" ");
      const last_name = last_name_parts.join(" ");

      await directus.register(email, password, first_name, last_name || undefined);
      toast.success("Account created! You can now log in.");
      // After sign-up, you might want to automatically sign in the user or redirect to login
      return { error: null };
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error(error.message || "Failed to create account.");
      return { error: new Error(error.message || "Failed to create account") };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await directus.logout();
      queryClient.clear();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, signIn, signUp, signOut };
}
