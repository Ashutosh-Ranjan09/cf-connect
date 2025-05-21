import {
  Problem,
  Submission,
  Contest,
  Friend,
  LeaderboardEntry,
} from '@/app/providers';

// Tags from CodeForces
const problemTags = [
  'implementation',
  'math',
  'greedy',
  'dp',
  'data structures',
  'brute force',
  'constructive algorithms',
  'graphs',
  'sortings',
  'binary search',
  'dfs and similar',
  'trees',
  'strings',
  'number theory',
  'combinatorics',
  'geometry',
  'bitmasks',
  'two pointers',
  'dsu',
  'shortest paths',
  'probabilities',
  'divide and conquer',
  'hashing',
  'games',
  'flows',
  'interactive',
  'matrices',
  'string suffix structures',
  'fft',
  'graph matchings',
  'ternary search',
  'expression parsing',
  'meet-in-the-middle',
  'schedules',
  '2-sat',
  'chinese remainder theorem',
];

const languages = [
  'GNU C++17',
  'GNU C++14',
  'GNU C++11',
  'GNU C++',
  'GNU C++20',
  'MS C++',
  'Mono C#',
  'Python 3',
  'Python 2',
  'Java 8',
  'Java 11',
  'Java 17',
  'Kotlin',
  'Rust',
  'Go',
  'Ruby',
  'PHP',
];

const verdicts = [
  'OK',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
];

// Generate a random date within the last year
const randomDate = (startDaysAgo = 365, endDaysAgo = 0) => {
  const start = new Date();
  start.setDate(start.getDate() - startDaysAgo);

  const end = new Date();
  end.setDate(end.getDate() - endDaysAgo);

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
};

// Random problem rating between 800 and 3500
const randomProblemRating = () => {
  const ratings = [
    800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
    2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200,
    3300, 3400, 3500,
  ];
  return ratings[Math.floor(Math.random() * ratings.length)];
};

// Random tags for a problem (1-4 tags)
const randomTags = () => {
  const numTags = Math.floor(Math.random() * 4) + 1;
  const tags = new Set<string>();

  while (tags.size < numTags) {
    tags.add(problemTags[Math.floor(Math.random() * problemTags.length)]);
  }

  return Array.from(tags);
};

// Generate mock problems
export const mockProblems: Problem[] = Array.from({ length: 200 }, (_, i) => {
  const rating = randomProblemRating();
  return {
    id: `p${i + 1}`,
    name: `Problem ${String.fromCharCode(65 + (i % 26))}. ${['Array', 'Tree', 'Graph', 'String', 'Math'][i % 5]} ${['Challenge', 'Puzzle', 'Problem', 'Quest', 'Task'][i % 5]}`,
    rating,
    tags: randomTags(),
    solved: Math.random() > 0.6,
    contestId: `c${Math.floor(i / 5) + 1}`,
    index: String.fromCharCode(65 + (i % 5)),
  };
});

// Generate mock submissions
export const mockSubmissions: Submission[] = Array.from(
  { length: 150 },
  (_, i) => {
    const problem =
      mockProblems[Math.floor(Math.random() * mockProblems.length)];
    const isAccepted = Math.random() > 0.3;

    return {
      id: `s${i + 1}`,
      problemId: problem.id,
      problemName: problem.name,
      verdict: isAccepted
        ? 'OK'
        : verdicts[Math.floor(Math.random() * (verdicts.length - 1)) + 1],
      language: languages[Math.floor(Math.random() * languages.length)],
      timeSubmitted: randomDate(),
      executionTime: Math.floor(Math.random() * 2000),
      memoryUsed: Math.floor(Math.random() * 100000) + 4000,
      contestId: Math.random() > 0.3 ? problem.contestId : undefined,
      rating: problem.rating,
    };
  }
);

