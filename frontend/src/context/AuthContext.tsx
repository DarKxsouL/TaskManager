import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  username: string;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("Guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const userData = await api.checkSession(); // Calls /api/auth/me
        setUser(userData);
        setUsername(userData.name); // Using name as display username
      } catch (error) {
        setUser(null);
        setUsername("Guest");
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  // 2. Login Action
  // const login = async (credentials: any) => {
  //   const userData = await api.login(credentials);
  //   setUser(userData);
  //   setUsername(userData.name);
  // };
  const login = async (credentials: any) => {
    const response = await api.login(credentials);

    console.group("🔍 Login Debugger");
    console.log("Raw Backend Response:", response);
    console.log("Is there a token?", response.token ? "YES" : "NO");
    console.groupEnd();

    const token = response.token || response.accessToken || response.jwt;
    
    // Check if the response has a token and save it
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        console.error("⚠️ CRITICAL: No token found in login response!");
    }
    
    // Handle user object structure (sometimes user is nested, sometimes flat)
    const userData = response.user || response; 
    
    setUser(userData);
    setUsername(userData.name);
  };

  // 3. Register Action
  // const register = async (data: any) => {
  //   const userData = await api.register(data);
  //   setUser(userData);
  //   setUsername(userData.name);
  // };
  const register = async (data: any) => {
    const response = await api.register(data);
    
    if (response.token) {
        localStorage.setItem('authToken', response.token);
    }

    const userData = response.user || response;
    
    setUser(userData);
    setUsername(userData.name);
  };

  // 4. Logout Action
  // const logout = async () => {
  //   await api.logout();
  //   setUser(null);
  //   setUsername("Guest");
  // };
  const logout = async () => {
    try {
        await api.logout();
    } catch (err) {
        console.warn("Logout API failed, clearing local state anyway");
    }
    // ALWAYS clear local storage and state
    localStorage.removeItem('authToken');
    setUser(null);
    setUsername("Guest");
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'CEO';

  return (
    <AuthContext.Provider value={{ user, username, loading, isAdmin, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};