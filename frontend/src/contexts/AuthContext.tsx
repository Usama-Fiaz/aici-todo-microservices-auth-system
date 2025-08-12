import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  uuid: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  const userServiceUrl = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';

  const decodeJwt = (jwtToken: string): Partial<User> | null => {
    try {
      const base64Url = jwtToken.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload?.uuid && payload?.email) return { uuid: payload.uuid, email: payload.email } as User;
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Hydrate user on initial load if available
      if (!user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // fallback to decoding token
            const decoded = decodeJwt(token);
            if (decoded?.uuid && decoded?.email) {
              setUser({ uuid: decoded.uuid, email: decoded.email } as User);
            }
          }
        } else {
          const decoded = decodeJwt(token);
          if (decoded?.uuid && decoded?.email) {
            setUser({ uuid: decoded.uuid, email: decoded.email } as User);
          }
        }
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${userServiceUrl}/api/auth/login`, {
        email,
        password
      });

      const { user: userData, token: authToken } = response.data.data;
      
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${userServiceUrl}/api/auth/register`, {
        email,
        password
      });

      // After successful registration, automatically log in
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 