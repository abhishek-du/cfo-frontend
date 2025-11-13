import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/api/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  company_name: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/me')
        .then(response => {
          // ✅ FIXED: Transform /me response if needed
          // If your backend /me returns the user directly:
          setUser(response.data.user || response.data);
        })
        .catch(error => {
          console.error('Failed to fetch user with token', error);
          localStorage.removeItem('access_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
