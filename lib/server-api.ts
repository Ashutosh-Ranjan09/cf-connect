// lib/server-api.ts
export async function fetchServerData(handle?: string) {
  try {
    if (!handle) return { rawSubmissions: [], rawContests: [] };
    
    // Fetch submissions with appropriate revalidation
    const submissionsResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}`, 
      { next: { revalidate: 30 } }
    );
    
    // Fetch contests with appropriate revalidation
    const contestsResponse = await fetch(
      'https://codeforces.com/api/contest.list', 
      { next: { revalidate: 3600 } }
    );
    const pastContestResponse=await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`,{next:{revalidate:300}});
    const submissionsData = submissionsResponse.ok ? await submissionsResponse.json() : { result: [] };
    const contestsData = contestsResponse.ok ? await contestsResponse.json() : { result: [] };
    const pastContestData=pastContestResponse.ok ? await pastContestResponse.json():{result:[]}
    
    // const contestsData=ctData.slice(0,50);
    console.log("raw-submission-server-api.ts= ",contestsData);
    return {
      rawSubmissions: submissionsData.result || [],
      rawContests: contestsData.result || [],
      rawPastContestData:pastContestData.result||[],
    };
  } catch (error) {
    console.log('Error fetching server data:', error);
    return { rawSubmissions: [], rawContests: [],rawPastContestData:[] };
  }
}