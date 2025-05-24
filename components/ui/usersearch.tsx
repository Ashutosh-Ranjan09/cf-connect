// New component for user search in the friends page
'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { Search, UserPlus, UserMinus, Clock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Define types for user search results
interface UserSearchResult {
  username: string;
  isPrivate: boolean;
  relationshipStatus: 'none' | 'following' | 'requested';
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await axios.get(`/api/search/users?query=${encodeURIComponent(query)}`);
        if (response.data.success) {
          setSearchResults(response.data.users);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );
  
  // Update search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);
  
  // Function to handle follow/unfollow
  const handleFollowAction = async (username: string, status: 'none' | 'following' | 'requested') => {
    setActionLoading(username);
    try {
      if (status === 'none') {
        // Send follow request
        const response = await axios.post('/api/friend-req', { reciever: username });
        
        // Update the user in results to show new status
        setSearchResults(prev => 
          prev.map(user => 
            user.username === username 
              ? { 
                  ...user, 
                  relationshipStatus: response.data.message === 'Request sent' ? 'requested' : 'following'
                } 
              : user
          )
        );
        
        toast({
          title: response.data.message === 'Request sent' ? 'Request Sent' : 'Following',
          description: response.data.message === 'Request sent' 
            ? `Follow request sent to ${username}` 
            : `You are now following ${username}`,
        });
      } else if (status === 'following') {
        // Unfollow
        const response = await axios.delete(`/api/friend-req?username=${username}`);
        
        if (response.data.success) {
          setSearchResults(prev => 
            prev.map(user => 
              user.username === username ? { ...user, relationshipStatus: 'none' } : user
            )
          );
          
          toast({
            title: 'Unfollowed',
            description: `You have unfollowed ${username}`,
          });
        }
      } else if (status === 'requested') {
        // Cancel request
        const response = await axios.delete(`/api/friend-req?username=${username}&action=cancel`);
        
        if (response.data.success) {
          setSearchResults(prev => 
            prev.map(user => 
              user.username === username ? { ...user, relationshipStatus: 'none' } : user
            )
          );
          
          toast({
            title: 'Request Canceled',
            description: `Follow request to ${username} has been canceled`,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg">Find Users</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Search for users by Codeforces handle
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by username..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isSearching ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div 
                  key={user.username}
                  className="flex items-center justify-between bg-card border rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/profile/${user.username}`}
                        className="font-medium hover:underline text-sm truncate block"
                      >
                        {user.username}
                      </Link>
                      {user.isPrivate && (
                        <Badge variant="outline" className="text-xs">Private</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={user.relationshipStatus === 'following' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleFollowAction(user.username, user.relationshipStatus)}
                      disabled={actionLoading === user.username}
                    >
                      {actionLoading === user.username ? (
                        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                      ) : user.relationshipStatus === 'following' ? (
                        <>
                          <UserMinus className="h-3 w-3 mr-1" />
                          Unfollow
                        </>
                      ) : user.relationshipStatus === 'requested' ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Requested
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={`/profile/${user.username}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearch;