import { useState, useEffect, useContext, createContext } from "react";
import { directus } from "@/lib/directus";
import { toast } from "sonner";

export interface DirectusUser {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: {
    id: string;
    name: string;
  } | null;
}

interface AuthContextType {
  user: DirectusUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setLoading(true);
      const token = localStorage.getItem("directus_access_token");
      if (token) {
        try {
          const response = await directus.getMe();
          const fetchedUser: DirectusUser = response.data;
          setUser(fetchedUser);
          localStorage.setItem("directus_user", JSON.stringify(fetchedUser));
        } catch (error) {
          console.error("Failed to verify user from token:", error);
          await directus.logout();
          localStorage.removeItem("directus_user");
        }
      }
      setLoading(false);
    };

    const storedUser = localStorage.getItem("directus_user");
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch(e) {
            localStorage.removeItem("directus_user");
        }
    }
    checkUserSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await directus.login(email, password);
      const response = await directus.getMe();
      const userData = response.data as DirectusUser;
      localStorage.setItem("directus_user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || "Failed to sign in.");
      localStorage.removeItem("directus_user");
      setUser(null);
      return { error: new Error(error.message || "Failed to sign in") };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await directus.logout();
      localStorage.removeItem("directus_user");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || "Failed to sign out.");
    }
  };
  
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const [first_name, ...last_name_parts] = fullName.split(" ");
      const last_name = last_name_parts.join(" ");

      await directus.register(email, password, first_name, last_name || undefined);
      toast.success("Account created! You can now log in.");
      return { error: null };
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error(error.message || "Failed to create account.");
      return { error: new Error(error.message || "Failed to create account") };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
