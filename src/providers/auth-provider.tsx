import { STORAGE_CONFIG } from "@/config/storage.config";
import { AuthContext } from "@/contexts/auth-context";
import * as authHelper from "@/lib/auth-helpers";
import api from "@/lib/axios";
import { setLocalStorageData } from "@/lib/utils";
import type { AuthCredential } from "@/types/auth";
import type { User } from "@/types/user";
import { isAxiosError } from "axios";
import { useState, type PropsWithChildren } from "react";

// Define the Supabase Auth Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthCredential | undefined>(
    authHelper.getAuth()
  );
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  const verify = async (authData?: AuthCredential) => {
    const authToUse = authData || auth;

    if (authToUse) {
      try {
        // Set the user
        const user = await getUser();
        setCurrentUser(user || undefined);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthCredential | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post("/v1/auth/login", {
        username,
        password,
      });

      const user: User = {
        ...(res.data.data.user ?? {}),
      };

      const auth: AuthCredential = {
        access_token: res.data.data.token,
        refresh_token: res.data.data.token, // @todo: add refresh token
      };

      // Set user to local storage
      setLocalStorageData(STORAGE_CONFIG.userLocalStorageKey, user);

      // Set auth
      authHelper.setAuth(auth);

      // Set auth
      saveAuth(auth);

      // Get user's menus & permissions after login
      await verify(auth);

      // Return the user so the caller can use it immediately
      return user;
    } catch (error) {
      saveAuth(undefined);
      setCurrentUser(undefined);

      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const getUser = async () => {
    try {
      const res = await api.get("/v1/auth/me");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const updateProfile = async (userData: Partial<User>, endpoint?: string) => {
    try {
      const apiEndpoint = endpoint || "/v1/auth/profile";
      const res = await api.put(apiEndpoint, userData);
      const updatedUser = res.data.data;

      // Update the current user in context
      setCurrentUser(updatedUser);

      return updatedUser;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const getCurrentUser = async () => {
    try {
      const res = await api.get("/v1/auth/me");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      const res = await api.post("/v1/auth/logout");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    } finally {
      // Logout from the app even if the API call fails
      saveAuth(undefined);
      setCurrentUser(undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        getUser,
        getCurrentUser,
        updateProfile,
        logout,
        verify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
