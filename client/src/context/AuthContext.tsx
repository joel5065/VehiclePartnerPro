import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { loginUser, registerUser, RegisterUserParams, LoginParams } from "../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginParams) => Promise<boolean>;
  register: (userData: RegisterUserParams) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if user is stored in localStorage
const getUserFromStorage = (): User | null => {
  const userJson = localStorage.getItem("autoparts_user");
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUserFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (credentials: LoginParams): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData = await loginUser(credentials);
      setUser(userData);
      localStorage.setItem("autoparts_user", JSON.stringify(userData));
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue de nouveau, ${userData.firstName}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Connexion échouée",
        description: "Nom d'utilisateur ou mot de passe invalide",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterUserParams): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      localStorage.setItem("autoparts_user", JSON.stringify(newUser));
      
      toast({
        title: "Inscription réussie",
        description: `Bienvenue, ${newUser.firstName}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Inscription échouée",
        description: "Impossible de créer votre compte. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("autoparts_user");
    
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
