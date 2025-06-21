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
import { Search, Users, UserPlus, UserMinus, ExternalLink, X } from 'lucide-react';
import { useCodeforcesData, Friend, useAuth } from '@/app/providers';
import { getRatingColor } from '@/lib/utils';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import UserSearch from '@/components/ui/usersearch';
import { Check } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
export default function FriendsPage() {
  const { friends, isLoading } = useCodeforcesData();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [followRequests, setFollowRequests] = useState<string[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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
  const fetchFollowRequests = async () => {
      if (!user?.isAuthenticated) return;

      try {
        const response = await axios.get('/api/friend-req?action=recieved');
        if (response.data.success && response.data.reqRecieved) {
          setFollowRequests(response.data.reqRecieved);
        }
      } catch (error) {
        console.error('Error fetching follow requests:', error);
      } finally {
        setRequestsLoading(false);
      }
    };
  useEffect(() => {
  
    if (mounted && user?.isAuthenticated) {
      fetchFollowRequests();
    }
  }, [mounted, user?.isAuthenticated]);
  
  // Toggle friend follow status
  const toggleFollow = async (handle: string, currentStatus: 'none' | 'following' | 'requested') => {
    // Check if already following or request sent
    const friend = friends.find(f => f.handle === handle);
    if (friend?.isFollowing) {
      toast({
        title: 'Already Following',
        description: `You are already following ${handle}.`,
        variant: 'destructive',
      });
      return;
    }
    // If you have already sent a request
    if (user && Array.isArray((user as any).requestSent) && (user as any).requestSent.includes(handle)) {
      toast({
        title: 'Request Already Sent',
        description: `You have already sent a follow request to ${handle}.`,
        variant: 'destructive',
      });
      return;
    }
  try {
    setActionLoading(handle);
    
    if (currentStatus === 'none') {
      // Send follow request
      const response = await axios.post('/api/friend-req', { reciever: handle });
      if (response.data.success) {
        if (response.data.message === 'Request sent') {
          toast({
            title: 'Request Sent',
            description: `Follow request sent to ${handle}`,
          });
        } else {
          toast({
            title: 'Following',
            description: `You are now following ${handle}`,
          });
          
          // Create a new friend object to add to the local state
          const newFriend = {
            handle: handle,
            rating: 0, // You might want to get this from the search results
            rank: "", // You might want to get this from the search results
            avatar: "",
            isFollowing: true,
            isFollower: false,
            lastSeen: new Date().toISOString()
          };
          
          // Add to local state
          setLocalFriends(prev => [...prev, newFriend]);
          setFilteredFriends(prev => [...prev, newFriend]);
          
          // Force refresh browser page to get fresh data from server
          window.location.reload();
        }
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Could not follow user.',
          variant: response.data.message && response.data.message.includes('Follow request already sent') ? undefined : 'destructive',
        });
        setActionLoading(null);
        return;
      }
    } else if (currentStatus === 'following') {
      // Unfollow
      const response = await axios.delete(`/api/friend-req?username=${handle}`);
      if (response.data.success) {
        toast({
          title: 'Unfollowed',
          description: `You have unfollowed ${handle}`,
        });
        
        // Remove from local state
        setLocalFriends(prev => prev.filter(friend => friend.handle !== handle));
        setFilteredFriends(prev => prev.filter(friend => friend.handle !== handle));
        
        // Force refresh browser page to get fresh data from server
        window.location.reload();
      }
    } else if (currentStatus === 'requested') {
      // Cancel request
      const response = await axios.delete(`/api/friend-req?username=${handle}&action=cancel`);
      if (response.data.success) {
        toast({
          title: 'Request Canceled',
          description: `Follow request to ${handle} has been canceled`,
        });
        // No UI update needed for canceling requests
      }
    }
    
    // Refresh follow requests
    fetchFollowRequests();
    
  } catch (error) {
    // Fix: cast error to any for Axios error compatibility
    let backendMsg = (error && typeof error === 'object' && 'response' in error && (error as any).response?.data?.message)
      ? (error as any).response.data.message
      : undefined;
    toast({
      title: 'Error',
      description: backendMsg || 'An error occurred. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setActionLoading(null);
  }
};
  const handleAcceptRequest = async (sender: string) => {
    setActionLoading(sender);
    try {
      const response = await axios.patch('/api/friend-req', { sender });

      if (response.data.success) {
        // Remove from requests list
        setFollowRequests((prev) => prev.filter((req) => req !== sender));

        toast({
          title: 'Request accepted',
          description: `You are now connected with ${sender}`,
        });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reject follow request
  const handleRejectRequest = async (sender: string) => {
    setActionLoading(sender);
    try {
      const response = await axios.delete(
        `/api/friend-req?username=${sender}&action=reject`
      );

      if (response.status === 200) {
        // Remove from requests list
        setFollowRequests((prev) => prev.filter((req) => req !== sender));

        toast({
          title: 'Request rejected',
          description: `Follow request from ${sender} has been rejected`,
        });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
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
          <UserSearch/>
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
                      placeholder="Search friends..."
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
                    <TabsTrigger
                      value="requests"
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Requests{' '}
                      {followRequests.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 px-1.5 py-0 text-xs"
                        >
                          {followRequests.length}
                        </Badge>
                      )}
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
                                  onClick={() => toggleFollow(friend.handle,'following')}
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
                    {filteredFriends.filter((friend) => friend.isFollower)
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
                          .filter((friend) => friend.isFollower)
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
                                {!friend.isFollowing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs w-full sm:w-auto"
                                    onClick={() => toggleFollow(friend.handle,'none')}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">
                                      Follow
                                    </span>
                                    <span className="sm:hidden">Follow</span>
                                  </Button>
                                )}
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
                  <TabsContent value="requests" className="space-y-4">
                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : followRequests.length === 0 ? (
                      <div className="text-center py-4 sm:py-6">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No pending follow requests
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        {followRequests.map((handle) => (
                          <div
                            key={handle}
                            className="bg-card border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback>
                                  {handle.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <Link
                                    href={`/profile/${handle}`}
                                    className="font-medium hover:underline text-sm truncate max-w-full sm:max-w-[120px] md:max-w-[150px]"
                                  >
                                    {handle}
                                  </Link>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Wants to follow you
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs w-full sm:w-auto"
                                onClick={() => handleAcceptRequest(handle)}
                                disabled={actionLoading === handle}
                              >
                                {actionLoading === handle ? (
                                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                <span>Accept</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRejectRequest(handle)}
                                disabled={actionLoading === handle}
                              >
                                <X className="h-3 w-3 mr-1" />
                                <span>Reject</span>
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
          {/* <div className="space-y-3 sm:space-y-4 md:space-y-6">
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
                          onClick={() => toggleFollow(friend.handle,'none')}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
        <Toaster />
      </div>
    </AppShell>
  );
}
