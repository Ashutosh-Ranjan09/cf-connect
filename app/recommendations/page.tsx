import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { getRatingColor } from '@/lib/utils';
import axios from 'axios';
import { cookies } from 'next/headers';

interface Recommendation {
  problemId: string;
  name: string;
  rating: number;
  link: string;
}

export default async function RecommendationsPage() {
  let problems: Recommendation[] = [];
  let error: string | null = null;

  try {
    const cookieHeader = cookies().toString();
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
    // Fetch recommendations from backend
    const res = await axios.get(`${protocol}://${host}/api/recommendations`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    if (res.data && res.data.success) {
      problems = res.data.problems.map((p: any) => ({
        problemId: p.problemId,
        name: p.name,
        rating: p.rating,
        link: p.link,
      }));
    } else {
      error = res.data?.message || 'Failed to fetch recommendations';
    }
  } catch (e: any) {
    error = e?.response?.data?.message || e?.message || 'Failed to fetch recommendations';
  }

  return (
    <AppShell>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
          Recommended Problems to Increase Your Rating
        </h1>
        {error ? (
          <Card className="p-6 text-center text-red-500">{error}</Card>
        ) : problems.length === 0 ? (
          <Card className="p-6 text-center">No recommendations found. Try solving more problems or check back later!</Card>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto">
            <div className="grid gap-4">
              {problems.map((problem) => (
                <Card key={problem.problemId} className="flex items-center justify-between p-4">
                  <div>
                    <a
                      href={problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {problem.name}
                    </a>
                  </div>
                  <div className={`text-lg font-bold ${getRatingColor(problem.rating)}`}>{problem.rating}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
