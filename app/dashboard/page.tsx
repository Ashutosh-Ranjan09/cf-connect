'use client';
import { AppShell } from '@/components/layout/app-shell';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCodeforcesData } from '@/app/providers';
import { getChartColors } from '@/lib/utils';
import { getTagDistribution, getRatingOverTime, getDifficultyBreakdown } from '@/lib/mockData';
import { TagDistributionChart } from '@/components/charts/tag-distribution-chart';
import { RatingOverTimeChart } from '@/components/charts/rating-over-time-chart';
import { DifficultyBreakdownChart } from '@/components/charts/difficulty-breakdown-chart';

export default function DashboardPage() {
  const { submissions, isLoading } = useCodeforcesData();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalSubmissions: 0,
    acceptedRate: 0,
    averageAttempts: 0,
  });
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Calculate stats
  useEffect(() => {
    if (!isLoading && submissions.length > 0) {
      const accepted = submissions.filter(s => s.verdict === 'OK');
      const uniqueProblems = new Set(accepted.map(s => s.problemId));
      
      setStats({
        totalSolved: uniqueProblems.size,
        totalSubmissions: submissions.length,
        acceptedRate: Math.round((accepted.length / submissions.length) * 100),
        averageAttempts: parseFloat((submissions.length / Math.max(uniqueProblems.size, 1)).toFixed(1)),
      });
    }
  }, [isLoading, submissions]);

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
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +43 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acceptance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.acceptedRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              -0.3 from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="charts" className="mt-6">
        <TabsList>
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Tag Distribution</CardTitle>
                <CardDescription>Problems solved by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TagDistributionChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Rating Progress</CardTitle>
                <CardDescription>Your rating over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RatingOverTimeChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Difficulty Breakdown</CardTitle>
                <CardDescription>Problems solved by difficulty</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DifficultyBreakdownChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Problems</CardTitle>
              <CardDescription>Based on your solving history</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Problem recommendations will appear here based on your solving patterns and areas for improvement.</p>
              <Separator className="my-4" />
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Activity</CardTitle>
              <CardDescription>Latest submissions and contests</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Recent activity will be displayed here, including submissions, contest participations, and rating changes.</p>
              <Separator className="my-4" />
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppShell>
  );
}