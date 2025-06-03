
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DividendYieldChartProps {
  data: Array<{
    date: string;
    yield: number;
    dividend: number;
  }>;
  timeRange?: string;
}

const DividendYieldChart: React.FC<DividendYieldChartProps> = ({ data, timeRange = '1Y' }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dividend Yield Over Time ({timeRange})</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="yield" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DividendYieldChart;
