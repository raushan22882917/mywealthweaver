import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import styles from './Benchmark.module.css';

interface BenchmarkProps {
  ticker: string;
}

interface DividendMetrics {
  ticker: string;
  safety_score: number;
  tag: string | null;
  attractiveness_score: number;
  attractiveness: string | null;
  momentum_12m: number;
  trend_12m: string | null;
}

const RING_COLORS = [
  '#e57373', // Soft Red (Very Low)
  '#ffd54f', // Soft Yellow (Average)
  '#64b5f6', // Soft Blue (Good)
  '#81c784', // Soft Green (Very Good)
];

function getPerformanceColor(score: number) {
  if (score < 25) return RING_COLORS[0]; // Very Low
  if (score < 50) return RING_COLORS[1]; // Average
  if (score < 75) return RING_COLORS[2]; // Good
  return RING_COLORS[3]; // Very Good
}

function getPerformanceLabel(score: number) {
  if (score < 25) return 'Very Low';
  if (score < 50) return 'Average';
  if (score < 75) return 'Good';
  return 'Very Good';
}

const RingChart = ({ value, max, color, label, sublabel, boldLabel }: { value: number; max: number; color: string; label: string; sublabel?: string; boldLabel?: boolean; }) => {
  const angle = 270;
  const radius = 48;
  const stroke = 10;
  const normalizedValue = Math.max(0, Math.min(value, max));
  const circumference = 2 * Math.PI * radius * (angle / 360);
  const progress = (normalizedValue / max) * circumference;
  return (
    <svg width={120} height={80} viewBox="0 0 120 80" className="ring-shadow">
      <g transform="translate(60,60)">
        <path
          d="M 0 0 m -48 0 a 48 48 0 1 1 96 0"
          fill="none"
          stroke="#eee"
          strokeWidth={stroke}
        />
        <path
          d="M 0 0 m -48 0 a 48 48 0 1 1 96 0"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress},${circumference - progress}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)',
            filter: 'drop-shadow(0 2px 8px #0004)'
          }}
        />
      </g>
      <text x="60" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{`${value}/${max}`}</text>
      <text x="60" y="66" textAnchor="middle" fontSize="12" fill="#fff" fontWeight={boldLabel ? "bold" : "500"} style={{ marginTop: 8 }}>{label}</text>
      {sublabel && <text x="60" y="76" textAnchor="middle" fontSize="10" fill="#aaa" style={{ marginTop: 20 }}>{sublabel}</text>}
    </svg>
  );
};

// IndicatorArrow component
const IndicatorArrow = ({ trend }: { trend?: string | null }) => {
  if (trend === 'up') return <span className={styles.arrowWrapper}><ArrowUpRight className={styles.arrowUp} color="#22c55e" /></span>;
  if (trend === 'down') return <span className={styles.arrowWrapper}><ArrowDownRight className={styles.arrowDown} color="#22c55e" /></span>;
  return <span className={styles.arrowWrapper}><Minus className={styles.arrowNeutral} color="#22c55e" /></span>;
};

const FACTOR_INFO = {
  'Overall Factors': 'An average of all factors, providing a holistic benchmark score.',

  'Content Factors': 'Measures the safety and reliability of the dividend, based on payout ratios, earnings, and more.',
  'Marketing Factors': 'Assesses the attractiveness of the stock, including yield, growth, and valuation.',
  'Service Factors': 'Reflects the momentum and recent performance trends over the last 12 months.',
};

// Add SegmentedRingChart for Overall Factors
const SegmentedRingChart = ({ value, max, label, sublabel, boldLabel }: { value: number; max: number; label: string; sublabel?: string; boldLabel?: boolean; }) => {
  const radius = 48;
  const stroke = 10;
  const center = 60;
  const segmentCount = 4;
  const angle = 270; // total angle for the ring
  const startAngle = 135; // so the ring is centered at the top
  const segmentAngle = angle / segmentCount;
  // Find which segment the value falls into
  const percent = value / max;
  const segmentIndex = Math.min(
    segmentCount - 1,
    Math.floor(percent * segmentCount)
  );
  // Arrow angle (in radians)
  const arrowAngle = (startAngle + percent * angle) * (Math.PI / 180);
  // Arrow endpoint
  const arrowLength = radius - stroke / 2 - 6;
  const arrowX = center + arrowLength * Math.cos(arrowAngle);
  const arrowY = center + arrowLength * Math.sin(arrowAngle);

  // Helper to describe an arc
  function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
    const startRad = (Math.PI / 180) * start;
    const endRad = (Math.PI / 180) * end;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = end - start <= 180 ? 0 : 1;
    return [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    ].join(' ');
  }

  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="ring-shadow">
      {/* Segments */}
      {Array.from({ length: segmentCount }).map((_, i) => {
        const segStart = startAngle + i * segmentAngle;
        const segEnd = segStart + segmentAngle;
        return (
          <path
            key={i}
            d={describeArc(center, center, radius, segStart, segEnd)}
            fill="none"
            stroke={RING_COLORS[i]}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.95}
            style={{ filter: 'drop-shadow(0 2px 8px #0004)' }}
          />
        );
      })}
      {/* Arrow */}
      <g>
        <line
          x1={center}
          y1={center}
          x2={arrowX}
          y2={arrowY}
          strokeWidth={3}
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 6 3, 0 6" fill="#222" />
          </marker>
        </defs>
      </g>
      {/* Center value and label */}
      <text x={center} y={center - 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill={RING_COLORS[segmentIndex]}>{`${value}/${max}`}</text>
      <text
        x={center}
        y={center + 16}
        textAnchor="middle"
        className="ring-label"
        fontWeight={boldLabel ? "bold" : "500"}
        fill="#fff"
        style={{ marginTop: 8 }}
      >
        {label}
      </text>
      {sublabel && <text x={center} y={center + 28} textAnchor="middle" fontSize="10" fill="#aaa" style={{ marginTop: 20 }}>{sublabel}</text>}
    </svg>
  );
};

