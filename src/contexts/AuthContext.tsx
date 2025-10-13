import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'teacher' | 'student') => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Reconstruct User object with proper structure
        const userObj: User = {
          id: parsedUser.id?.toString() || '',
          name: parsedUser.username || parsedUser.name || '',
          email: parsedUser.email || '',
          role: parsedUser.role || 'student',
          class: parsedUser.class_name || parsedUser.class,
          subject: parsedUser.subject,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.username || parsedUser.name}`,
          isOnline: true,
          lastActive: new Date()
        };
        setUser(userObj);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'teacher' | 'student'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call the backend API with correct endpoint
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Login failed:', data.message);
        setIsLoading(false);
        return false;
      }

      // Check if role matches
      if (data.user.role !== role) {
        console.error('Role mismatch:', data.user.role, 'vs', role);
        setIsLoading(false);
        return false;
      }

      // Create user object from API response
      const loggedInUser: User = {
        id: data.user.id?.toString() || '',
        name: data.user.username || data.user.name || '',
        email: data.user.email || email,
        role: data.user.role || role,
        class: data.user.class_name || data.user.class,
        subject: data.user.subject,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username || data.user.name}`,
        isOnline: true,
        lastActive: new Date()
      };

      // Store user and token
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      console.log('Login successful:', loggedInUser);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    const currentUser = user;
    
    // Call logout API if user exists
    if (currentUser) {
      try {
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: currentUser.id }),
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    // Clear local state and storage
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}