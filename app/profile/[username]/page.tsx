'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { 
  Github, Twitter, Link as LinkIcon, Filter, Calendar, 
  Search, Award, Clock, Code, Star
} from 'lucide-react';
import { useAuth, useCodeforcesData, Submission } from '@/app/providers';
import { getRatingColor, getRatingRank, formatDate, formatVerdict, formatMemory, formatTime } from '@/lib/utils';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  const { submissions, isLoading } = useCodeforcesData();
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Mocked profile data
  const profile = {
    handle: username,
    name: username === 'tourist' ? 'Gennady Korotkevich' : `${username.charAt(0).toUpperCase() + username.slice(1)} Smith`,
    rating: 3800,
    rank: 'Legendary Grandmaster',
    maxRating: 3850,
    maxRank: 'Legendary Grandmaster',
    country: 'Belarus',
    organization: 'ITMO University',
    registrationTimeSeconds: 1363557752,
    friendOfCount: 538,
    avatar: 'https://avatars.githubusercontent.com/u/16591379?v=4',
    titlePhoto: 'https://userpic.codeforces.org/422/title/992a45504458a5c6.jpg',
    contribution: 169,
    lastOnlineTimeSeconds: 1686037752,
    aboutMe: "I'm a competitive programmer, @Google software engineer, and a professional Counter-Strike player.",
    websites: [
      { name: 'GitHub', url: 'https://github.com/tourist', icon: <Github className="h-4 w-4" /> },
      { name: 'Twitter', url: 'https://twitter.com/tourist', icon: <Twitter className="h-4 w-4" /> },
      { name: 'Personal Website', url: 'https://tourist.me', icon: <LinkIcon className="h-4 w-4" /> }
    ]
  };
  
  // Filter submissions and set up
  useEffect(() => {
    setMounted(true);
    
    if (!isLoading) {
      // Mock filtering for the specific user
      const filtered = submissions.slice(0, 50);
      setUserSubmissions(filtered);
      setFilteredSubmissions(filtered);
    }
  }, [isLoading, submissions, username]);
  
  // Handle search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubmissions(userSubmissions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSubmissions(
        userSubmissions.filter(submission => 
          submission.problemName.toLowerCase().includes(query) ||
          submission.verdict.toLowerCase().includes(query) ||
          submission.language.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, userSubmissions]);
  
  // Define table columns
  const columns = [
    {
      id: 'problemName',
      header: 'Problem',
      cell: (info: any) => <div className="font-medium">{info.getValue()}</div>,
    },
    {
      id: 'verdict',
      header: 'Verdict',
      cell: (info: any) => {
        const { text, color } = formatVerdict(info.getValue());
        return <span className={color}>{text}</span>;
      },
    },
    {
      id: 'language',
      header: 'Language',
      cell: (info: any) => info.getValue(),
    },
    {
      id: 'timeSubmitted',
      header: 'Submitted',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      id: 'executionTime',
      header: 'Time',
      cell: (info: any) => formatTime(info.getValue()),
    },
    {
      id: 'memoryUsed',
      header: 'Memory',
      cell: (info: any) => formatMemory(info.getValue()),
    },
  ];
  
  // Statistics
  const stats = {
    totalSolved: userSubmissions.filter(s => s.verdict === 'OK').length,
    acceptedRate: userSubmissions.length > 0 
      ? Math.round((userSubmissions.filter(s => s.verdict === 'OK').length / userSubmissions.length) * 100) 
      : 0,
    contestsParticipated: 42,
    maxStreak: 14,
    currentStreak: 3
  };
  
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img 
                  src={profile.avatar} 
                  alt={profile.handle}
                  className="rounded-full h-24 w-24 object-cover border-4 border-background"
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getRatingColor(profile.rating)}`}>
                  {profile.rating}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{profile.handle}</h2>
                <p className="text-muted-foreground">{profile.name}</p>
                <div className={`mt-1 text-sm font-medium ${getRatingColor(profile.rating)}`}>
                  {profile.rank}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Solved</p>
                <p className="text-xl font-bold">{stats.totalSolved}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Contests</p>
                <p className="text-xl font-bold">{stats.contestsParticipated}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Max Streak</p>
                <p className="text-xl font-bold">{stats.maxStreak}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-xl font-bold">{stats.currentStreak}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{profile.aboutMe}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Personal Info</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Max Rating:</span>
                  <span className={getRatingColor(profile.maxRating)}>
                    {profile.maxRating} ({profile.maxRank})
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Registered:</span>
                  <span>{new Date(profile.registrationTimeSeconds * 1000).toLocaleDateString()}</span>
                </li>
                {profile.organization && (
                  <li className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Organization:</span>
                    <span>{profile.organization}</span>
                  </li>
                )}
                <li className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contribution:</span>
                  <span>{profile.contribution}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Links</h3>
              <div className="flex flex-wrap gap-2">
                {profile.websites.map((site, index) => (
                  <Button key={index} variant="outline" size="sm" asChild>
                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      {site.icon}
                      <span>{site.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
            
            {user?.handle !== username && (
              <Button className="w-full">Follow User</Button>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Recent problem submissions</CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search submissions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredSubmissions}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}