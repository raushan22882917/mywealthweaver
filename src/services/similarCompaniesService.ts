import { supabase } from '@/lib/supabase';

export interface SimilarCompany {
  id: number;
  symbol: string;
  revenue_2025: string;
  similar_symbol: string;
  dividend_yield: string;
  risks: string;
}

export interface CompanyLogo {
  id: string;
  Symbol: string;
  company_name: string;
  domain: string;
  LogoURL: string;
}

export interface SimilarCompanyWithLogo extends SimilarCompany {
  LogoURL?: string;
  similar_company?: string;
}

// Parse CSV data
const parseCSV = (csvText: string): CompanyLogo[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      id: values[0],
      Symbol: values[1],
      company_name: values[2],
      domain: values[3],
      LogoURL: values[4]
    };
  }).filter(logo => logo.Symbol && logo.LogoURL);
  return data;
};

// Fetch similar companies from database
export const fetchSimilarCompanies = async (symbol: string): Promise<SimilarCompanyWithLogo[]> => {
  try {
    // Fetch similar companies from the database
    const { data: similarCompanies, error } = await supabase
      .from('similar_companies')
      .select('*')
      .eq('symbol', symbol.toUpperCase());

    if (error) {
      console.error('Error fetching similar companies:', error);
      return [];
    }

    if (!similarCompanies || similarCompanies.length === 0) {
      console.log(`No similar companies found for symbol: ${symbol}`);
      return [];
    }

    // Fetch logos from CSV file
    const logosResponse = await fetch('/logos.csv');
    const logosText = await logosResponse.text();
    const logosData = parseCSV(logosText);

    // Create a map of symbols to logos
    const logoMap = new Map(
      logosData.map(logo => [logo.Symbol.toUpperCase(), logo.LogoURL])
    );

    // Combine similar companies data with logos
    const similarCompaniesWithLogos: SimilarCompanyWithLogo[] = similarCompanies.map(company => ({
      ...company,
      LogoURL: logoMap.get(company.similar_symbol?.toUpperCase()) || undefined,
      similar_company: logoMap.get(company.similar_symbol?.toUpperCase()) ? 
        logosData.find(logo => logo.Symbol.toUpperCase() === company.similar_symbol?.toUpperCase())?.company_name : 
        company.similar_symbol
    }));

    return similarCompaniesWithLogos;
  } catch (error) {
    console.error('Error in fetchSimilarCompanies:', error);
    return [];
  }
};

// Fetch all similar companies (for admin or overview purposes)
export const fetchAllSimilarCompanies = async (): Promise<SimilarCompanyWithLogo[]> => {
  try {
    // Fetch all similar companies from the database
    const { data: similarCompanies, error } = await supabase
      .from('similar_companies')
      .select('*')
      .order('symbol', { ascending: true });

    if (error) {
      console.error('Error fetching all similar companies:', error);
      return [];
    }

    if (!similarCompanies || similarCompanies.length === 0) {
      console.log('No similar companies found in database');
      return [];
    }

    // Fetch logos from CSV file
    const logosResponse = await fetch('/logos.csv');
    const logosText = await logosResponse.text();
    const logosData = parseCSV(logosText);

    // Create a map of symbols to logos
    const logoMap = new Map(
      logosData.map(logo => [logo.Symbol.toUpperCase(), logo.LogoURL])
    );

    // Combine similar companies data with logos
    const similarCompaniesWithLogos: SimilarCompanyWithLogo[] = similarCompanies.map(company => ({
      ...company,
      LogoURL: logoMap.get(company.similar_symbol?.toUpperCase()) || undefined,
      similar_company: logoMap.get(company.similar_symbol?.toUpperCase()) ? 
        logosData.find(logo => logo.Symbol.toUpperCase() === company.similar_symbol?.toUpperCase())?.company_name : 
        company.similar_symbol
    }));

    return similarCompaniesWithLogos;
  } catch (error) {
    console.error('Error in fetchAllSimilarCompanies:', error);
    return [];
  }
};

// Fetch company logo by symbol
export const fetchCompanyLogo = async (symbol: string): Promise<string | undefined> => {
  try {
    const logosResponse = await fetch('/logos.csv');
    const logosText = await logosResponse.text();
    const logosData = parseCSV(logosText);

    const logo = logosData.find(logo => logo.Symbol.toUpperCase() === symbol.toUpperCase());
    return logo?.LogoURL;
  } catch (error) {
    console.error('Error fetching company logo:', error);
    return undefined;
  }
};

// Fetch company name by symbol
export const fetchCompanyName = async (symbol: string): Promise<string | undefined> => {
  try {
    const logosResponse = await fetch('/logos.csv');
    const logosText = await logosResponse.text();
    const logosData = parseCSV(logosText);

    const logo = logosData.find(logo => logo.Symbol.toUpperCase() === symbol.toUpperCase());
    return logo?.company_name;
  } catch (error) {
    console.error('Error fetching company name:', error);
    return undefined;
  }
}; 

// Example usage function for other components
export const getSimilarCompaniesForSymbol = async (symbol: string) => {
  try {
    const similarCompanies = await fetchSimilarCompanies(symbol);
    console.log(`Found ${similarCompanies.length} similar companies for ${symbol}:`, similarCompanies);
    return similarCompanies;
  } catch (error) {
    console.error('Error getting similar companies:', error);
    return [];
  }
};

// Example: Get company logo and name for a symbol
export const getCompanyInfo = async (symbol: string) => {
  try {
    const [logo, name] = await Promise.all([
      fetchCompanyLogo(symbol),
      fetchCompanyName(symbol)
    ]);
    
    return {
      symbol: symbol.toUpperCase(),
      logo,
      name,
      hasLogo: !!logo,
      hasName: !!name
    };
  } catch (error) {
    console.error('Error getting company info:', error);
    return {
      symbol: symbol.toUpperCase(),
      logo: undefined,
      name: undefined,
      hasLogo: false,
      hasName: false
    };
  }
}; 