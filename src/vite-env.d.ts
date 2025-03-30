/// <reference types="vite/client" />

declare module '*.csv' {
  const content: Array<{
    'EPS Estimate': string;
    'Reported EPS': string;
    'Surprise(%)': string;
    stock: string;
    report_date: string;
    Earnings_Date: string;
    day: string;
  }>;
  export default content;
}