import { useState, useEffect } from "react";

// Simple mock auth for Directus - stores auth state in localStorage
export interface DirectusUser {
  id: string;
  email: string;
  full_name: string;
}

export function useDirectusAuth() {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("directus_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - in production, this would call Directus auth API
    const mockUser: DirectusUser = {
      id: "1",
      email,
      full_name: email.split("@")[0],
    };
    localStorage.setItem("directus_user", JSON.stringify(mockUser));
    setUser(mockUser);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock sign up - in production, this would call Directus users API
    const mockUser: DirectusUser = {
      id: Date.now().toString(),
      email,
      full_name: fullName,
    };
    localStorage.setItem("directus_user", JSON.stringify(mockUser));
    setUser(mockUser);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("directus_user");
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}
