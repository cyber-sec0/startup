import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // MOCK: Check if user is in localStorage
  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Simulate network check
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // MOCK: Login function using localStorage users
  const login = async (credentials) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);

      if (foundUser) {
        // Save to "session"
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // MOCK: Register function using localStorage
  const register = async (userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check for existing
      if (users.some(u => u.email === userData.email)) {
        throw new Error('User already exists');
      }

      const newUser = {
        ...userData,
        id: Date.now(), // simple mock ID
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto login
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      await checkAuthStatus();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // MOCK: Logout
  const logout = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // MOCK: Verify auth (alias for checkAuthStatus for compatibility)
  const verifyAuth = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading,
      login, 
      logout,
      register,
      checkAuthStatus,
      verifyAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};