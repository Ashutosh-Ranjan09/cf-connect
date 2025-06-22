import UserModel from '@/models/User';
import dbConnect from './dbConnect';

// lib/server-api.ts
export async function fetchServerData(handle?: string) {
  try {
    if (!handle) return { rawSubmissions: [], rawContests: [] };

    // Fetch submissions with appropriate revalidation
    const submissionsResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}`,
      { next: { revalidate: 30 },cache: 'no-store' }
    );

    // Fetch contests with appropriate revalidation
    const contestsResponse = await fetch(
      'https://codeforces.com/api/contest.list',
      { next: { revalidate: 3600 },cache: 'no-store' }
    );
    const pastContestResponse = await fetch(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
      { next: { revalidate: 300 },cache: 'no-store' }
    );
    const submissionsData = submissionsResponse.ok
      ? await submissionsResponse.json()
      : { result: [] };
    const contestsData = contestsResponse.ok
      ? await contestsResponse.json()
      : { result: [] };
    const pastContestData = pastContestResponse.ok
      ? await pastContestResponse.json()
      : { result: [] };
    const profile = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { next: { revalidate: 30 },cache: 'no-store' }
    );
    await dbConnect();
    const dbprofile = await UserModel.findOne({ username: handle });
    // console.log(dbprofile);
    const profileData = profile.ok ? await profile.json() : { result: [] };
    // const contestsData=ctData.slice(0,50);
    const profileData2 = {
      ...profileData.result[0],
      aboutMe: dbprofile?.aboutme,
      websites: dbprofile?.links,
      isPrivate: dbprofile?.isPrivate,
      follower: dbprofile?.follower,
      following: dbprofile?.following,
      requestSent: dbprofile?.requestSent,
      requestRecieved: dbprofile?.requestRecieved,
    };
    const arrProfileData = [profileData2];
    // console.log("raw-submission-server-api.ts= ",contestsData);

    // Build sets for fast lookup
    const followersArr = dbprofile?.follower || [];
    const followingArr = dbprofile?.following || [];
    const followersSet = new Set(followersArr);
    const followingSet = new Set(followingArr);
    // Union of all handles
    const allHandles = Array.from(new Set([...followersArr, ...followingArr]));
    let Friends = [];
    if (allHandles.length > 0) {
      let str = allHandles.join(';');
      try {
        const objres = await fetch(
          `https://codeforces.com/api/user.info?handles=${str}`
        );
        const obj = objres.ok ? await objres.json() : { result: [] };
        const cfData: Record<string, any> = {};
        for (const us of obj.result) {
          cfData[us.handle] = us;
        }
        for (const handle of allHandles) {
          const isFollowing = followingSet.has(handle);
          const isFollower = followersSet.has(handle);
          const us = cfData[handle] || {};
          Friends.push({
            handle,
            rating: us.rating || 0,
            rank: us.rank || 'Unknown',
            avatar: us.avatar || '',
            isFollowing: !!isFollowing,
            isFollower: !!isFollower,
            lastSeen: new Date().toISOString(),
          });
        }
      } catch (error) {
        // fallback: add all handles with minimal info
        for (const handle of allHandles) {
          Friends.push({
            handle,
            rating: 0,
            rank: 'Unknown',
            avatar: '',
            isFollowing: followingSet.has(handle),
            isFollower: followersSet.has(handle),
            lastSeen: new Date().toISOString(),
          });
        }
      }
    }
    return {
      rawSubmissions: submissionsData.result || [],
      rawContests: contestsData.result || [],
      rawPastContestData: pastContestData.result || [],
      rawProfileData: arrProfileData || [],
      rawFriends: Friends || [],
    };
  } catch (error) {
    console.log('Error fetching server data:', error);
    return {
      rawSubmissions: [],
      rawContests: [],
      rawPastContestData: [],
      rawProfileData: [],
      rawFriends: [],
    };
  }
}