// Generate mock contests
export const mockContests: Contest[] = Array.from({ length: 20 }, (_, i) => {
  const isUpcoming = i < 5;
  const isLive = i >= 5 && i < 7;
  const isPendingSystemTest = i >= 7 && i < 9;
  const isSystemTest = i >= 9 && i < 10;

  let phase: Contest['phase'];
  if (isUpcoming) phase = 'BEFORE';
  else if (isLive) phase = 'CODING';
  else if (isPendingSystemTest) phase = 'PENDING_SYSTEM_TEST';
  else if (isSystemTest) phase = 'SYSTEM_TEST';
  else phase = 'FINISHED';

  const types: Contest['type'][] = [
    'Div. 1',
    'Div. 2',
    'Div. 3',
    'Div. 4',
    'Educational',
    'Global',
  ];

  return {
    id: i + 1,
    name: `Codeforces Round #${800 + i} (${types[i % types.length]})`,

    type: `${types[i % types.length]}`,
    phase,
    frozen: false,
    durationSeconds: 0,
    startTimeSeconds: 0,
    relativeTimeSeconds: 0,
  };
});

// Generate mock friends
export const mockFriends: Friend[] = Array.from({ length: 15 }, (_, i) => {
  const ratings = [
    800, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400,
  ];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const getRank = (r: number) => {
    if (r < 1200) return 'Newbie';
    if (r < 1400) return 'Pupil';
    if (r < 1600) return 'Specialist';
    if (r < 1900) return 'Expert';
    if (r < 2100) return 'Candidate Master';
    if (r < 2300) return 'Master';
    if (r < 2400) return 'International Master';
    if (r < 2600) return 'Grandmaster';
    if (r < 3000) return 'International Grandmaster';
    return 'Legendary Grandmaster';
  };

  const activityTypes = ['SOLVED', 'PARTICIPATED', 'RANKED_UP'];
  const activityType = activityTypes[
    Math.floor(Math.random() * activityTypes.length)
  ] as 'SOLVED' | 'PARTICIPATED' | 'RANKED_UP';

  const recentActivity = {
    type: activityType,
    timestamp: randomDate(7, 0),
  } as Friend['recentActivity'];

  if (activityType === 'SOLVED') {
    const problem =
      mockProblems[Math.floor(Math.random() * mockProblems.length)];
    recentActivity.problemId = problem.id;
    recentActivity.problemName = problem.name;
  } else if (activityType === 'PARTICIPATED') {
    const contest =
      mockContests[Math.floor(Math.random() * mockContests.length)];
    recentActivity.contestId = contest.id;
    recentActivity.contestName = contest.name;
  }

  const handles = [
    'tourist',
    'Petr',
    'Um_nik',
    'scott_wu',
    'ecnerwala',
    'Benq',
    'ksun48',
    'Radewoosh',
    'Errichto',
    'jiangly',
    'tfg',
    'maroonrk',
    'PurpleCrayon',
    'ko_osaga',
    'Geothermal',
    'Egor',
    'neal',
    'dacin21',
    'aid',
    'Swistakk',
    'Petr',
    'tourist',
    'ksun48',
    'Benq',
    'ecnerwala',
    'Um_nik',
    'Radewoosh',
  ];

  return {
    handle: i === 0 ? 'tourist' : handles[i], // Ensure tourist is included
    rating,
    rank: getRank(rating),
    avatar: `https://avatars.githubusercontent.com/u/${10000 + i}?v=4`,
    isFollowing: Math.random() > 0.3,
    lastSeen: randomDate(7, 0),
    recentActivity,
  };
});

// Generate mock leaderboard
export const mockLeaderboard: LeaderboardEntry[] = Array.from(
  { length: 50 },
  (_, i) => {
    // Include some friends in the leaderboard
    const isFriend = i < mockFriends.length;
    const friend = isFriend ? mockFriends[i] : null;

    return {
      rank: i + 1,
      handle: friend ? friend.handle : `user${i}`,
      rating: friend ? friend.rating : Math.floor(Math.random() * 3500) + 800,
      solved: Math.floor(Math.random() * 1000) + 100,
      contests: Math.floor(Math.random() * 100) + 10,
      rankChange: Math.floor(Math.random() * 20) - 10,
      avatar: friend
        ? friend.avatar
        : `https://avatars.githubusercontent.com/u/${20000 + i}?v=4`,
      isFriend,
    };
  }
);

