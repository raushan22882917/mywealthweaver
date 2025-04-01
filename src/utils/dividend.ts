
// Utility functions for dividend data

export interface DividendHistoryData {
  id: number;
  symbol: string;
  date: string;
  dividends: number;
  created_at?: string;
}

export const filterDividendData = (
  data: DividendHistoryData[],
  range: 'annual' | 'quarterly' | '1Y' | '3Y' | '5Y' | '10Y' | 'MAX' = 'MAX'
): DividendHistoryData[] => {
  if (!data || data.length === 0) return [];
  
  // If filtering by dividend type
  if (range === 'annual' || range === 'quarterly') {
    return data;
  }
  
  const now = new Date();
  const yearsAgo = new Date();
  
  switch (range) {
    case '1Y':
      yearsAgo.setFullYear(now.getFullYear() - 1);
      break;
    case '3Y':
      yearsAgo.setFullYear(now.getFullYear() - 3);
      break;
    case '5Y':
      yearsAgo.setFullYear(now.getFullYear() - 5);
      break;
    case '10Y':
      yearsAgo.setFullYear(now.getFullYear() - 10);
      break;
    case 'MAX':
      return data;
    default:
      yearsAgo.setFullYear(now.getFullYear() - 1);
  }

  return data.filter(item => new Date(item.date) >= yearsAgo);
};

export const calculateDividendGrowth = (
  data: DividendHistoryData[],
  periods: number = 5
): number => {
  if (!data || data.length < 2) return 0;
  
  // Sort by date descending
  const sortedData = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get latest and earliest dividend within the period
  const latest = sortedData[0]?.dividends;
  const earliest = sortedData[Math.min(sortedData.length - 1, periods)]?.dividends;
  
  if (!latest || !earliest || earliest === 0) return 0;
  
  // Calculate compound annual growth rate
  const years = periods;
  return ((latest / earliest) ** (1 / years) - 1) * 100;
};

export const formatDividendAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
};
