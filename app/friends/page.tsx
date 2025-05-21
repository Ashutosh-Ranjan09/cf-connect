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
import { Search, Users, UserPlus, UserMinus, ExternalLink } from 'lucide-react';
import { useCodeforcesData, Friend } from '@/app/providers';
import { getRatingColor } from '@/lib/utils';
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
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
          {/* Main content area */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
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
                      placeholder="Search users..."
                      className="pl-8 w-full sm:w-[180px] md:w-[220px] lg:w-[250px] h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                <Tabs defaultValue="following">
                  <TabsList className="mb-3 sm:mb-4 w-full flex overflow-x-auto scrollbar-hide">
                    <TabsTrigger
                      value="following"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      I'm Following
                    </TabsTrigger>
                    <TabsTrigger
                      value="followers"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Following Me
                    </TabsTrigger>
                  </TabsList>

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
                    {filteredFriends.filter((friend) => !friend.isFollowing)
                      .length === 0 ? (
                      <div className="text-center py-4 sm:py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No one is following you yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        {filteredFriends
                          .filter((friend) => !friend.isFollowing)
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
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs w-full sm:w-auto"
                                  onClick={() => toggleFollow(friend.handle)}
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">
                                    Follow
                                  </span>
                                  <span className="sm:hidden">Follow</span>
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
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Friend Suggestions Card */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Friend Suggestions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  People you might want to follow
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