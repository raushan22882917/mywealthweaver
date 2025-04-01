
import Papa from 'papaparse';

export function parseCSV<T = any>(csvText: string, options?: Papa.ParseConfig): T[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    ...options
  });
  
  return result.data as T[];
}

export async function fetchAndParseCSV<T = any>(url: string, options?: Papa.ParseConfig): Promise<T[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCSV<T>(csvText, options);
  } catch (error) {
    console.error('Error fetching and parsing CSV:', error);
    return [];
  }
}
