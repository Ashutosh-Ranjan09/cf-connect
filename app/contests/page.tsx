'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from './../../hooks/use-toast'
import { 
  CalendarDays, Clock, CheckCircle, AlarmClock, 
  Users, BarChart, XCircle, ArrowRight, ArrowUpRight, 
  ArrowDownRight, Minus
} from 'lucide-react';
import { useCodeforcesData, Contest } from '@/app/providers';
import { formatContestTime, timeUntilContest } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';

export default function ContestsPage() {
  const { contests, isLoading } = useCodeforcesData();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [ongoingContests, setOngoingContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [localContests, setLocalContests] = useState<Contest[]>([]);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Set initial data
  useEffect(() => {
    if (!isLoading) {
      setLocalContests(contests);
      
      // Filter upcoming, ongoing, and past contests
      setUpcomingContests(contests.filter(c => c.phase === 'BEFORE'));
      setOngoingContests(contests.filter(c => 
        c.phase === 'CODING' || c.phase === 'PENDING_SYSTEM_TEST' || c.phase === 'SYSTEM_TEST'
      ));
      setPastContests(contests.filter(c => c.phase === 'FINISHED'));
    }
  }, [isLoading, contests]);
  
  // RSVP handler
  const toggleRSVP = (contestId: string) => {
    setLocalContests(prev => 
      prev.map(contest => 
        contest.id === contestId 
          ? { ...contest, rsvp: !contest.rsvp } 
          : contest
      )
    );
    
    // Also update the filtered lists
    setUpcomingContests(prev => 
      prev.map(contest => 
        contest.id === contestId 
          ? { ...contest, rsvp: !contest.rsvp } 
          : contest
      )
    );
    
    const contest = localContests.find(c => c.id === contestId);
    if (contest) {
      toast({
        title: contest.rsvp ? "RSVP Removed" : "RSVP Added",
        description: contest.rsvp 
          ? `You will no longer be reminded about ${contest.name}`
          : `You will be reminded about ${contest.name}`,
        duration: 3000,
      });
    }
  };
  
  // Render contest phase badge
  const renderPhaseBadge = (phase: Contest['phase']) => {
    switch (phase) {
      case 'BEFORE':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Upcoming</Badge>;
      case 'CODING':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">In Progress</Badge>;
      case 'PENDING_SYSTEM_TEST':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Pending System Test</Badge>;
      case 'SYSTEM_TEST':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">System Testing</Badge>;
      case 'FINISHED':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Finished</Badge>;
      default:
        return null;
    }
  };
  
  // Render delta change
  const renderDelta = (delta?: number) => {
    if (delta === undefined) return null;
    
    if (delta > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          <span>+{delta}</span>
        </div>
      );
    } else if (delta < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          <span>{delta}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-4 w-4 mr-1" />
          <span>0</span>
        </div>
      );
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
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contests</CardTitle>
            <CardDescription>Upcoming, ongoing, and past contests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="past">Past Contests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingContests.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No Upcoming Contests</h3>
                    <p className="mt-1 text-muted-foreground">
                      Check back later for new contests
                    </p>
                  </div>
                ) : (
                  upcomingContests.map((contest) => (
                    <Card key={contest.id} className="overflow-hidden">
   <div className="flex flex-col md:flex-row">
     <div className="p-4 sm:p-6 flex-1">
       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
         <div>
           <h3 className="text-base sm:text-lg font-semibold">{contest.name}</h3>
           <div className="flex flex-wrap items-center gap-2 mt-1">
             {renderPhaseBadge(contest.phase)}
             <Badge variant="outline">{contest.type}</Badge>
           </div>
         </div>
         <Button 
           className="self-start"
           variant={contest.rsvp ? "default" : "outline"} 
           size="sm"
           onClick={() => toggleRSVP(contest.id)}
         >
           {contest.rsvp ? (
             <>
               <CheckCircle className="h-4 w-4 mr-1" />
               Attending
             </>
           ) : (
             "RSVP"
           )}
         </Button>
       </div>
                          
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <span>{formatContestTime(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{contest.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 sm:p-6 flex flex-row md:flex-col items-center justify-between md:w-48">
                          <div className="text-center">
                            <AlarmClock className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Starts in</p>
                            <p className="text-xl font-bold">{timeUntilContest(contest.startTime)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="ongoing" className="space-y-4">
                {ongoingContests.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No Ongoing Contests</h3>
                    <p className="mt-1 text-muted-foreground">
                      There are no contests in progress right now
                    </p>
                  </div>
                ) : (
                  ongoingContests.map((contest) => (
                    <Card key={contest.id} className="overflow-hidden border-green-500/50">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{contest.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {renderPhaseBadge(contest.phase)}
                                <Badge variant="outline">{contest.type}</Badge>
                              </div>
                            </div>
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Enter
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <span>{formatContestTime(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{contest.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 sm:p-6 flex flex-row md:flex-col items-center justify-between md:w-48">
                          <div className="text-center">
                            <Users className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Participants</p>
                            <p className="text-xl font-bold">{Math.floor(Math.random() * 10000) + 5000}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="past" className="space-y-4">
                {pastContests.length === 0 ? (
                  <div className="text-center py-12">
                    <XCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No Past Contests</h3>
                    <p className="mt-1 text-muted-foreground">
                      Your contest history will appear here
                    </p>
                  </div>
                ) : (
                  pastContests.map((contest) => (
                    <Card key={contest.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{contest.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {renderPhaseBadge(contest.phase)}
                                <Badge variant="outline">{contest.type}</Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <BarChart className="h-4 w-4 mr-1" />
                              Analysis
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <span>{formatContestTime(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{contest.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 sm:p-6 flex flex-row md:flex-col items-center justify-between md:w-48">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Rating Change</p>
                            <div className="text-xl font-bold mt-1">
                              {renderDelta(contest.ratingDelta)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppShell>
  );
}