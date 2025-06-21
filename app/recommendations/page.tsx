import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { getRatingColor } from '@/lib/utils';
import axios from 'axios';
import { cookies } from 'next/headers';

interface RecommendedProblem {
  _id: string;
  problemId: string;
  name: string;
  rating: number;
  solvedCount: number;
  link: string;
}

export default async function RecommendationsPage() {
  let problems: RecommendedProblem[] = [];
  let error: string | null = null;
  try {
    const cookieHeader = cookies().toString();
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
    const url = `${protocol}://${host}/api/recommendations`;
    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    const data = res.data;
    if (data.success) {
      problems = data.problems;
    } else {
      error = data.message || 'Failed to fetch recommendations';
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
                <Card key={problem._id} className="flex items-center justify-between p-4">
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
