import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card } from './ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { FaCalendarAlt, FaPercent, FaChartLine } from 'react-icons/fa';
import { MdOutlineLabel } from 'react-icons/md';

interface PayoutRatioChartProps {
  symbol: string;
}

interface QuarterlyPayout {
  symbol: string;
  date: string;
  net_income: number | null;
  payout_ratio: number | null;
  dividends_paid: number | null;
  as_of_date: string | null;
}

const bandLabels = [
  'Low',
  'Mid',
  'Best',
  'Other',
];

// Updated band colors: Low=red, Mid=yellow, Best=green, Other=blue
const bandColors = [
  'rgba(239,68,68,0.25)',   // red-500, Low
  'rgba(251,191,36,0.25)', // yellow-400, Mid
  'rgba(34,197,94,0.25)',  // green-500, Best
  'rgba(59,130,246,0.25)', // blue-500, Other
];

// Updated legend swatch colors to match bands
const bandSwatchColors = [
  '#ef4444', // red-500
  '#fbbf24', // yellow-400
  '#22c55e', // green-500
  '#3b82f6', // blue-500
];

const PayoutRatioChart: React.FC<PayoutRatioChartProps> = ({ symbol }) => {
  const [data, setData] = useState<QuarterlyPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('quarterly_payout_ratio')
          .select('symbol, date, net_income, payout_ratio, dividends_paid, as_of_date')
          .eq('symbol', symbol)
          .order('date', { ascending: true });
        if (error) throw error;
        setData(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  return (
    <Card className="w-full p-6 shadow-lg rounded-xl">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><FaChartLine className="text-blue-600" /> Payout Ratio Trend</h2>
        <p className="text-gray-500 text-sm">Visualize the payout ratio over time for the selected symbol. Colored bands indicate quartile ranges for quick assessment.</p>
      </div>
      {/* Band Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {bandLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="inline-block w-4 h-4 rounded" style={{ background: bandSwatchColors[i] }}></span>
            <span className="font-medium text-gray-700">{label}</span>
          </div>
        ))}
      </div>
      <ChartSection loading={loading} error={error} data={data} />
    </Card>
  );
};

const ChartSection = ({ loading, error, data }: { loading: boolean; error: string | null; data: QuarterlyPayout[] }) => {
  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!data.length) return <div className="py-12 text-center text-gray-400">No data available.</div>;

  // Calculate min and max payout_ratio for banding
  const payoutRatios = data.map(d => d.payout_ratio ?? 0);
  const min = Math.min(...payoutRatios);
  const max = Math.max(...payoutRatios);
  const range = max - min;
  const bandHeight = range / 4;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d: QuarterlyPayout = payload[0].payload;
      // Find band index
      let bandIdx = 0;
      if (d.payout_ratio != null) {
        bandIdx = Math.min(3, Math.floor((d.payout_ratio - min) / bandHeight));
      }
      // Format date
      const dateStr = new Date(d.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      let commentary = '';
      if (d.dividends_paid != null) {
        commentary += `Dividend Payout Ratio: ${d.payout_ratio != null ? d.payout_ratio.toFixed(0) + '%' : '-'}. `;
        if (d.payout_ratio != null) {
          if (d.payout_ratio < 0.2) {
            commentary += "Not paying enough.";
          } else if (d.payout_ratio < 0.5) {
            commentary += "This suggests a healthy margin for the dividend.";
          } else if (d.payout_ratio < 0.75) {
            commentary += "This is a moderate payout ratio.";
          } else if (d.payout_ratio < 1) {
            commentary += "This high payout ratio might indicate less flexibility.";
          } else {
            commentary += "A payout ratio above 100% is unsustainable.";
          }
        }
      }
      return (
        <div className="rounded shadow p-4 border text-sm min-w-[220px] backdrop-blur" style={{ background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: 'none' }}>
          <div className="flex items-center gap-2 mb-1"><MdOutlineLabel className="text-blue-200" /><b>Symbol:</b> {d.symbol}</div>
          <div className="flex items-center gap-2 mb-1"><FaCalendarAlt className="text-green-200" /><b>Date:</b> {dateStr}</div>
          <div className="flex items-center gap-2 mb-1"><FaPercent className="text-violet-200" /><b>Payout Ratio:</b> {d.payout_ratio != null ? d.payout_ratio.toFixed(2) : '-'}</div>
          <div className="flex items-center gap-2 mb-1"><FaChartLine className="text-pink-200" /><b>Net Income:</b> {d.net_income != null ? d.net_income.toLocaleString() : '-'}</div>
          <div className="flex items-center gap-2 mb-1"><FaChartLine className="text-emerald-200" /><b>Dividends Paid:</b> {d.dividends_paid != null ? d.dividends_paid.toLocaleString() : '-'}</div>
          <div className="flex items-center gap-2 mb-1"><FaCalendarAlt className="text-gray-200" /><b>As of Date:</b> {d.as_of_date ?? '-'}</div>
          <div className="flex items-center gap-2 mt-2"><span className="inline-block w-3 h-3 rounded" style={{ background: bandSwatchColors[bandIdx] }}></span><span className="text-xs text-gray-200">Band: <b>{bandLabels[bandIdx]}</b></span></div>
          {commentary && <div className="mt-2 text-xs text-gray-300">{commentary}</div>}
        </div>
      );
    }
    return null;
  };

  // Custom tick renderer for rotated X-axis labels
  const RotatedTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} transform="rotate(-35)" fontSize={12} fill="#64748b" textAnchor="end">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 30, right: 40, left: 10, bottom: 40 }}>
          {/* Colored Bands */}
          <ReferenceArea y1={min} y2={min + bandHeight} fill={bandColors[0]} ifOverflow="extendDomain" />
          <ReferenceArea y1={min + bandHeight} y2={min + 2 * bandHeight} fill={bandColors[1]} ifOverflow="extendDomain" />
          <ReferenceArea y1={min + 2 * bandHeight} y2={min + 3 * bandHeight} fill={bandColors[2]} ifOverflow="extendDomain" />
          <ReferenceArea y1={min + 3 * bandHeight} y2={max} fill={bandColors[3]} ifOverflow="extendDomain" />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={RotatedTick} height={60} interval={0} />
          <YAxis tickFormatter={v => typeof v === 'number' ? v.toFixed(2) : ''} label={{ value: 'Payout Ratio', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }} />
          <Tooltip content={<CustomTooltip />} />
          {/* Area shading under the line with new gradient */}
          <defs>
            <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="#f472b6" stopOpacity={0.08}/>
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="payout_ratio"
            stroke="#7c3aed" // violet-600
            strokeWidth={2.5}
            dot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#10b981', filter: 'drop-shadow(0 1px 4px #10b98133)' }} // emerald-500
            activeDot={{ r: 8, stroke: '#f472b6', strokeWidth: 3, fill: '#f472b6', filter: 'drop-shadow(0 2px 8px #f472b666)' }} // pink-400
            isAnimationActive={true}
            animationDuration={1200}
            fill="url(#colorPayout)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayoutRatioChart; 