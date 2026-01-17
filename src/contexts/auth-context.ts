import type { AuthCredential } from "@/types/auth";
import type { User } from "@/types/user";
import { createContext, useContext } from "react";

// Create AuthContext with types
export const AuthContext = createContext<{
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  auth?: AuthCredential;
  saveAuth: (auth: AuthCredential | undefined) => void;
  user?: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  login: (username: string, password: string) => Promise<User>;
  getUser: () => Promise<User | null>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (userData: Partial<User>, endpoint?: string) => Promise<User>;
  logout: () => void;
  verify: () => Promise<void>;
}>({
  loading: false,
  setLoading: () => {},
  saveAuth: () => {},
  setUser: () => {},
  login: async () => ({} as User),
  getUser: async () => null,
  getCurrentUser: async () => ({} as User),
  updateProfile: async () => ({} as User),
  logout: () => {},
  verify: async () => {},
});

// Hook definition
export function useAuth() {
  return useContext(AuthContext);
}
