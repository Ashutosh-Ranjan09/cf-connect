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
      { next: { revalidate: 1 },cache: 'no-store' }
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

    let Friends = [];
    let str = '';
    // console.log(str,dbprofile?.follower);

    let arr = dbprofile?.follower || [];
    if(arr.length>0)
    {
    for (let s of arr) {
      // console.log(s);
      str += `${s};`;
    }
    // console.log(str);
    str = str.slice(0, str.length - 1);
    console.log(str);
    const objres = await fetch(
      `https://codeforces.com/api/user.info?handles=${str}`
    );
    const obj = objres.ok ? await objres.json() : [];
    console.log(obj);
    for (const us of obj.result) {
      Friends.push({
        handle: us.handle,
        rating: us.rating,
        rank: us.rank,
        avatar: us.avatar,
        isFollowing: false,
      });
    }
  }
 arr = dbprofile?.following || [];
if (arr.length > 0) {
  str = '';
  for (let s of arr) {
    str += `${s};`;
  }
  str = str.slice(0, str.length - 1);
  
  try {
    const objresf = await fetch(
      `https://codeforces.com/api/user.info?handles=${str}`
    );
    
    const objf = objresf.ok ? await objresf.json() : { result: [] };
    
    if (objf && objf.result && Array.isArray(objf.result)) {
      for (const us of objf.result) {
        Friends.push({
          handle: us.handle,
          rating: us.rating || 0,
          rank: us.rank || "Unrated",
          avatar: us.avatar || "",
          isFollowing: true,
          lastSeen: new Date().toISOString()
        });
      }
    }
    
    // Add this part to handle users not found in Codeforces API
    // Make sure all followed users are included even if they don't exist in Codeforces
    const foundHandles = new Set(Friends.filter(f => f.isFollowing).map(f => f.handle));
    for (const followedHandle of arr) {
      if (!foundHandles.has(followedHandle)) {
        Friends.push({
          handle: followedHandle,
          rating: 0,
          rank: "Unknown",
          avatar: "",
          isFollowing: true,
          lastSeen: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error("Error fetching following users from Codeforces:", error);
    
    // If the API call fails, still add the followed users to the list
    for (const followedHandle of arr) {
      Friends.push({
        handle: followedHandle,
        rating: 0,
        rank: "Unknown",
        avatar: "",
        isFollowing: true,
        lastSeen: new Date().toISOString()
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
