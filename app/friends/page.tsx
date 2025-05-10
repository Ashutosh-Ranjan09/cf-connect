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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Users, UserPlus, UserMinus, ExternalLink } from 'lucide-react';
import { useCodeforcesData, Friend } from '@/app/providers';
import { getRatingColor, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';

export default function FriendsPage() {
  const { friends, isLoading } = useCodeforcesData();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set initial data and handle search
  useEffect(() => {
    if (!isLoading) {
      setLocalFriends(friends);

      if (searchQuery.trim() === '') {
        setFilteredFriends(friends);
      } else {
        const query = searchQuery.toLowerCase();
        setFilteredFriends(
          friends.filter(
            (friend) =>
              friend.handle.toLowerCase().includes(query) ||
              friend.rank.toLowerCase().includes(query)
          )
        );
      }
    }
  }, [isLoading, friends, searchQuery]);

  // Toggle friend follow status
  const toggleFollow = (handle: string) => {
    setLocalFriends((prev) =>
      prev.map((friend) =>
        friend.handle === handle
          ? { ...friend, isFollowing: !friend.isFollowing }
          : friend
      )
    );
  };

  // Format activity message
  const formatActivity = (friend: Friend) => {
    if (!friend.recentActivity) return null;

    const { type, problemName, contestName, timestamp } = friend.recentActivity;

    let message;
    if (type === 'SOLVED' && problemName) {
      message = (
        <>
          solved problem <span className="font-medium">{problemName}</span>
        </>
      );
    } else if (type === 'PARTICIPATED' && contestName) {
      message = (
        <>
          participated in <span className="font-medium">{contestName}</span>
        </>
      );
    } else if (type === 'RANKED_UP') {
      message = (
        <>
          ranked up to{' '}
          <span className={`font-medium ${getRatingColor(friend.rating)}`}>
            {friend.rank}
          </span>
        </>
      );
    } else {
      return null;
    }

    return (
      <div className="flex items-start gap-2 sm:gap-3 pb-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={friend.avatar} alt={friend.handle} />
          <AvatarFallback>
            {friend.handle.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-xs sm:text-sm">
            <Link
              href={`/profile/${friend.handle}`}
              className={`font-medium ${getRatingColor(friend.rating)} hover:underline`}
            >
              {friend.handle}
            </Link>{' '}
            {message}
          </p>
          <div className="text-xs text-muted-foreground">
            {formatDate(timestamp || '')}
          </div>
        </div>
      </div>
    );
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="container px-3 py-3 mx-auto sm:px-4 sm:py-4 md:py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
          {/* Main content area - takes full width on mobile, 2/3 on large screens */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:col-span-2 order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                      Friends
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your competitive programming network
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search friends..."
                      className="pl-8 w-full sm:w-[180px] md:w-[220px] lg:w-[250px] h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <Tabs defaultValue="all">
                  <TabsList className="mb-3 sm:mb-4 w-full flex overflow-x-auto scrollbar-hide">
                    <TabsTrigger
                      value="all"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      All Friends
                    </TabsTrigger>
                    <TabsTrigger
                      value="following"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Following
                    </TabsTrigger>
                    <TabsTrigger
                      value="followers"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Followers
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3 sm:space-y-4">
                    {filteredFriends.length === 0 ? (
                      <div className="text-center py-4 sm:py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No friends found matching your search.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        {filteredFriends.map((friend) => (
                          <div
                            key={friend.handle}
                            className="bg-card border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                  src={friend.avatar}
                                  alt={friend.handle}
                                />
                                <AvatarFallback>
                                  {friend.handle.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <Link
                                    href={`/profile/${friend.handle}`}
                                    className="font-medium hover:underline text-sm truncate max-w-full sm:max-w-[120px] md:max-w-[150px]"
                                  >
                                    {friend.handle}
                                  </Link>
                                  <Badge
                                    variant="outline"
                                    className={`${getRatingColor(friend.rating)} text-xs`}
                                  >
                                    {friend.rating}
                                  </Badge>
                                </div>
                                <p
                                  className={`text-xs ${getRatingColor(friend.rating)} truncate`}
                                >
                                  {friend.rank}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto flex-shrink-0">
                              <Button
                                variant={
                                  friend.isFollowing ? 'default' : 'outline'
                                }
                                size="sm"
                                className="h-7 text-xs w-full sm:w-auto"
                                onClick={() => toggleFollow(friend.handle)}
                              >
                                {friend.isFollowing ? (
                                  <>
                                    <UserMinus className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">
                                      Unfollow
                                    </span>
                                    <span className="sm:hidden">Unfollow</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">
                                      Follow
                                    </span>
                                    <span className="sm:hidden">Follow</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                asChild
                              >
                                <Link href={`/profile/${friend.handle}`}>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="following" className="space-y-4">
                    {filteredFriends.filter((friend) => friend.isFollowing)
                      .length === 0 ? (
                      <div className="text-center py-4 sm:py-6">
                        <UserPlus className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          You're not following anyone yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        {filteredFriends
                          .filter((friend) => friend.isFollowing)
                          .map((friend) => (
                            <div
                              key={friend.handle}
                              className="bg-card border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage
                                    src={friend.avatar}
                                    alt={friend.handle}
                                  />
                                  <AvatarFallback>
                                    {friend.handle
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    <Link
                                      href={`/profile/${friend.handle}`}
                                      className="font-medium hover:underline text-sm truncate max-w-full sm:max-w-[120px] md:max-w-[150px]"
                                    >
                                      {friend.handle}
                                    </Link>
                                    <Badge
                                      variant="outline"
                                      className={`${getRatingColor(friend.rating)} text-xs`}
                                    >
                                      {friend.rating}
                                    </Badge>
                                  </div>
                                  <p
                                    className={`text-xs ${getRatingColor(friend.rating)} truncate`}
                                  >
                                    {friend.rank}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto flex-shrink-0">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-7 text-xs w-full sm:w-auto"
                                  onClick={() => toggleFollow(friend.handle)}
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">
                                    Unfollow
                                  </span>
                                  <span className="sm:hidden">Unfollow</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  asChild
                                >
                                  <Link href={`/profile/${friend.handle}`}>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="followers" className="space-y-4">
                    <div className="text-center py-4 sm:py-6">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Followers coming soon!
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar content - takes full width on mobile, 1/3 on large screens */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 order-1 lg:order-2 mb-3 lg:mb-0">
            {/* Activity Feed Card */}
            <Card className="overflow-hidden">
              <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Activity Feed
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Recent actions from your network
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="space-y-1">
                  {localFriends
                    .filter(
                      (friend) => friend.isFollowing && friend.recentActivity
                    )
                    .map((friend, index) => (
                      <div key={`${friend.handle}-${index}`}>
                        {formatActivity(friend)}
                        <Separator className="my-2" />
                      </div>
                    ))}
                  {localFriends.filter(
                    (friend) => friend.isFollowing && friend.recentActivity
                  ).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No recent activity.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Friend Suggestions Card */}
            <Card className="overflow-hidden">
              <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Friend Suggestions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  People you might know
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="space-y-3 sm:space-y-4">
                  {localFriends
                    .filter((friend) => !friend.isFollowing)
                    .slice(0, 3)
                    .map((friend) => (
                      <div
                        key={friend.handle}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage
                              src={friend.avatar}
                              alt={friend.handle}
                            />
                            <AvatarFallback>
                              {friend.handle.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${friend.handle}`}
                              className="font-medium text-xs hover:underline truncate block max-w-[120px] sm:max-w-full"
                            >
                              {friend.handle}
                            </Link>
                            <p
                              className={`text-xs ${getRatingColor(friend.rating)} truncate`}
                            >
                              {friend.rank}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs whitespace-nowrap flex-shrink-0"
                          onClick={() => toggleFollow(friend.handle)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
