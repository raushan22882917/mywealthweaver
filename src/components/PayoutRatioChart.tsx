import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card } from './ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, Area, AreaChart } from 'recharts';
import { FaCalendarAlt, FaPercent, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
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

interface YearlyPayout {
  symbol: string;
  date: string;
  net_income: number | null;
  payout_ratio: number | null;
  dividends_paid: number | null;
  as_of_date: string | null;
}

// Updated band colors to match the sketch: Green, Yellow, Red, Danger
const bandColors = [
  'rgba(34,197,94,0.15)',   // green-500, Healthy
  'rgba(251,191,36,0.15)',  // yellow-400, Moderate
  'rgba(239,68,68,0.15)',   // red-500, Not Normal
  'rgba(220,38,38,0.25)',   // red-600, Danger
];

// Updated legend swatch colors to match bands
const bandSwatchColors = [
  '#22c55e', // green-500
  '#fbbf24', // yellow-400
  '#ef4444', // red-500
  '#dc2626', // red-600
];

// Percentage ranges for each band
const bandRanges = [
  { min: 0, max: 50, label: '< 50%' },
  { min: 50, max: 75, label: '50-75%' },
  { min: 75, max: 100, label: '75-100%' },
  { min: 100, max: 200, label: '> 100%' }
];

// Area fill colors for different zones
const areaFillColors = [
  'rgba(34,197,94,0.3)',   // green area
  'rgba(251,191,36,0.3)',  // yellow area
  'rgba(239,68,68,0.3)',   // red area
  'rgba(220,38,38,0.4)',   // danger area
];

const PayoutRatioChart: React.FC<PayoutRatioChartProps> = ({ symbol }) => {
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyPayout[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch quarterly data
        const { data: quarterly, error: quarterlyError } = await supabase
          .from('quarterly_payout_ratio')
          .select('symbol, date, net_income, payout_ratio, dividends_paid, as_of_date')
          .eq('symbol', symbol)
          .order('date', { ascending: true });
        
        if (quarterlyError) throw quarterlyError;

        // Fetch yearly data
        const { data: yearly, error: yearlyError } = await supabase
          .from('yearly_payout_ratio') // Changed to yearly_payout_ratio
          .select('symbol, date, net_income, payout_ratio, dividends_paid, as_of_date')
          .eq('symbol', symbol)
          .order('date', { ascending: true });
        
        if (yearlyError) throw yearlyError;

        setQuarterlyData(quarterly || []);
        setYearlyData(yearly || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  return (
    <Card className="w-full p-6 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
     
      
      <Tabs defaultValue="quarterly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="quarterly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all">
            <FaCalendarAlt className="mr-2" />
            Quarterly View
          </TabsTrigger>
          <TabsTrigger value="yearly" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all">
            <FaCalendarAlt className="mr-2" />
            Yearly View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quarterly" className="mt-0">
        
          <ChartSection loading={loading} error={error} data={quarterlyData} dataType="quarterly" />
        </TabsContent>

        <TabsContent value="yearly" className="mt-0">
          {/* Enhanced Band Legend */}
        
          <ChartSection loading={loading} error={error} data={yearlyData} dataType="yearly" />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const ChartSection = ({ 
  loading, 
  error, 
  data, 
  dataType 
}: { 
  loading: boolean; 
  error: string | null; 
  data: (QuarterlyPayout | YearlyPayout)[]; 
  dataType: 'quarterly' | 'yearly';
}) => {
  if (loading) return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Loading payout ratio data...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center gap-3 text-red-500">
        <FaExclamationTriangle />
        <span>{error}</span>
      </div>
    </div>
  );
  
  if (!data.length) return (
    <div className="py-16 text-center text-gray-400 dark:text-gray-500">
      <FaChartLine className="mx-auto mb-3 text-4xl opacity-50" />
      <p>No {dataType} payout ratio data available for this symbol.</p>
    </div>
  );

  // Hard-coded Y-axis boundaries with custom range
  const yAxisMin = 0; // Start from 0%
  const yAxisMax = 150; // End at 150%

  // Band boundaries: 0-50, 50-75, 75-100, >100
  const bandBoundaries = [0, 50, 75, 100, 150];
  const divisionLines = bandBoundaries;

  // Updated band colors: Green, Yellow, Red, Danger
  const bandColors = [
   'rgb(6, 242, 18)',   // green area
    'rgb(241, 176, 9)',  // yellow area
    'rgb(205, 85, 85)',   // red area
    'rgb(254, 0, 0)',   // danger area  // red-600, >100
  ];

  // Updated legend swatch colors to match bands
  const bandSwatchColors = [
    '#22c55e', // green-500
    '#fbbf24', // yellow-400
    '#ef4444', // red-500
    '#dc2626', // red-600
  ];

  // Area fill colors for different zones
  const areaFillColors = [
    'rgb(6, 242, 18)',   // green area
    'rgb(241, 176, 9)',  // yellow area
    'rgb(205, 85, 85)',   // red area
    // red area
    'rgb(254, 0, 0)',   // danger area
  ];

  // Function to get band index for a payout ratio
  const getBandIndex = (payoutRatio: number | null): number => {
    if (payoutRatio == null) return 0;
    if (payoutRatio < 50) return 0;
    if (payoutRatio < 75) return 1;
    if (payoutRatio < 100) return 2;
    return 3;
  };

  // Filter out data points with payout_ratio > 150
  const filteredData = data.filter(d => d.payout_ratio == null || d.payout_ratio <= 150);

  // Create data with band information and add index for X-axis
  const dataWithBands = filteredData.map((d, i) => ({
    ...d,
    bandIndex: getBandIndex(d.payout_ratio),
    bandColor: areaFillColors[getBandIndex(d.payout_ratio)],
    index: i + 1 // X-axis: 1, 2, 3, ...
  }));

  // For yearly, add a formatted year string for X-axis
  const dataWithBandsYearly = dataType === 'yearly'
    ? dataWithBands.map(d => ({ ...d, year: new Date(d.date).getFullYear().toString() }))
    : dataWithBands;

  // Dynamically set X-axis and Y-axis domains to start from first data point
  const minPayout = dataWithBands.length > 0 ? Math.min(...dataWithBands.map(d => d.payout_ratio ?? 0)) : 0;
  const yAxisDomain = [minPayout, 150];
  const xAxisDomain = dataWithBands.length > 0 ? [0, dataWithBands.length] : undefined;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d: QuarterlyPayout | YearlyPayout = payload[0].payload;
      
      // Find band index based on 4 equal divisions
      let bandIdx = 0;
      if (d.payout_ratio != null) {
        if (d.payout_ratio < 40) bandIdx = 0;
        else if (d.payout_ratio < 60) bandIdx = 1;
        else if (d.payout_ratio < 80) bandIdx = 2;
        else bandIdx = 3;
      }
      
      // Format date
      const dateStr = new Date(d.date).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: dataType === 'quarterly' ? 'short' : undefined, 
        day: dataType === 'quarterly' ? 'numeric' : undefined 
      });
      
      let commentary = '';
      if (d.payout_ratio != null) {
        if (d.payout_ratio < 40) {
          commentary = "Low payout ratio - good dividend sustainability.";
        } else if (d.payout_ratio < 60) {
          commentary = "Moderate payout ratio - balanced approach.";
        } else if (d.payout_ratio < 80) {
          commentary = "High payout ratio - monitor for sustainability.";
        } else {
          commentary = "Very high payout ratio - may indicate reduced flexibility.";
        }
      }
      
      return (
        <div className="rounded-xl shadow-2xl p-5 border-0 text-sm min-w-[280px] backdrop-blur-lg" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', 
               color: '#fff',
               border: `2px solid ${bandSwatchColors[bandIdx]}40`
             }}>
          <div className="flex items-center gap-2 mb-2">
            <MdOutlineLabel className="text-blue-300" />
            <b className="text-blue-200">Symbol:</b> 
            <span className="text-white font-mono">{d.symbol}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarAlt className="text-green-300" />
            <b className="text-green-200">Date:</b> 
            <span className="text-white">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FaPercent className="text-violet-300" />
            <b className="text-violet-200">Payout Ratio:</b> 
            <span className="text-white font-mono">{d.payout_ratio != null ? d.payout_ratio.toFixed(1) + '%' : '-'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-pink-300" />
            <b className="text-pink-200">Net Income:</b> 
            <span className="text-white font-mono">{d.net_income != null ? '$' + d.net_income.toLocaleString() : '-'}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <FaChartLine className="text-emerald-300" />
            <b className="text-emerald-200">Dividends Paid:</b> 
            <span className="text-white font-mono">{d.dividends_paid != null ? '$' + d.dividends_paid.toLocaleString() : '-'}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" 
               style={{ background: `${bandSwatchColors[bandIdx]}20` }}>
            <span className="inline-block w-4 h-4 rounded-full border-2 border-white" 
                  style={{ background: bandSwatchColors[bandIdx] }}></span>
            <span className="text-sm font-semibold text-white">
              Section {bandIdx + 1}
            </span>
          </div>
          
          {commentary && (
            <div className="mt-3 p-3 rounded-lg bg-white/10 border-l-4" 
                 style={{ borderLeftColor: bandSwatchColors[bandIdx] }}>
              <p className="text-xs text-gray-200 leading-relaxed">{commentary}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tick renderer for X-axis labels
  const SequenceTick = (props: any) => {
    const { x, y, payload } = props;
    if (dataType === 'yearly') {
      // For yearly, show year
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} fontSize={12} fill="#64748b" textAnchor="middle" fontWeight="500">
            {payload.value}
          </text>
        </g>
      );
    }
    if (payload.value === 0) {
      // Show no label for 0
      return null;
    }
    // Quarterly: Qn-YY
    let label = `Q${payload.value}`;
    if (dataWithBands[payload.value - 1]?.date) {
      const date = new Date(dataWithBands[payload.value - 1].date);
      label = `Q${Math.floor(date.getMonth() / 3) + 1}-${date.getFullYear().toString().slice(-2)}`;
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} fontSize={11} fill="#64748b" textAnchor="middle" fontWeight="500">
          {label}
        </text>
      </g>
    );
  };

  // Custom Y-axis tick formatter
  const YAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const value = payload.value;
    
    // Show division lines
    let label = value + '%';
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} fontSize={11} fill="#64748b" textAnchor="end" fontWeight="500">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[400px] w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={dataWithBandsYearly} 
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          {/* Bands: 0-50, 50-75, 75-100, >100 */}
          {(() => {
            // Use correct band fill for both quarterly and yearly
            const bandX1 = dataType === 'yearly' ? (dataWithBandsYearly[0]?.year || '') : 1;
            const bandX2 = dataType === 'yearly' ? (dataWithBandsYearly[dataWithBandsYearly.length - 1]?.year || '') : dataWithBands.length;
            return (
              <>
                <ReferenceArea x1={bandX1} x2={bandX2} y1={0} y2={50} fill={bandColors[0]} ifOverflow="extendDomain" />
                <ReferenceArea x1={bandX1} x2={bandX2} y1={50} y2={75} fill={bandColors[1]} ifOverflow="extendDomain" />
                <ReferenceArea x1={bandX1} x2={bandX2} y1={75} y2={100} fill={bandColors[2]} ifOverflow="extendDomain" />
                <ReferenceArea x1={bandX1} x2={bandX2} y1={100} y2={150} fill={bandColors[3]} ifOverflow="extendDomain" />
              </>
            );
          })()}
          {/* Division lines at 50, 75, 100 */}
          <ReferenceArea y1={50} y2={50} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="5 5" />
          <ReferenceArea y1={75} y2={75} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="5 5" />
          <ReferenceArea y1={100} y2={100} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="5 5" />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey={dataType === 'yearly' ? 'year' : 'index'}
            tick={SequenceTick}
            height={60} 
            interval={0}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={{ stroke: '#cbd5e1' }}
            domain={dataType === 'yearly' ? undefined : xAxisDomain}
          />
          <YAxis 
            domain={yAxisDomain}
            tick={YAxisTick}
            ticks={divisionLines}
            label={{ 
              value: 'Payout Ratio (%)', 
              angle: -90, 
              position: 'insideLeft', 
              offset: 10, 
              style: { textAnchor: 'middle', fontSize: 12, fontWeight: 600, fill: '#475569' } 
            }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Colored Area under the line based on 4 bands */}
          <Area
            type="monotone"
            dataKey="payout_ratio"
            stroke="#fff"
            strokeWidth={3}
            fill="url(#colorGradient)"
            dot={{ 
              r: 6, 
              stroke: '#fff', 
              strokeWidth: 3, 
              fill: '#10b981', 
              filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))' 
            }}
            activeDot={{ 
              r: 10, 
              stroke: '#f472b6', 
              strokeWidth: 4, 
              fill: '#f472b6', 
              filter: 'drop-shadow(0 4px 12px rgba(244, 114, 182, 0.4))' 
            }}
            isAnimationActive={true}
            animationDuration={1500}
          />
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayoutRatioChart; 