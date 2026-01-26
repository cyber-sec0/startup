import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      // Optional: Check if token exists in cookies by calling an endpoint
      // const res = await fetch('/api/user/me');
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
        setUser({ email, id: data.id });
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.msg || 'Login failed' };
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
      // FIX: Ensure all 3 fields are sent in the body
      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userName, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ email, id: data.id, userName });
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.msg || 'Registration failed' };
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