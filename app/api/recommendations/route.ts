import dbConnect from '@/lib/dbConnect';
import RecommendedProblemModel from '@/models/RecommendedProblem';
import UserModel from '@/models/User';
import { getRecommendationRange } from '@/lib/recommendationUtils';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axiosInstance from '@/lib/axiosInstance';

const CF_PROBLEMSET_URL = 'https://codeforces.com/api/problemset.problems';

async function fetchAndStoreRecommendations(userId: string, rating: number) {
  const [start, end] = getRecommendationRange(rating);
  const res = await axiosInstance.get(CF_PROBLEMSET_URL);
  const data = res.data;
  if (!data.result) return;
  const problems = data.result.problems;
  const stats = data.result.problemStatistics;
  // Map problemId to solvedCount
  const solvedMap: Record<string, number> = {};
  for (const stat of stats) {
    solvedMap[`${stat.contestId}${stat.index}`] = stat.solvedCount;
  }
  // Filter and sort
  const filtered = problems
    .filter((p: any) => p.rating && p.rating >= start && p.rating <= end)
    .map((p: any) => ({
      problemId: `${p.contestId}${p.index}`,
      name: p.name,
      rating: p.rating,
      tags: p.tags,
      solvedCount: solvedMap[`${p.contestId}${p.index}`] || 0,
      link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
    }))
    .sort((a: any, b: any) => b.solvedCount - a.solvedCount)
    .slice(0, 25);
  // Remove old recommendations
  await RecommendedProblemModel.deleteMany({ userId });
  // Store new
  await RecommendedProblemModel.insertMany(
    filtered.map((p: any) => ({ ...p, userId }))
  );
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const token = await getToken({ req: request });
  if (!token?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const user = await UserModel.findById(token.id);
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  // Check if recommendations are fresh (within 2 days)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  let recs = await RecommendedProblemModel.find({ userId: user._id });
  const userIdStr = user._id.toString();
  // console.log(user);
  // console.log(user.rating);
  // Get user handle
  const userHandle = (user as any).username;
  // Try to get rating from user, else fetch from Codeforces
  let userRating = (user as any).rating;
  if (!userRating) {
    try {
      const cfRes = await axiosInstance.get(`https://codeforces.com/api/user.info?handles=${userHandle}`);
      userRating = cfRes.data.result[0]?.rating || 1200;
    } catch (e) {
      userRating = 1200;
    }
  }

  // Get solved problems for the user (assume you have this info)
  const solvedProblems: string[] = (user as any).solvedProblems || [];
  // Filter out solved problems from recommendations
  let filteredRecs = recs.filter((rec) => !solvedProblems.includes(rec.problemId));

  // If no recommendations left (all solved), or recommendations are stale, re-fetch
  if (!filteredRecs.length || recs[0]?.lastUpdated < twoDaysAgo) {
    await fetchAndStoreRecommendations(userIdStr, userRating);
    recs = await RecommendedProblemModel.find({ userId: userIdStr });
    filteredRecs = recs.filter((rec) => !solvedProblems.includes(rec.problemId));
  }

  return NextResponse.json({ success: true, problems: filteredRecs }, { status: 200 });
}
