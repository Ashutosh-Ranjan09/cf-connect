'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          friends.filter(friend => 
            friend.handle.toLowerCase().includes(query) ||
            friend.rank.toLowerCase().includes(query)
          )
        );
      }
    }
  }, [isLoading, friends, searchQuery]);
  
  // Toggle friend follow status
  const toggleFollow = (handle: string) => {
    setLocalFriends(prev => 
      prev.map(friend => 
        friend.handle === handle 
          ? { ...friend, isFollowing: !friend.isFollowing } 
          : friend
      )
    );
  };
  
  // Format activity message
  const formatActivity = (friend: Friend) => {
    if (!friend.recentActivity) return null;
    
    const { type, problemId, problemName, contestId, contestName, timestamp } = friend.recentActivity;
    
    let message;
    if (type === 'SOLVED' && problemName) {
      message = <>solved problem <span className="font-medium">{problemName}</span></>;
    } else if (type === 'PARTICIPATED' && contestName) {
      message = <>participated in <span className="font-medium">{contestName}</span></>;
    } else if (type === 'RANKED_UP') {
      message = <>ranked up to <span className={`font-medium ${getRatingColor(friend.rating)}`}>{friend.rank}</span></>;
    } else {
      return null;
    }
    
    return (
      
      <div className="flex items-start gap-3 pb-4">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={friend.avatar} alt={friend.handle} />
          <AvatarFallback>{friend.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p>
            <Link 
              href={`/profile/${friend.handle}`} 
              className={`font-medium ${getRatingColor(friend.rating)} hover:underline`}
            >
              {friend.handle}
            </Link>
            {' '}{message}
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
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
   <div>
     <CardTitle>Friends</CardTitle>
     <CardDescription>Your competitive programming network</CardDescription>
   </div>
   <div className="relative w-full md:w-auto">
     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
     <Input
       type="search"
       placeholder="Search friends..."
       className="pl-8 w-full md:w-[200px] lg:w-[300px]"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
     />
   </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Friends</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="followers">Followers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {filteredFriends.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">No friends found matching your search.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {filteredFriends.map((friend) => (
                        <div 
                          key={friend.handle}
                          className="bg-card border rounded-lg p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={friend.avatar} alt={friend.handle} />
                              <AvatarFallback>{friend.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link href={`/profile/${friend.handle}`} className="font-medium hover:underline">
                                  {friend.handle}
                                </Link>
                                <Badge variant="outline" className={`${getRatingColor(friend.rating)} text-xs`}>
                                  {friend.rating}
                                </Badge>
                              </div>
                              <p className={`text-xs ${getRatingColor(friend.rating)}`}>{friend.rank}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant={friend.isFollowing ? "default" : "outline"} 
                              size="sm"
                              onClick={() => toggleFollow(friend.handle)}
                            >
                              {friend.isFollowing ? (
                                <>
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Unfollow
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Follow
                                </>
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/profile/${friend.handle}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="following" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredFriends
                      .filter(friend => friend.isFollowing)
                      .map((friend) => (
                        <div 
                          key={friend.handle}
                          className="bg-card border rounded-lg p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={friend.avatar} alt={friend.handle} />
                              <AvatarFallback>{friend.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link href={`/profile/${friend.handle}`} className="font-medium hover:underline">
                                  {friend.handle}
                                </Link>
                                <Badge variant="outline" className={`${getRatingColor(friend.rating)} text-xs`}>
                                  {friend.rating}
                                </Badge>
                              </div>
                              <p className={`text-xs ${getRatingColor(friend.rating)}`}>{friend.rank}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => toggleFollow(friend.handle)}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Unfollow
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/profile/${friend.handle}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="followers" className="space-y-4">
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">Followers coming soon!</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent actions from your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {localFriends
                  .filter(friend => friend.isFollowing && friend.recentActivity)
                  .map((friend) => (
                    <div key={friend.handle}>
                      {formatActivity(friend)}
                      <Separator className="my-2" />
                    </div>
                  ))}
                {localFriends.filter(friend => friend.isFollowing && friend.recentActivity).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent activity.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Friend Suggestions</CardTitle>
              <CardDescription>People you might know</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localFriends
                  .filter(friend => !friend.isFollowing)
                  .slice(0, 3)
                  .map((friend) => (
                    <div 
                      key={friend.handle}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={friend.avatar} alt={friend.handle} />
                          <AvatarFallback>{friend.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${friend.handle}`} className="font-medium text-sm hover:underline">
                            {friend.handle}
                          </Link>
                          <p className={`text-xs ${getRatingColor(friend.rating)}`}>{friend.rank}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8"
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