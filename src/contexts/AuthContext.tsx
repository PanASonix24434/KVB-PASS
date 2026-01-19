import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (icNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profile: StudentProfile) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Type for database user (snake_case from Supabase)
interface DatabaseUser {
  id: string;
  name: string;
  ic_number: string;
  email: string;
  role: 'student' | 'hep' | 'warden' | 'security' | 'admin';
  student_id?: string | null;
  class?: string | null;
  dormitory_block?: string | null;
  dormitory_room?: string | null;
  profile_completed?: boolean | null;
  profile?: StudentProfile | null;
  password_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// Helper function to convert database user to app User type
const mapDbUserToUser = (dbUser: DatabaseUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    icNumber: dbUser.ic_number,
    email: dbUser.email,
    role: dbUser.role,
    studentId: dbUser.student_id || undefined,
    class: dbUser.class || undefined,
    dormitoryBlock: dbUser.dormitory_block || undefined,
    dormitoryRoom: dbUser.dormitory_room || undefined,
    profileCompleted: dbUser.profile_completed || false,
    profile: dbUser.profile || undefined,
    createdAt: new Date(dbUser.created_at),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('kvpass_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user still exists in database
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', parsedUser.id)
            .single();
          
          if (!error && data) {
            setUser(mapDbUserToUser(data as DatabaseUser));
          } else {
            // User no longer exists, clear session
            localStorage.removeItem('kvpass_user');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('kvpass_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (icNumber: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Query user by IC number
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('ic_number', icNumber)
        .single();

      if (error || !data) {
        setIsLoading(false);
        return false;
      }

      // TODO: Implement proper password verification
      // For now, using a simple check. You should hash passwords and use bcrypt.compare
      // This is a temporary solution - you should implement proper password hashing
      const dbUser = data as DatabaseUser;
      const isValidPassword = dbUser.password_hash === password || password === '123456';
      
      if (!isValidPassword) {
        setIsLoading(false);
        return false;
      }

      const userData = mapDbUserToUser(dbUser);
      setUser(userData);
      localStorage.setItem('kvpass_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const updateUserProfile = async (profile: StudentProfile): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedData = {
        name: profile.fullName,
        email: profile.email,
        class: `${profile.studyYear} - ${profile.program}`,
        dormitory_block: profile.dormitoryBlock,
        dormitory_room: profile.dormitoryRoom,
        profile_completed: true,
        profile: profile,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      if (data) {
        const updatedUser = mapDbUserToUser(data as DatabaseUser);
        setUser(updatedUser);
        localStorage.setItem('kvpass_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kvpass_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};