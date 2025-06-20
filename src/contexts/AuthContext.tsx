import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  name: string;
  authToken: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUserName: (newName: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('hacknest_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('hacknest_user');
      }
    }
    setLoading(false);
  }, []);

  function login(userData: User) {
    setCurrentUser(userData);
    localStorage.setItem('hacknest_user', JSON.stringify(userData));
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('hacknest_user');
  }

  function updateUserName(newName: string) {
    if (currentUser) {
      const updatedUser = { ...currentUser, name: newName };
      setCurrentUser(updatedUser);
      localStorage.setItem('hacknest_user', JSON.stringify(updatedUser));
    }
  }

  const value = {
    currentUser,
    login,
    logout,
    updateUserName,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}