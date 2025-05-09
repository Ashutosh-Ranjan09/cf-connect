'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Card } from '@/components/ui/card';
import { getRatingOverTime } from '@/lib/mockData';
import { getChartColors, getRatingColor } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const rating = payload[0].value;
    const colorClass = getRatingColor(rating).replace('text-', 'text-').split(' ')[0];
    
    return (
      <Card className="bg-card/95 backdrop-blur-sm p-3 border shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-sm ${colorClass} font-medium`}>
          Rating: {rating}
        </p>
      </Card>
    );
  }
  return null;
};

export const RatingOverTimeChart = () => {
  const [data, setData] = useState<Array<{ date: string; rating: number }>>([]);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const chartColors = getChartColors(resolvedTheme === 'dark' ? 'dark' : 'light');
  
  // Rating boundaries for Codeforces ranks
  const ratingBoundaries = [
    { rating: 1200, label: 'Newbie' },
    { rating: 1400, label: 'Pupil' },
    { rating: 1600, label: 'Specialist' },
    { rating: 1900, label: 'Expert' },
    { rating: 2100, label: 'Candidate Master' },
    { rating: 2300, label: 'Master' },
    { rating: 2400, label: 'International Master' },
    { rating: 2600, label: 'Grandmaster' },
    { rating: 3000, label: 'International Grandmaster' }
  ];
  
  useEffect(() => {
    setMounted(true);
    setData(getRatingOverTime());
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Find min and max for domain
  const minRating = Math.min(...data.map(d => d.rating)) - 100;
  const maxRating = Math.max(...data.map(d => d.rating)) + 100;
  
  // Filter boundaries to show only those in the visible range
  const visibleBoundaries = ratingBoundaries.filter(
    b => b.rating >= minRating && b.rating <= maxRating
  );
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickFormatter={(value) => value.split(',')[0]} 
        />
        <YAxis domain={[minRating, maxRating]} />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Reference lines for rating boundaries */}
        {visibleBoundaries.map((boundary, i) => (
          <ReferenceLine 
            key={`ref-${i}`} 
            y={boundary.rating} 
            stroke={resolvedTheme === 'dark' ? "#666" : "#ccc"} 
            strokeDasharray="3 3" 
            opacity={0.7}
          />
        ))}
        
        <Line 
          type="monotone" 
          dataKey="rating" 
          stroke={chartColors[0]} 
          strokeWidth={2}
          activeDot={{ r: 6 }} 
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};