'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserPlus,
  User,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useCodeforcesData, LeaderboardEntry } from '@/app/providers';
import { getRatingColor } from '@/lib/utils';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';

export default function LeaderboardPage() {
  const { leaderboard, friends, isLoading } = useCodeforcesData();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set initial data and filter by search
  useEffect(() => {
    if (!isLoading) {
      // Filter based on search query
      const filtered =
        searchQuery.trim() === ''
          ? leaderboard
          : leaderboard.filter((entry) =>
              entry.handle.toLowerCase().includes(searchQuery.toLowerCase())
            );

      setFilteredLeaderboard(filtered);

      // Create friends leaderboard
      const friendEntries = leaderboard.filter((entry) => entry.isFriend);
      setFriendsLeaderboard(friendEntries);
    }
  }, [isLoading, leaderboard, searchQuery]);

  // Define columns
  const columns = [
    {
      id: 'rank',
      header: 'Rank',
      cell: (info: any) => {
        const rank = info.getValue();
        const rankChange = info.row.original.rankChange;

        let changeIcon = null;
        if (rankChange > 0) {
          changeIcon = <TrendingUp className="h-3 w-3 text-green-500" />;
        } else if (rankChange < 0) {
          changeIcon = <TrendingDown className="h-3 w-3 text-red-500" />;
        }

        return (
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{rank}</span>
            {changeIcon}
          </div>
        );
      },
    },
    {
      id: 'handle',
      header: 'User',
      cell: (info: any) => {
        const handle = info.getValue();
        const rating = info.row.original.rating;
        const avatar = info.row.original.avatar;
        const isFriend = info.row.original.isFriend;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={handle} />
              <AvatarFallback>
                {handle && handle.length > 0
                  ? handle.substring(0, 2).toUpperCase()
                  : 'UN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${handle || ''}`}
                className={`font-medium ${getRatingColor(rating)} hover:underline`}
              >
                {handle || 'Unknown User'}
              </Link>
              {isFriend && (
                <Badge className="ml-2 h-4 py-0" variant="outline">
                  Friend
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: (info: any) => {
        const rating = info.getValue();
        const rankChange = info.row.original.rankChange;

        let changeElement = null;
        if (rankChange > 0) {
          changeElement = (
            <span className="text-xs text-green-500 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {Math.abs(rankChange)}
            </span>
          );
        } else if (rankChange < 0) {
          changeElement = (
            <span className="text-xs text-red-500 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
              {Math.abs(rankChange)}
            </span>
          );
        } else {
          changeElement = (
            <span className="text-xs text-muted-foreground flex items-center">
              <Minus className="h-3 w-3 mr-0.5" />0
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span className={getRatingColor(rating)}>{rating}</span>
            {changeElement}
          </div>
        );
      },
    },
    {
      id: 'solved',
      header: 'Solved',
      meta: { hiddenOnMobile: true },
      cell: (info: any) => info.getValue(),
    },
    {
      id: 'contests',
      header: 'Contests',
      meta: { hiddenOnMobile: true },
      cell: (info: any) => info.getValue(),
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        const handle = info.row.original.handle;
        const isFriend = info.row.original.isFriend;

        return (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>User Information</DialogTitle>
                  <DialogDescription>Details about {handle}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-4 py-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={info.row.original.avatar} alt={handle} />
                    <AvatarFallback>
                      {handle && handle.length > 0
                        ? handle.substring(0, 2).toUpperCase()
                        : 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3
                      className={`text-xl font-bold ${getRatingColor(info.row.original.rating)}`}
                    >
                      {handle || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Rank: {info.row.original.rank}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" asChild>
                        <Link href={`/profile/${handle || ''}`}>
                          <User className="h-4 w-4 mr-1" />
                          Profile
                        </Link>
                      </Button>
                      {!isFriend && (
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-3 sm:py-4 md:py-6 px-2 sm:px-4">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
              <div className="flex flex-col w-full md:flex-row md:items-center justify-between gap-2 sm:gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    Leaderboard
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Global and friends rankings
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-auto mt-2 md:mt-0">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 w-full md:w-[180px] lg:w-[250px] xl:w-[300px] text-sm h-8 sm:h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="global">
                <TabsList className="mb-3 sm:mb-4 w-full flex overflow-x-auto no-scrollbar">
                  <TabsTrigger
                    value="global"
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Global
                  </TabsTrigger>
                  <TabsTrigger
                    value="friends"
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Friends
                  </TabsTrigger>
                  <TabsTrigger
                    value="country"
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Country
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="global" className="space-y-4">
                  <DataTable
                    columns={columns}
                    data={filteredLeaderboard}
                    pageSize={10}
                  />
                </TabsContent>

                <TabsContent value="friends" className="space-y-4">
                  {friendsLeaderboard.length > 0 ? (
                    <DataTable
                      columns={columns}
                      data={friendsLeaderboard}
                      pageSize={10}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">
                        No Friends Yet
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        Follow other users to see them in your friends
                        leaderboard
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/friends">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Find Friends
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="country" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="h-12 w-12 mx-auto text-muted-foreground opacity-50">
                      🌎
                    </div>
                    <h3 className="mt-4 text-lg font-medium">
                      Country Rankings
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Country-based leaderboards coming soon
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
