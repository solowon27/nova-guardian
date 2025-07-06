'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 1. Define the shape of the User object
// This should match the 'user' object returned by your GraphQL login mutation
interface User {
  _id: string;
  name: string;
  email?: string;      // Optional for child
  username?: string;   // Optional for parent
  role: 'PARENT' | 'CHILD';
  age?: number;
  token: string;
}

// 2. Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// 3. Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// 4. Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  // --- State now holds the entire user object, not just a boolean ---
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // --- On initial load, check for a user object in localStorage ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // --- Login function now accepts the full user object ---
  const login = (userData: User) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', userData.token); // ✅ Store the JWT
  setUser(userData);

  if (userData.role === 'PARENT') {
    router.push('/parent');
  } else {
    router.push('/child');
  }
};


  // --- Logout function clears the user object ---
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/'); // Redirect to homepage on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. Custom hook to consume the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
