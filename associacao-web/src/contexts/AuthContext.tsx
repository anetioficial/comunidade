import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Replace with your actual backend URL
const API_URL = 'http://localhost:3000'; // Or your deployed backend URL

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (name: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          // Validate token by fetching user profile
          const response = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('userToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        setIsAuthenticated(true);
        
        // Fetch user data after successful login
        const userResponse = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
        setUser(userResponse.data);
        
        return { success: true };
      } else {
        return { success: false, message: 'Resposta inválida do servidor.' };
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.' 
      };
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao iniciar cadastro. Tente novamente.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // Update profile function
  const updateProfile = async (name: string) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, message: 'Token de autenticação não encontrado.' };
      }

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      return { success: true, data: response.data.user };
    } catch (error: any) {
      console.error("Update profile error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível atualizar o perfil.' 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
