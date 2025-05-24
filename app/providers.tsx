'use client';
import { signIn, signOut, SessionProvider } from 'next-auth/react';

import { getToken } from 'next-auth/jwt';
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { ThemeProvider } from 'next-themes';
import axios from 'axios';
import {
  mockSubmissions,
  transformSubmissions,
  transformProblems,
  transformFriends,
} from '@/lib/mockData';

// Auth Context
type User = {
  handle: string;
  avatar: string;
  email: string;
  rating: number;
  rank: string;
  isAuthenticated: boolean;
};
interface DataProviderProps {
  children: ReactNode;
  serverData: {
    rawSubmissions: any[];
    rawContests: any[];
    rawPastContestData?: any[];
    rawProfileData: any[];
    rawFriends: any[];
  };
}
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
  pastContest: any[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  profileData: any[];
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
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
  // rsvp: boolean;
  // ratingDelta?: number;
};

export type Friend = {
  handle: string;
  rating: number;
  rank: string;
  avatar: string;
  isFollowing: boolean;
  // isFollower?:boolean;
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
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Initialize user from session token
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Use fetch to access the session data
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        // console.log(session);

        if (session && session.user) {
          setUser({
            ...defaultUser,
            handle: session.user.username || 'guest',
            // email: session.user.email || 'user@example.com',
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
          handle: handle,
          // email: sessionData.user.email || 'user@example.com',
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
        // console.log('Signup success');
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
    <AuthContext.Provider
      value={{ user, login, logout, signup, isLoading: isAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
const DataProvider = ({ children, serverData }: DataProviderProps) => {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pastContest, setPastContest] = useState<any>([]);
  const [profileData, setProfileData] = useState<any>([]);
  // Load mock data
  useEffect(() => {
    if (serverData?.rawSubmissions?.length || serverData?.rawContests?.length) {
      import('@/lib/mockData').then(
        ({
          mockProblems,
          mockSubmissions,
          mockContests,
          mockFriends,
          mockLeaderboard,
        }) => {
          setProblems(transformProblems(serverData.rawSubmissions));
          // console.log(serverData.rawSubmissions);
          setSubmissions(transformSubmissions(serverData.rawSubmissions));
          // console.log(serverData.rawContests);
          // console.log("AR->",serverData);
          setContests(serverData.rawContests);
          setFriends(serverData.rawFriends);
          setLeaderboard(mockLeaderboard);
          setIsDataLoading(false);
          // console.log(serverData.rawPastContestData);
          setPastContest(serverData.rawPastContestData);
          setProfileData(serverData.rawProfileData);
        }
      );
    } else {
      import('@/lib/mockData').then(
        ({
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
        }
      );
    }
  }, [serverData]);

  return (
    <DataContext.Provider
      value={{
        problems,
        submissions,
        contests,
        users,
        friends,
        leaderboard,
        pastContest,
        isLoading: isDataLoading,
        profileData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
// Providers Component
export function Providers({ children, serverData }: DataProviderProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DataProvider serverData={serverData}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
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
