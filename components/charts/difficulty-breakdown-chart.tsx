'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { getDifficultyBreakdown } from '@/lib/mockData';
import { useCodeforcesData } from '@/app/providers';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { rating: string; solved: number };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm p-3 border shadow-md">
        <p className="font-medium">Difficulty: {payload[0].payload.rating}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> problems
          solved
        </p>
      </Card>
    );
  }
  return null;
};

// Get color for difficulty
const getDifficultyColor = (rating: string): string => {
  const lowerBound = parseInt(rating.split('-')[0]);

  if (lowerBound === 800) return '#cccccc';
  if (lowerBound === 900) return '#77ff77';
  if (lowerBound === 1000) return '#77ddbb';
  if (lowerBound === 1100) return '#aaaaff';
  if (lowerBound === 1200) return '#ff88ff';
  if (lowerBound === 1300) return '#ffcc88';
  if (lowerBound === 1400) return '#ff7777';
  if (lowerBound === 1500) return '#ff3333';
  if (lowerBound === 1600) return '#cccccc';
  if (lowerBound === 1700) return '#77ff77';
  if (lowerBound === 1800) return '#77ddbb';
  if (lowerBound === 1900) return '#aaaaff';
  if (lowerBound === 2000) return '#ff88ff';
  if (lowerBound === 2100) return '#ffcc88';
  if (lowerBound === 2200) return '#ff7777';
  if (lowerBound === 2300) return '#ff3333';
  return '#aa0000';
};

export const DifficultyBreakdownChart = () => {
  const { problems } = useCodeforcesData();
  // console.log(problems);
  const [data, setData] = useState<Array<{ rating: string; solved: number }>>(
    []
  );
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setData(getDifficultyBreakdown(problems));
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="rating"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="solved" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getDifficultyColor(entry.rating)}
              fillOpacity={resolvedTheme === 'dark' ? 0.8 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
