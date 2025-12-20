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

  // 2. CREATED REUSABLE FETCH FUNCTION (Moved logic out of useEffect)
  // const fetchMongoData = useCallback(async (currentUser: FirebaseUser) => {
  //     if (!currentUser.email) {
  //         setDbUser(null);
  //         return;
  //     }

  //     // 3. FIX: FORCE LOWERCASE EMAIL
  //     // This prevents "Admin" vs "admin" mismatches
  //     const normalizedEmail = currentUser.email.toLowerCase();

  //     try {
  //         console.log("🔍 Fetching MongoDB data for:", normalizedEmail);
  //         const mongoData = await api.getUserByEmail(normalizedEmail);
  //         console.log("✅ MongoDB User Found:", mongoData);
  //         setDbUser(mongoData);
  //     } catch (error) {
  //         console.warn("❌ User not found in MongoDB yet (waiting for creation...)", error);
  //         setDbUser(null);
  //     }
  // }, []);

  // 4. EXPOSED REFRESH FUNCTION
  // Call this from Login.tsx after creating the user in DB
  // const refreshUserData = async (currentUser?: FirebaseUser) => {
  //     // Use the passed user OR the state user
  //     const targetUser = currentUser || user;
      
  //     if (targetUser) {
  //         console.log("🔄 Manually refreshing data for:", targetUser.email);
  //         await fetchMongoData(targetUser);
  //     } else {
  //         console.warn("⚠️ Cannot refresh: No user available");
  //     }
  // };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  //     setUser(currentUser);
      
  //     if (currentUser?.email) {
  //       const displayName = currentUser.displayName || currentUser.email.split('@')[0];
  //       setUsername(displayName);
        
  //       // Call the reusable function
  //       await fetchMongoData(currentUser);
  //     } else {
  //       setUsername("Guest");
  //       setDbUser(null);
  //     }
  //     setLoading(false);
  //   });
  //   return () => unsubscribe();
  // }, [fetchMongoData]); // Added dependency

  // const isAdmin = dbUser?.role === 'Admin' || dbUser?.role === 'CEO';

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
  const login = async (credentials: any) => {
    const userData = await api.login(credentials);
    setUser(userData);
    setUsername(userData.name);
  };

  // 3. Register Action
  const register = async (data: any) => {
    const userData = await api.register(data);
    setUser(userData);
    setUsername(userData.name);
  };

  // 4. Logout Action
  const logout = async () => {
    await api.logout();
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