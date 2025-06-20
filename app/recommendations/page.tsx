"use client";
import { AppShell } from '@/components/layout/app-shell';
import { useCodeforcesData, useAuth } from '@/app/providers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRatingColor } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function RecommendationsPage() {
  const { problems, isLoading } = useCodeforcesData();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh] sm:min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
            Recommended Problems
          </h1>
          <Card className="p-6 text-center">Please log in to see recommendations.</Card>
        </div>
      </AppShell>
    );
  }

  // Recommend unsolved problems with rating just above user's rating
  const recommended = problems
    .filter((p) => !p.solved && p.rating && p.rating >= user.rating && p.rating <= user.rating + 400)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 20);

  return (
    <AppShell>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
          Recommended Problems to Increase Your Rating
        </h1>
        {recommended.length === 0 ? (
          <Card className="p-6 text-center">No recommendations found. Try solving more problems or check back later!</Card>
        ) : (
          <div className="grid gap-4">
            {recommended.map((problem) => (
              <Card key={problem.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{problem.name}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className={`text-lg font-bold ${getRatingColor(problem.rating)}`}>{problem.rating}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
