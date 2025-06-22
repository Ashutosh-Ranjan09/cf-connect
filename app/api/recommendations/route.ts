import dbConnect from '@/lib/dbConnect';
import RecommendedProblemModel from '@/models/RecommendedProblem';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axiosInstance from '@/lib/axiosInstance';
import { Types } from 'mongoose';

async function fetchAndStoreRecommendations(userId: Types.ObjectId, rating: number) {
  const start = Math.round(rating / 100) * 100;
  const end = start + 200;
  const res = await axiosInstance.get(`https://acodedaily.com/api/v2/ladder?startRating=${start}&endRating=${end}`);
  const data = Array.isArray(res.data.data) ? res.data.data : [];
  const filtered = data
    .sort((a: any, b: any) => {
      // Sort by points descending, then frequency descending
      const pointsA = a.points || 0;
      const pointsB = b.points || 0;
      if (pointsA !== pointsB) return pointsB - pointsA;
      return (b.frequency || 0) - (a.frequency || 0);
    })
    .slice(0, 25)
    .map((p: any) => ({
      problemId: `${p.contestId}${p.index}`,
      name: p.name,
      rating: p.rating,
      tags: p.tags || [],
      solvedCount: p.frequency || 0,
      link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      userId,
    }));
  await RecommendedProblemModel.deleteMany({ userId });
  await RecommendedProblemModel.insertMany(filtered);
  return filtered;
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const token = await getToken({ req: request });
  if (!token?.username) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const user = await UserModel.findOne({ username: token.username });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  const userId = user._id;
  const userHandle = user.username;
  let userRating = 800;
  let solvedProblems: string[] = [];
  try {
    const cfRes = await axiosInstance.get(`https://codeforces.com/api/user.info?handles=${userHandle}`);
    userRating = cfRes.data.result[0]?.rating || 800;
    const subRes = await axiosInstance.get(`https://codeforces.com/api/user.status?handle=${userHandle}`);
    const submissions = Array.isArray(subRes.data.result) ? subRes.data.result : [];
    const solvedSet = new Set<string>();
    submissions.forEach((sub: any) => {
      if (sub.verdict === 'OK' && sub.problem) {
        solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
      }
    });
    solvedProblems = Array.from(solvedSet);
  } catch (e) {
    userRating = 800;
    solvedProblems = [];
  }

  let recs = await RecommendedProblemModel.find({ userId });
  let filteredRecs = recs.filter((rec) => !solvedProblems.includes(rec.problemId));

  // Remove solved problems from DB for this user
  if (solvedProblems.length > 0) {
    await RecommendedProblemModel.deleteMany({ userId, problemId: { $in: solvedProblems } });
    recs = await RecommendedProblemModel.find({ userId });
    filteredRecs = recs; // All remaining are unsolved
  }
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  // Only add new problems if all are solved (empty) or recommendations are stale
  if (!filteredRecs.length || recs[0]?.lastUpdated < twoDaysAgo) {
    // Keep unsolved problems, add new ones to make 25
    const start = Math.round(userRating / 100) * 100;
    const end = start + 200;
    const res = await axiosInstance.get(`https://acodedaily.com/api/v2/ladder?startRating=${start}&endRating=${end}`);
    const data = Array.isArray(res.data.data) ? res.data.data : [];
    const existingIds = new Set(recs.map((rec) => rec.problemId));
    const newProblems = data
      .filter((p: any) => !existingIds.has(`${p.contestId}${p.index}`))
      .sort((a: any, b: any) => {
        const pointsA = a.points || 0;
        const pointsB = b.points || 0;
        if (pointsA !== pointsB) return pointsB - pointsA;
        return (b.frequency || 0) - (a.frequency || 0);
      })
      .slice(0, 25 - recs.length)
      .map((p: any) => ({
        problemId: `${p.contestId}${p.index}`,
        name: p.name,
        rating: p.rating,
        tags: p.tags || [],
        solvedCount: p.frequency || 0,
        link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        userId,
      }));
    if (newProblems.length > 0) {
      await RecommendedProblemModel.insertMany(newProblems);
      recs = await RecommendedProblemModel.find({ userId });
      filteredRecs = recs;
    }
  }

  if (!filteredRecs.length) {
    return NextResponse.json({ success: false, message: 'No recommendations found for your rating band. Try a different handle or check back later.' }, { status: 200 });
  }

  return NextResponse.json({ success: true, problems: filteredRecs }, { status: 200 });
}