// Sort leaderboard by rating
mockLeaderboard.sort((a, b) => b.rating - a.rating);
mockLeaderboard.forEach((entry, i) => {
  entry.rank = i + 1;
});

// Generate distribution data for charts
export const getTagDistribution = (
  mockProblems: Problem[]
): { name: string; value: number }[] => {
  const tagCounts = new Map<string, number>();

  // Count the occurrences of each tag in solved problems
  mockProblems
    .filter((problem) => problem.solved)
    .forEach((problem) => {
      problem.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

  // Convert to array and sort by count
  return Array.from(tagCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Keep only top 10 tags
};

export const getRatingOverTime = (
  contests: any[]
): { date: string; rating: number; contestName: string; rank: number }[] => {
  return contests.map((contest) => {
    return {
      date: new Date(
        contest.ratingUpdateTimeSeconds * 1000
      ).toLocaleDateString(),
      rating: contest.newRating,
      contestName: contest.contestName,
      rank: contest.rank,
    };
  });
};

export const getDifficultyBreakdown = (
  problems: Problem[]
): {
  rating: string;
  solved: number;
}[] => {
  const ratingRanges = [
    '800',
    '900',
    '1000',
    '1100',
    '1200',
    '1300',
    '1400',
    '1500',
    '1600',
    '1700',
    '1800',
    '1900',
    '2000',
    '2100',
    '2200',
    '2300',
    // '1400',
  ];

  const countsByRange = new Map<string, number>();
  ratingRanges.forEach((range) => countsByRange.set(range, 0));

  problems
    .filter((problem) => problem.solved)
    .forEach((problem) => {
      const rating = problem.rating;
      let range: string;

      if (rating === 800) range = '800';
      else if (rating === 900) range = '900';
      else if (rating === 1000) range = '1000';
      else if (rating === 1100) range = '1100';
      else if (rating === 1200) range = '1200';
      else if (rating === 1300) range = '1300';
      else if (rating === 1400) range = '1400';
      else if (rating === 1500) range = '1500';
      else if (rating === 1600) range = '1600';
      else if (rating === 1700) range = '1700';
      else if (rating === 1800) range = '1800';
      else if (rating === 1900) range = '1900';
      else if (rating === 2000) range = '2000';
      else if (rating === 2100) range = '2100';
      else if (rating === 2200) range = '2200';
      else if (rating === 2300) range = '2300';
      // else if (rating === 1700) range = '1700';
      // else if (rating === 1800) range = '1800';
      // else if (rating === 1900) range = '1900';
      else range = '3200+';

      countsByRange.set(range, (countsByRange.get(range) || 0) + 1);
    });

  return ratingRanges.map((rating) => ({
    rating,
    solved: countsByRange.get(rating) || 0,
  }));
};
export function transformSubmissions(rawSubmissions: any[]): Submission[] {
  // console.log("tranformSubmission",rawSubmissions);
  if (!rawSubmissions?.length) return mockSubmissions;
  // console.log("raw sent");
  return rawSubmissions.map((sub) => ({
    id: sub.id.toString(),
    problemId: `${sub?.problem?.contestId}${sub?.problem?.index}`,
    problemName: sub.problem.name,
    verdict: sub.verdict || 'UNKNOWN',
    language: sub.programmingLanguage,
    timeSubmitted: new Date(sub.creationTimeSeconds * 1000).toISOString(),
    executionTime: sub.timeConsumedMillis || 0,
    memoryUsed: sub.memoryConsumedBytes / 1024 || 0,
    contestId: sub.contestId?.toString(),
    rating: sub.problem.rating || 0,
  }));
}

export function transformProblems(rawSubmissions: any[]): Problem[] {
  // console.log("tranformSubmission",rawSubmissions);
  if (!rawSubmissions?.length) return mockProblems;
  // console.log("raw sent-problems");
  return rawSubmissions.map((sub) => ({
    id: `${sub?.problem?.contestId}${sub?.problem?.index}`,
    name: sub.problem.name,
    rating: sub.problem.rating,
    tags: sub.problem.tags,
    solved: sub.verdict === 'OK',
    contestId: sub.problem.contestId.toString(),
    index: sub.problem.index,
  }));
}

