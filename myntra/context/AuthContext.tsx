import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import { mergeLocalRecentlyViewedWithServer, clearLocalRecentlyViewed } from "@/utils/recentlyViewed";
import React from "react";
import axios from "axios";
type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data._id && data.name && data.email) {
        setUser({ _id: data._id, name: data.name, email: data.email });
        setIsAuthenticated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    void mergeLocalRecentlyViewedWithServer(user._id);
  }, [user?._id]);

  const login = async (email: string, password: string) => {
    // If testing on Android Emulator, change localhost to 10.0.2.2
    const res = await axios.post("http://192.168.0.114:5000/user/login", {
      email,
      password,
    });

    const data = await res.data.user;
    if (data.fullName) {
      await saveUserData(data._id, data.fullName, data.email);
      setUser({ _id: data._id, name: data.name, email: data.email });
      setIsAuthenticated(true);
      void mergeLocalRecentlyViewedWithServer(data._id);
    } else {
      throw new Error(data.message || "Login failed");
    }
  };
  const Signup = async (fullName: string, email: string, password: string) => {
    // If testing on Android Emulator, change localhost to 10.0.2.2
    const res = await axios.post("http://192.168.0.114:5000/user/signup", {
      fullName,
      email,
      password,
    });
    const data = await res.data.user;
    if (data.fullName) {
      await saveUserData(data._id, data.fullName, data.email);
      setUser({ _id: data._id, name: data.name, email: data.email });
      setIsAuthenticated(true);
      void mergeLocalRecentlyViewedWithServer(data._id);
    } else {
      throw new Error(data.message || "Login failed");
    }
  };
  const logout = async () => {
    await clearUserData();
    await clearLocalRecentlyViewed();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, Signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