const fadeInStyle = `
@keyframes fadein { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
.animate-fadein { animation: fadein 0.8s cubic-bezier(0.4,0,0.2,1) both; }
`;
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = fadeInStyle;
  document.head.appendChild(style);
}

const Benchmark: React.FC<BenchmarkProps> = ({ ticker }) => {
  const [metrics, setMetrics] = useState<DividendMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    supabase
      .from('dividend_metrics')
      .select('ticker,safety_score,tag,attractiveness_score,attractiveness,momentum_12m,trend_12m')
      .eq('ticker', ticker)
      .single()
      .then(({ data }) => {
        setMetrics(data);
        setLoading(false);
      });
  }, [ticker]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 animate-fadein">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400 mb-4" />
      <div className="text-center text-lg font-medium text-gray-500">Loading benchmark...</div>
    </div>
  );
  if (!metrics) return <div className="text-center py-8 text-gray-400 animate-fadein">No benchmark data found.</div>;

  // Use exact values for total and color/label
  const totalRaw = Number(metrics.safety_score || 0) + Number(metrics.attractiveness_score || 0) + Number(metrics.momentum_12m || 0);
  const total = Math.round(totalRaw / 3);
  const color = getPerformanceColor(total);
  const label = getPerformanceLabel(total);

  return (
    <section className=" mx-auto mt-2 mb-4 px-2 md:px-0" >
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight text-white drop-shadow-lg animate-fadein">Stock Benchmark Overview</h2>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full animate-fadein">
        {/* 3 Factor Rings */}
        <div className="flex flex-row gap-4 md:gap-6 flex-wrap justify-center">
          {/* Content Factors */}
          <Card className={`group flex flex-col items-center justify-center p-4 w-[240px] h-[220px] max-w-[240px] min-w-[160px] ${styles.cardOverall} ${styles.cardTextWhite} bg-transparent animate-fadein`} style={{ animationDelay: '0.1s' }}>
            <div className="mb-1 text-xs font-semibold text-white flex items-center gap-1">
              Overall Factors
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-white group-hover:text-white cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs text-center tooltip-content">
                  {FACTOR_INFO['Overall Factors']}
                </TooltipContent>
              </Tooltip>
            </div>
            <SegmentedRingChart
              value={total}
              max={100}
              label={label}
              sublabel={`Avg: ${(totalRaw / 3).toFixed(1)}`}
              boldLabel={true}
            />
          </Card>
          <Card className={`group flex flex-col items-center justify-center p-3 min-w-[160px] max-w-[240px] ${styles.cardSafety} ${styles.cardTextWhite} bg-transparent animate-fadein`} style={{ animationDelay: '0.2s' }}>
            <div className="mb-1 text-xs font-semibold text-white flex items-center gap-1 mt-3">
              Safety Factors
              <Tooltip>
                <TooltipContent side="top" className="max-w-xs text-xs text-center tooltip-content">
                  {FACTOR_INFO['Content Factors']}
                </TooltipContent>
              </Tooltip>
            </div>
            <RingChart 
              value={metrics.safety_score} 
              max={100} 
              color={RING_COLORS[0]} 
              label={''}
              sublabel={undefined}
            />
            <span className="block text-xs text-white mt-2 font-semibold tracking-wide">Safety</span>
            {metrics.tag && (
              <div className={
                metrics.tag.toLowerCase().includes('low') ? 'text-green-400 font-bold mt-2' :
                metrics.tag.toLowerCase().includes('medium') ? 'text-yellow-400 font-bold mt-2' :
                metrics.tag.toLowerCase().includes('high') ? 'text-red-400 font-bold mt-2' :
                'text-white mt-2'
              }>
                {metrics.tag}
              </div>
            )}
          </Card>
          {/* Marketing Factors */}
          <Card className={`group flex flex-col items-center justify-center p-3 min-w-[160px] max-w-[240px] ${styles.cardAttractiveness} ${styles.cardTextWhite} bg-transparent animate-fadein`} style={{ animationDelay: '0.3s' }}>
            <div className="mb-1 text-xs font-semibold text-white flex items-center gap-1 mt-3">
              Attractiveness Factors
              <Tooltip>
                <TooltipContent side="top" className="max-w-xs text-xs text-center tooltip-content">
                  {FACTOR_INFO['Marketing Factors']}
                </TooltipContent>
              </Tooltip>
            </div>
            <RingChart 
              value={metrics.attractiveness_score} 
              max={100} 
              color={RING_COLORS[1]} 
              label={''}
              sublabel={undefined}
            />
            <span className="block text-xs text-white mt-2 font-semibold tracking-wide">Attractiveness</span>
          </Card>
          {/* Service Factors */}
          <Card className={`group flex flex-col items-center justify-center p-3 min-w-[160px] max-w-[240px] ${styles.cardMomentum} ${styles.cardTextWhite} bg-transparent animate-fadein`} style={{ animationDelay: '0.4s' }}>
            <div className="mb-1 text-xs font-semibold text-white flex items-center gap-1 mt-3">
              Momentum Factors
              <Tooltip>
                <TooltipContent side="top" className="max-w-xs text-xs text-center tooltip-content">
                  {FACTOR_INFO['Service Factors']}
                </TooltipContent>
              </Tooltip>
            </div>
            <RingChart 
              value={metrics.momentum_12m} 
              max={100} 
              color={RING_COLORS[2]} 
              label={''}
              sublabel={undefined}
            />
            <span className="block text-xs text-white mt-2 font-semibold tracking-wide">Momentum</span>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Benchmark;
