'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import {
  Github,
  Twitter,
  Link as LinkIcon,
  Filter,
  Calendar,
  Search,
  Award,
  Clock,
  Code,
  Star,
  Edit,
  Save,
  X,
  Plus,
  Pencil,
  Trash,
  Linkedin,
  ExternalLink,
} from 'lucide-react';
import { useAuth, useCodeforcesData, Submission } from '@/app/providers';
import {
  getRatingColor,
  getRatingRank,
  formatDate,
  formatVerdict,
  formatMemory,
  formatTime,
} from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
type UserProfile = {
  handle: string;
  name: string;
  rating: number;
  rank: string;
  maxRating: number;
  maxRank: string;
  country: string;
  organization: string;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
  contribution: number;
  lastOnlineTimeSeconds: number;
  aboutMe: string;
  websites: any[];
};
export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  const { submissions, isLoading, profileData } = useCodeforcesData();
  // console.log(profileData);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  // States for edit mode
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [websiteLinks, setWebsiteLinks] = useState<
    Array<{ name: string; url: string; icon: any }>
  >([]);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState('website');

  // Mocked profile data
  const [profile, setProfile] = useState<UserProfile>({
    handle: '',
    name: '',
    rating: 0,
    rank: '',
    maxRating: 0,
    maxRank: '',
    country: '',
    organization: '',
    registrationTimeSeconds: 0,
    friendOfCount: 0,
    avatar: '',
    titlePhoto: '',
    contribution: 0,
    lastOnlineTimeSeconds: 0,
    aboutMe: '',
    websites: [],
  });

  // Filter submissions and set up
  useEffect(() => {
    setMounted(true);

    if (!isLoading && submissions && submissions.length > 0) {
      setUserSubmissions(submissions);
      setFilteredSubmissions(submissions);
    }

    // Initialize edit states
    setAboutText(profile.aboutMe);
    setWebsiteLinks([...profile.websites]);
  }, [isLoading, submissions]);
  useEffect(() => {
    if (profileData && profileData.length > 0) {
      // console.log("Setting profile data:", profileData[0]);

      // Create default websites array if not available
      const defaultWebsites = [
        {
          name: 'GitHub',
          url: 'https://github.com/' + username,
          icon: <Github className="h-4 w-4" />,
        },
        {
          name: 'Twitter',
          url: 'https://twitter.com/' + username,
          icon: <Twitter className="h-4 w-4" />,
        },
        {
          name: 'Personal Website',
          url: 'https://' + username + '.me',
          icon: <LinkIcon className="h-4 w-4" />,
        },
      ];
      const transformedWebsites =
        profileData[0]?.websites?.map((url: any) => {
          // Determine the type of website based on the URL
          if (url.includes('github.com')) {
            return {
              name: 'GitHub',
              url,
              icon: <Github className="h-4 w-4" />,
            };
          } else if (url.includes('twitter.com')) {
            return {
              name: 'Twitter',
              url,
              icon: <Twitter className="h-4 w-4" />,
            };
          } else if (url.includes('linkedin.com')) {
            return {
              name: 'LinkedIn',
              url,
              icon: <Linkedin className="h-4 w-4" />,
            };
          } else {
            return {
              name: 'Website',
              url,
              icon: <LinkIcon className="h-4 w-4" />,
            };
          }
        }) || defaultWebsites;
      const newProfile = {
        handle: username,
        name:
          profileData[0]?.firstName && profileData[0]?.lastName
            ? `${profileData[0].firstName} ${profileData[0].lastName}`
            : username,
        rating: profileData[0]?.rating || 0,
        rank: profileData[0]?.rank || '',
        maxRating: profileData[0]?.maxRating || 0,
        maxRank: profileData[0]?.maxRank || '',
        country: profileData[0]?.country || '',
        organization: profileData[0]?.organization || '',
        registrationTimeSeconds: profileData[0]?.registrationTimeSeconds || 0,
        friendOfCount: profileData[0]?.friendOfCount || 0,
        avatar:
          profileData[0]?.avatar ||
          'https://userpic.codeforces.org/no-avatar.jpg',
        titlePhoto: profileData[0]?.titlePhoto || '',
        contribution: profileData[0]?.contribution || 0,
        lastOnlineTimeSeconds: profileData[0]?.lastOnlineTimeSeconds || 0,
        aboutMe: profileData[0]?.aboutMe || 'No information provided.',
        websites: transformedWebsites,
      };

      setProfile(newProfile);

      // Initialize edit states after profile is set
      setAboutText(newProfile.aboutMe);
      setWebsiteLinks([...newProfile.websites]);
    }
  }, [profileData, username]);
  const [verdictFilter, setVerdictFilter] = useState('');

  // Handle verdict filter
  useEffect(() => {
    if (verdictFilter === '') {
      setFilteredSubmissions(userSubmissions);
    } else {
      setFilteredSubmissions(
        userSubmissions.filter((submission) =>
          submission.verdict.toLowerCase().includes(verdictFilter.toLowerCase())
        )
      );
    }
  }, [verdictFilter, userSubmissions]);
  // Handle search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubmissions(userSubmissions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSubmissions(
        userSubmissions.filter(
          (submission) =>
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
      accessorKey: 'problemName',
      header: 'Problem',
      cell: (info: any) => <div className="font-medium">{info.getValue()}</div>,
    },
    {
      accessorKey: 'verdict',
      header: 'Verdict',
      cell: (info: any) => {
        const { text, color } = formatVerdict(info.getValue());
        return <span className={color}>{text}</span>;
      },
    },
    {
      accessorKey: 'language',
      header: 'Language',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'timeSubmitted',
      header: 'Submitted',
      cell: (info: any) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'executionTime',
      header: 'Time',
      cell: (info: any) => formatTime(info.getValue()),
    },
    {
      accessorKey: 'memoryUsed',
      header: 'Memory',
      cell: (info: any) => formatMemory(info.getValue()),
    },
  ];
  const { pastContest } = useCodeforcesData();
  // Statistics
  const stats = {
    totalSolved: userSubmissions.filter((s) => s.verdict === 'OK').length,
    acceptedRate:
      userSubmissions.length > 0
        ? Math.round(
            (userSubmissions.filter((s) => s.verdict === 'OK').length /
              userSubmissions.length) *
              100
          )
        : 0,
    contestsParticipated: pastContest.length,
    // maxStreak: 14,
    // currentStreak: 3,
  };

  // Save about text
  const handleSaveAbout = async () => {
    try {
      const res = await axios.patch('/api/aboutMe', { aboutMe: aboutText });
      if (res.status !== 200) throw 'failed to update aboutme';
      setProfile((prev) => ({
        ...prev,
        aboutMe: aboutText,
      }));
    } catch (err) {
      console.log(err);
    }
    setIsEditingAbout(false);
  };

  // Save links
  const handleSaveLinks = async () => {
    try {
      const res = await axios.post('/api/websites', {
        links: websiteLinks.map((url) => url.url),
      });
      if (res.status !== 200) throw 'failed to update aboutme';
      setProfile((prev) => ({
        ...prev,
        websites: [...websiteLinks],
      }));
    } catch (err) {
      console.log(err);
    }
    setIsEditingLinks(false);
  };

  // Add new link
  const handleAddLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      let icon;
      switch (newLinkType) {
        case 'github':
          icon = <Github className="h-4 w-4" />;
          break;
        case 'twitter':
          icon = <Twitter className="h-4 w-4" />;
          break;
        case 'linkedin':
          icon = <Linkedin className="h-4 w-4" />;
        default:
          icon = <LinkIcon className="h-4 w-4" />;
      }

      setWebsiteLinks((prev) => [
        ...prev,
        {
          name: newLinkName,
          url: newLinkUrl.startsWith('http')
            ? newLinkUrl
            : `https://${newLinkUrl}`,
          icon,
        },
      ]);

      setNewLinkName('');
      setNewLinkUrl('');
      setNewLinkType('website');
    }
  };

  // Remove link
  const handleRemoveLink = (index: number) => {
    setWebsiteLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Check if current user is viewing their own profile
  const isOwnProfile = user?.handle === username;

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  // console.log("filtered->",filteredSubmissions);
  return (
    <AppShell>
      <div className="container mx-auto py-3 sm:py-4 md:py-6 px-2 sm:px-4">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    className="rounded-full h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-cover border-3 sm:border-4 border-background"
                  />
                  <div
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold whitespace-nowrap ${getRatingColor(profile.rating)}`}
                  >
                    {profile.rating}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.handle}</h2>
                  <p className="text-muted-foreground">{profile.name}</p>
                  <div
                    className={`mt-1 text-sm font-medium ${getRatingColor(profile.rating)}`}
                  >
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
                  <p className="text-xl font-bold">
                    {stats.contestsParticipated}
                  </p>
                </div>
                {/* <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Max Streak</p>
                  <p className="text-xl font-bold">{stats.maxStreak}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-xl font-bold">{stats.currentStreak}</p>
                </div> */}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">About</h3>
                  {isOwnProfile && !isEditingAbout && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setIsEditingAbout(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {isEditingAbout ? (
                  <div className="space-y-2">
                    <Textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      className="h-24 text-sm"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingAbout(false);
                          setAboutText(profile.aboutMe);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveAbout}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile.aboutMe}
                  </p>
                )}
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
                    <span>
                      {new Date(
                        profile.registrationTimeSeconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  </li>
                  {profile.organization && (
                    <li className="flex items-center gap-2 text-sm">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Organization:
                      </span>
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Links</h3>
                  {isOwnProfile && !isEditingLinks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setIsEditingLinks(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {isEditingLinks ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {websiteLinks.map((site, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted">
                            {site.icon}
                            <span className="text-sm truncate flex-1">
                              {site.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveLink(index)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border rounded-md space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="link-name" className="text-xs">
                            Name
                          </Label>
                          <Input
                            id="link-name"
                            value={newLinkName}
                            onChange={(e) => setNewLinkName(e.target.value)}
                            placeholder="GitHub"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="link-type" className="text-xs">
                            Type
                          </Label>
                          <select
                            id="link-type"
                            value={newLinkType}
                            onChange={(e) => setNewLinkType(e.target.value)}
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="website">Website</option>
                            <option value="github">GitHub</option>
                            <option value="twitter">Twitter</option>
                            <option value="linkedin">Linkedin</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="link-url" className="text-xs">
                          URL
                        </Label>
                        <Input
                          id="link-url"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={handleAddLink}
                        disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Link
                      </Button>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingLinks(false);
                          setWebsiteLinks([...profile.websites]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveLinks}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.websites.map((site, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          {site.icon}
                          <span>{site.name}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {user?.handle !== username && (
                <Button className="w-full">Follow User</Button>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    Recent Submissions
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Latest problem submissions by {profile.handle}
                  </CardDescription>
                </div>
                {!isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://codeforces.com/profile/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View on CodeForces</span>
                    </a>
                  </Button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search submissions..."
                    className="pl-8 text-sm h-8 sm:h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                    className="h-8 sm:h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All Verdicts</option>
                    <option value="OK">Accepted</option>
                    <option value="WRONG_ANSWER">Wrong Answer</option>
                    <option value="TIME_LIMIT_EXCEEDED">
                      Time Limit Exceeded
                    </option>
                    <option value="MEMORY_LIMIT_EXCEEDED">
                      Memory Limit Exceeded
                    </option>
                    <option value="RUNTIME_ERROR">Runtime Error</option>
                  </select>
                  {/*     
    <Button variant="outline" size="icon" className="h-8 sm:h-10 w-8 sm:w-10">
      <Filter className="h-4 w-4" />
    </Button> */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSubmissions && filteredSubmissions.length > 0 ? (
                <>
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredSubmissions.length} submissions
                    </p>
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredSubmissions}
                    pageSize={10}
                  />
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No submissions found</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="px-3 sm:px-4 pt-0 pb-3 sm:pb-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://codeforces.com/submissions/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View All on CodeForces
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
