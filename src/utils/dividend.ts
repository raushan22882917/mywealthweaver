
export interface DividendData {
  Symbol: string;
  shortname: string;
  title: string;
  dividendRate: number;
  dividendYield: number;
  payoutRatio: number;
  exdividenddate: string;
  previousClose: number;
  currentPrice: number;
  earningsdate: string;
  message: string;
  AnnualRate: number;
  buy_date: string;
  dividend: number;
  dividenddate: string;
  quotetype: string;
  date: string;
  insight: string;
  hist: string;
  'Ex-Dividend': string;
  payoutdate: string;
  amount?: number; // Make amount optional
  yieldRange: string;
}

export interface Holiday {
  name: string;
  date: string;
  isHoliday: boolean;
}
