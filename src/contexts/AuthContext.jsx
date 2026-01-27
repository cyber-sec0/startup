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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  //Check authentication status
  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      //Check if we have a stored email to verify
      const storedEmail = sessionStorage.getItem('userEmail');
      
      if (!storedEmail) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/user/${storedEmail}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          sessionStorage.removeItem('userEmail');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('userEmail');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  //Login function
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const userData = await response.json();
        sessionStorage.setItem('userEmail', userData.email);
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  //Register function
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userEmail', data.email);
        await checkAuthStatus();
        return true;
      }
      
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  //Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      sessionStorage.removeItem('userEmail');
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

  //Verify auth (alias for checkAuthStatus)
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