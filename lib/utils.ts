import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert ratings to specific CF colors
export function getRatingColor(rating: number): string {
  if (rating < 1200) return 'text-gray-500 dark:text-gray-400'; // Newbie
  if (rating < 1400) return 'text-green-500'; // Pupil
  if (rating < 1600) return 'text-cyan-500'; // Specialist
  if (rating < 1900) return 'text-blue-500'; // Expert
  if (rating < 2100) return 'text-violet-500'; // Candidate Master
  if (rating < 2400) return 'text-orange-500'; // Master/International Master
  if (rating < 3000) return 'text-red-500'; // Grandmaster/International Grandmaster
  return 'text-red-600 dark:text-red-500'; // Legendary Grandmaster
}

// Convert ratings to CF ranks
export function getRatingRank(rating: number): string {
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2300) return 'Master';
  if (rating < 2400) return 'International Master';
  if (rating < 2600) return 'Grandmaster';
  if (rating < 3000) return 'International Grandmaster';
  return 'Legendary Grandmaster';
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid Date';
  }
}

// Format contest time
export function formatContestTime(dateString: string): string {
  try {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    console.error('Error formatting contest time:', e);
    return 'Invalid Date';
  }
}

// Calculate time until contest
export function timeUntilContest(dateString: string): string {
  try {
    if (!dateString) {
      return 'N/A';
    }

    const contestDate = new Date(dateString);

    // Check if date is valid
    if (isNaN(contestDate.getTime())) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffMs = contestDate.getTime() - now.getTime();

    // Already started
    if (diffMs <= 0) return 'Started';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  } catch (e) {
    console.error('Error calculating time until contest:', e);
    return 'Invalid Date';
  }
}

// Format verdict with color
export function formatVerdict(verdict: string): {
  text: string;
  color: string;
} {
  switch (verdict) {
    case 'OK':
      return { text: 'Accepted', color: 'text-green-500' };
    case 'WRONG_ANSWER':
      return { text: 'Wrong Answer', color: 'text-red-500' };
    case 'TIME_LIMIT_EXCEEDED':
      return { text: 'Time Limit', color: 'text-yellow-500' };
    case 'MEMORY_LIMIT_EXCEEDED':
      return { text: 'Memory Limit', color: 'text-yellow-500' };
    case 'RUNTIME_ERROR':
      return { text: 'Runtime Error', color: 'text-orange-500' };
    case 'COMPILATION_ERROR':
      return { text: 'Compilation Error', color: 'text-purple-500' };
    default:
      return { text: verdict, color: 'text-gray-500' };
  }
}

// Format memory usage
export function formatMemory(bytes: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) {
    return '0 KB';
  }
  if (bytes < 1024) return `${Math.round(bytes)} KB`;
  return `${(bytes / 1024).toFixed(1)} MB`;
}

// Format time
export function formatTime(ms: number): string {
   if (ms === undefined || ms === null || isNaN(ms)) {
    return '0 ms';
  }
  return `${Math.round(ms)} ms`;
}


// Get chart colors
export function getChartColors(theme: 'dark' | 'light'): string[] {
  return theme === 'dark'
    ? [
        '#60a5fa',
        '#4ade80',
        '#f97316',
        '#a855f7',
        '#ec4899',
        '#f43f5e',
        '#14b8a6',
      ]
    : [
        '#2563eb',
        '#16a34a',
        '#ea580c',
        '#9333ea',
        '#db2777',
        '#e11d48',
        '#0d9488',
      ];
}
