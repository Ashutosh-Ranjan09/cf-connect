// Utility to get the recommendation range for a given rating
export function getRecommendationRange(rating: number): [number, number] {
  const start = Math.ceil(rating / 100) * 100;
  return [start, start + 200];
}
