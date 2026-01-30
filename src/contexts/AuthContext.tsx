import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const AUTH_STORAGE_KEY = "dashboard_user";

export interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        if (parsed?.email) setUser(parsed);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      return { ok: false, error: "Informe o e-mail." };
    }
    if (!trimmedPassword) {
      return { ok: false, error: "Informe a senha." };
    }

    // Validação simples de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { ok: false, error: "E-mail inválido." };
    }

    // Autenticação local (sem backend de usuários por enquanto)
    // Aceita qualquer e-mail + senha com pelo menos 4 caracteres
    if (trimmedPassword.length < 4) {
      return { ok: false, error: "A senha deve ter pelo menos 4 caracteres." };
    }

    const name = trimmedEmail.split("@")[0].replace(/[._]/g, " ");
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const userData: User = { email: trimmedEmail, name: nameCapitalized };

    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
