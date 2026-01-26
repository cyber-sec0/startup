import React, { createContext, useState, useEffect, useContext } from 'react';

// FIX: Added 'export' here so ProtectedRoutes can import it
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if we are already logged in (optional check endpoint)
  useEffect(() => {
    const checkLogin = async () => {
      // Logic to check if cookie exists/is valid could go here
      // For simplicity in this step, we start null or rely on page load
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ email, id: data.id }); // Update React state
        return { success: true };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
        return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userName, email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ email, id: data.id });
        return { success: true };
      } else {
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
        return { success: false, message: 'Network error' };
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'DELETE' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);