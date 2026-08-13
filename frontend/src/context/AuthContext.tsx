import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  type ReactNode 
} from "react";
import { api } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  roomId: string | null;
  roomStatus: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  username: string;
  loading: boolean;
  isAdmin: boolean;
  roomId: string | null;
  roomStatus: string;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  permissions: string[];           // ← add
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("Guest");
  const [loading, setLoading] = useState(true);

  // --- CORE SESSION FETCHER ---
  // useCallback so it's stable — safe to use as a dependency
  // in useEffect elsewhere without causing infinite loops
  const fetchSession = useCallback(async () => {
    try {
      const userData = await api.checkSession();
      setUser(userData);
      setUsername(userData.name);
    } catch {
      setUser(null);
      setUsername("Guest");
    }
  }, []);

  // On mount — check if user is already logged in
  useEffect(() => {
    const init = async () => {
      await fetchSession();
      setLoading(false);
    };
    init();
  }, [fetchSession]);

  // --- LOGIN ---
  const login = async (credentials: any) => {
    const response = await api.login(credentials);

    const token = response.token;
    if (token) {
      localStorage.setItem('authToken', token);
    }

    const userData = response.user || response;
    setUser(userData);
    setUsername(userData.name);
  };

  // --- REGISTER ---
  const register = async (data: any) => {
    const response = await api.register(data);

    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }

    const userData = response.user || response;
    setUser(userData);
    setUsername(userData.name);
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await api.logout();
    } catch {
      console.warn("Logout API failed, clearing local state anyway");
    }
    localStorage.removeItem('authToken');
    setUser(null);
    setUsername("Guest");
  };

  // --- REFRESH SESSION ---
  // Called after socket events (approval/rejection) to
  // pull the latest roomStatus from the backend
  const refreshSession = useCallback(async () => {
    try {
      const userData = await api.checkSession();
      setUser(userData);
      setUsername(userData.name);
    } catch {
      // If session check fails after approval something is
      // seriously wrong — log out cleanly
      setUser(null);
      setUsername("Guest");
    }
  }, []);

  // --- DERIVED STATE ---
  const isAdmin = user?.role === 'Admin' || user?.role === 'CEO';
  const roomId = user?.roomId ?? null;
  const roomStatus = user?.roomStatus ?? 'none';

  const permissions = user?.permissions || [];
const hasPermission = (key: string): boolean => {
  if (!user) return false;
  if (user.role === 'Admin') return true;  // Admin always has everything
  return permissions.includes(key);
};

  return (
    <AuthContext.Provider value={{ 
      user, 
      username, 
      loading, 
      isAdmin,
      roomId,
      roomStatus,
      permissions,
      hasPermission, 
      login, 
      register, 
      logout,
      refreshSession
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};