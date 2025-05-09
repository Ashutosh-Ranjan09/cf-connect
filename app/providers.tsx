'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

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
  verdict: 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
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
  phase: 'BEFORE' | 'CODING' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST' | 'FINISHED';
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

// Providers Component
export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  
  // Mock data
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Check for stored auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('cf_connect_auth');
    if (storedAuth) {
      try {
        const parsedUser = JSON.parse(storedAuth);
        setUser({ ...parsedUser, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse stored auth');
      }
    }
    setIsAuthLoading(false);
    
    // Load mock data
    import('@/lib/mockData').then(({ 
      mockProblems, 
      mockSubmissions, 
      mockContests, 
      mockUsers,
      mockFriends,
      mockLeaderboard
    }) => {
      setProblems(mockProblems);
      setSubmissions(mockSubmissions);
      setContests(mockContests);
      setUsers(mockUsers);
      setFriends(mockFriends);
      setLeaderboard(mockLeaderboard);
      setIsDataLoading(false);
    });
  }, []);

  const login = async (handle: string, password: string): Promise<boolean> => {
    // Mock login
    setIsAuthLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setUser({ ...defaultUser, handle, isAuthenticated: true });
        localStorage.setItem('cf_connect_auth', JSON.stringify({ ...defaultUser, handle }));
        setIsAuthLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cf_connect_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: isAuthLoading }}>
      <DataContext.Provider value={{ 
        problems, 
        submissions, 
        contests, 
        users, 
        friends, 
        leaderboard, 
        isLoading: isDataLoading 
      }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </DataContext.Provider>
    </AuthContext.Provider>
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