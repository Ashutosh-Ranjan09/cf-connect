'use client';
import { AppShell } from '@/components/layout/app-shell';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Cell,
//   Legend,
// } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCodeforcesData } from '@/app/providers';
// import { getChartColors } from '@/lib/utils';
// import {
//   getTagDistribution,
//   getRatingOverTime,
//   getDifficultyBreakdown,
// } from '@/lib/mockData';
import { TagDistributionChart } from '@/components/charts/tag-distribution-chart';
import { RatingOverTimeChart } from '@/components/charts/rating-over-time-chart';
import { DifficultyBreakdownChart } from '@/components/charts/difficulty-breakdown-chart';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const username = useParams().username || 'user';
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
    if (!isLoading && submissions?.length > 0) {
      const accepted = submissions.filter((s) => s.verdict === 'OK');
      const uniqueProblems = new Set(accepted.map((s) => s.problemId));

      setStats({
        totalSolved: uniqueProblems.size,
        totalSubmissions: submissions.length,
        acceptedRate: Math.round((accepted.length / submissions.length) * 100),
        averageAttempts: parseFloat(
          (submissions.length / Math.max(uniqueProblems.size, 1)).toFixed(1)
        ),
      });
    }
  }, [isLoading, submissions]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh] sm:min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
          {username}'s Dashboard 
        </h1>

        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Problems Solved
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                {stats.totalSolved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.totalSubmissions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +43 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Acceptance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.acceptedRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.averageAttempts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                -0.3 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="mt-4 sm:mt-6">
          <TabsList className="mb-3 sm:mb-4 w-full flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="charts" className="flex-1 text-xs sm:text-sm">
              Performance Charts
            </TabsTrigger>
            {/* <TabsTrigger
              value="recommendations"
              className="flex-1 text-xs sm:text-sm"
            >
              Recommendations
            </TabsTrigger> */}
            {/* <TabsTrigger value="activity" className="flex-1 text-xs sm:text-sm">
              Recent Activity
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="charts" className="mt-3 sm:mt-4 md:mt-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 pt-3 sm:pt-4">
                  <CardTitle className="text-sm sm:text-base md:text-lg">
                    Tag Distribution
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Problems solved by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] xs:h-[220px] sm:h-[250px] md:h-[300px] px-1 sm:px-2">
                  <TagDistributionChart />
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Rating Progress
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your rating over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px]">
                  <RatingOverTimeChart />
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Difficulty Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Problems solved by difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px]">
                  <DifficultyBreakdownChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  Recommended Problems
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Based on your solving history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Problem recommendations will appear here based on your solving
                  patterns and areas for improvement.
                </p>
                <Separator className="my-4" />
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  Your Recent Activity
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Latest submissions and contests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Recent activity will be displayed here, including submissions,
                  contest participations, and rating changes.
                </p>
                <Separator className="my-4" />
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </AppShell>
  );
}
