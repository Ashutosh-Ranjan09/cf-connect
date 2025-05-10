'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { getTagDistribution } from '@/lib/mockData';
import { getChartColors } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number; fill: string };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm p-3 border shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> problems
          solved
        </p>
      </Card>
    );
  }
  return null;
};

export const TagDistributionChart = () => {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const chartColors = getChartColors(
    resolvedTheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    setMounted(true);
    setData(getTagDistribution());
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </PieChart>
    </ResponsiveContainer>
  );
};
