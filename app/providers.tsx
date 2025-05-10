'use client';
import { signIn, signOut, SessionProvider } from "next-auth/react";

import { getToken } from "next-auth/jwt";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { ThemeProvider } from 'next-themes';
import axios from 'axios';

// Auth Context
type User = {
  handle: string;
  avatar: string;
  email: string;
  rating: number;
  rank: string;
  isAuthenticated: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (handle: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (handle: string, password: string) => Promise<boolean>;
  isLoading: boolean;
};

const defaultUser: User = {
  handle: 'tourist',
  avatar: 'https://avatars.githubusercontent.com/u/16591379?v=4',
  email: 'tourist@codeforces.com',
  rating: 3800,
  rank: 'Legendary Grandmaster',
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Data Context for CodeForces data
type DataContextType = {
  problems: Problem[];
  submissions: Submission[];
  contests: Contest[];
  users: User[];
  friends: Friend[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
};

export type Problem = {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  solved: boolean;
  contestId?: string;
  index?: string;
};

export type Submission = {
  id: string;
  problemId: string;
  problemName: string;
  verdict:
    | 'OK'
    | 'WRONG_ANSWER'
    | 'TIME_LIMIT_EXCEEDED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'RUNTIME_ERROR'
    | 'COMPILATION_ERROR';
  language: string;
  timeSubmitted: string;
  executionTime: number;
  memoryUsed: number;
  contestId?: string;
  rating?: number;
};

export type Contest = {
  id: string;
  name: string;
  startTime: string;
  duration: number; // in minutes
  type: 'Div. 1' | 'Div. 2' | 'Div. 3' | 'Div. 4' | 'Educational' | 'Global';
  phase:
    | 'BEFORE'
    | 'CODING'
    | 'PENDING_SYSTEM_TEST'
    | 'SYSTEM_TEST'
    | 'FINISHED';
  rsvp: boolean;
  ratingDelta?: number;
};

export type Friend = {
  handle: string;
  rating: number;
  rank: string;
  avatar: string;
  isFollowing: boolean;
  lastSeen: string;
  recentActivity?: {
    type: 'SOLVED' | 'PARTICIPATED' | 'RANKED_UP';
    problemId?: string;
    problemName?: string;
    contestId?: string;
    contestName?: string;
    timestamp: string;
  };
};

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  rating: number;
  solved: number;
  contests: number;
  rankChange: number;
  avatar: string;
  isFriend: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);
const AuthProvider=({children}:{children:ReactNode})=>{
    const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  // Initialize user from session token
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Use fetch to access the session data
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session && session.user) {
          setUser({
            ...defaultUser,
            handle: session.user.name || 'user',
            email: session.user.email || 'user@example.com',
            isAuthenticated: true,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    initializeUser();
  }, []);
  // 1. Login function
  const login = async (handle: string, password: string): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      // Use NextAuth's signIn function directly
      const response = await signIn('credentials', {
        redirect: false,
        username: handle,
        password: password,
      });
      
      if (response?.error) {
        console.error('Login failed: ', response.error);
        setIsAuthLoading(false);
        return false;
      }
      
      // Refresh the session to get updated user data
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (sessionData && sessionData.user) {
        setUser({
          ...defaultUser,
          handle: sessionData.user.name || 'user',
          email: sessionData.user.email || 'user@example.com',
          isAuthenticated: true,
        });
        setIsAuthLoading(false);
        return true;
      }
      
      setIsAuthLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthLoading(false);
      return false;
    }
  };
  
  // 2. Logout function
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // 3. Signup function
  const signup = async (handle: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post('/api/signup', {
        username: handle,
        password,
      });
      
      if (res.status === 201 && res.data.success === true) {
        console.log('Signup success');
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Signup failed:', err);
      return false;
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading: isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Load mock data
  useEffect(() => {
    import('@/lib/mockData').then(({
      mockProblems,
      mockSubmissions,
      mockContests,
      mockFriends,
      mockLeaderboard,
    }) => {
      setProblems(mockProblems);
      setSubmissions(mockSubmissions);
      setContests(mockContests);
      setFriends(mockFriends);
      setLeaderboard(mockLeaderboard);
      setIsDataLoading(false);
    });
  }, []);
  
  return (
    <DataContext.Provider value={{
      problems,
      submissions,
      contests,
      users,
      friends,
      leaderboard,
      isLoading: isDataLoading,
    }}>
      {children}
    </DataContext.Provider>
  );
};
// Providers Component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
// Custom hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useCodeforcesData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useCodeforcesData must be used within a DataProvider');
  }
  return context;
};
