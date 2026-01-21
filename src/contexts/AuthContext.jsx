import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Mock Login: Accept any user, or check against stored users if you built a mock user DB
    // For this assignment, we just simulate a successful login
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = { username, email: `${username}@example.com`, id: Date.now() };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ success: true });
      }, 500); // Fake network delay
    });
  };

  const register = async (username, email, password) => {
    // Mock Register
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { username, email, id: Date.now() };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve({ success: true });
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);