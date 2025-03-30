export interface DividendHistoryData {
  date: string;
  dividends: number;
}

export const filterDividendData = (data: DividendHistoryData[], range: string) => {
  if (!data || data.length === 0) return [];
  if (range === 'MAX') return data;

  const currentYear = new Date().getFullYear();
  const yearsToShow = parseInt(range);
  const startYear = currentYear - yearsToShow;

  return data.filter(item => {
    const itemYear = parseInt(item.date);
    return itemYear >= startYear;
  });
};
