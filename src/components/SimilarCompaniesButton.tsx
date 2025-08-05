import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Users, TrendingUp, BarChart3, DollarSign, Percent, Activity, Target, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

interface SimilarCompany {
  symbol: string;
  similar_symbol: string;
  similar_company: string;
  revenue_2025: string;
  LogoURL: string;
  dividend_yield?: string;
  risks?: string;
  as_of_date?: string;
}

interface LogoData {
  Symbol: string;
  LogoURL: string;
}

interface CsvLogoData {
  id: string;
  Symbol: string;
  company_name: string;
  domain: string;
  LogoURL: string;
}

interface ComparisonData {
  symbol1: {
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    trailing_pe_ratio?: number;
    forward_pe_ratio?: number;
    ps_ratio?: number;
    annual_revenue_growth_percent?: number;
    net_income_margin_percent?: number;
    upside_percentage?: number;
    cash_position?: number;
    debt_status?: number;
    employees?: number;
    founded?: number;
    sector?: string;
    industry?: string;
    average_analyst_rating?: string;
    average_price_target?: number;
    short_ratio?: number;
    dividend_yield?: number;
  };
  symbol2: {
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    trailing_pe_ratio?: number;
    forward_pe_ratio?: number;
    ps_ratio?: number;
    annual_revenue_growth_percent?: number;
    net_income_margin_percent?: number;
    upside_percentage?: number;
    cash_position?: number;
    debt_status?: number;
    employees?: number;
    founded?: number;
    sector?: string;
    industry?: string;
    average_analyst_rating?: string;
    average_price_target?: number;
    short_ratio?: number;
    dividend_yield?: number;
  };
  comparison: {
    priceDifference: number;
    priceDifferencePercent: number;
    marketCapDifference: number;
    marketCapDifferencePercent: number;
    peRatioDifference: number;
  };
  comparison_insights?: string;
  timestamp?: string;
}

interface SimilarCompaniesButtonProps {
  stock: Stock;
}

const SimilarCompaniesButton: React.FC<SimilarCompaniesButtonProps> = ({ stock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [similarCompanies, setSimilarCompanies] = useState<SimilarCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [csvLogos, setCsvLogos] = useState<Map<string, string>>(new Map());
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<SimilarCompany | null>(null);
  const [dividendData, setDividendData] = useState<any[]>([]);
  const { toast } = useToast();

  // Function to fetch logos from CSV file
  const fetchLogosFromCSV = async () => {
    try {
      const response = await fetch('/logos.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results: Papa.ParseResult<CsvLogoData>) => {
          const logoMap = new Map<string, string>();
          results.data.forEach((row) => {
            if (row.Symbol && row.LogoURL) {
              logoMap.set(row.Symbol.toUpperCase(), row.LogoURL);
            }
          });
          console.log('Loaded logos from CSV:', logoMap.size, 'entries');
          console.log('Sample logos:', Array.from(logoMap.entries()).slice(0, 5));
          setCsvLogos(logoMap);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  };

  useEffect(() => {
    // Fetch logos from CSV on component mount
    fetchLogosFromCSV();
  }, []);

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      if (!stock?.Symbol) return;

      setIsLoading(true);
      try {
        // Ensure CSV logos are loaded
        if (csvLogos.size === 0) {
          console.log('CSV logos not loaded, fetching now...');
          await fetchLogosFromCSV();
          // Small delay to ensure CSV parsing is complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Fetch similar companies based on stock symbol
        const { data: similarData, error: similarError } = await supabase
          .from('similar_companies')
          .select('*')
          .eq('symbol', stock.Symbol);

        if (similarError) {
          toast({
            title: "Error fetching similar companies",
            description: similarError.message,
            variant: "destructive",
          });
          return;
        }

        if (similarData && similarData.length > 0) {
          // Fetch logos for similar companies
          const symbols = similarData.map(item => item.similar_symbol);
          const { data: logoData, error: logoError } = await supabase
            .from('company_logos')
            .select('Symbol, LogoURL')
            .in('Symbol', symbols);

          if (logoError) {
            console.error('Error fetching logos:', logoError);
          }

          // Create a map of symbols to logos
          const logoMap = new Map();
          if (logoData) {
            logoData.forEach((logo: LogoData) => {
              logoMap.set(logo.Symbol.toUpperCase(), logo.LogoURL);
            });
          }

          // Fetch company names for similar symbols
          const { data: companyData, error: companyError } = await supabase
            .from('company_profiles')
            .select('symbol, company_name')
            .in('symbol', symbols);

          // Create a map of symbols to company names
          const companyNameMap = new Map();
          if (companyData && !companyError) {
            companyData.forEach((company: any) => {
              companyNameMap.set(company.symbol.toUpperCase(), company.company_name);
            });
          } else if (companyError) {
            console.error('Error fetching company names:', companyError);
          }

          // Fetch dividend yield data from dividendsymbol table for each similar company
          const { data: dividendData, error: dividendError } = await supabase
            .from('dividendsymbol')
            .select('symbol, dividendyield, currentprice, dividendrate, payoutratio, exdividenddate, payoutdate')
            .in('symbol', symbols);

          if (dividendError) {
            console.error('Error fetching dividend data:', dividendError);
          }

          // Store dividend data in state for display
          setDividendData(dividendData || []);

          // Create a map of symbols to dividend yields
          const dividendMap = new Map();
          if (dividendData) {
            dividendData.forEach((dividend: any) => {
              if (dividend.symbol && dividend.dividendyield !== null) {
                dividendMap.set(dividend.symbol.toUpperCase(), dividend.dividendyield);
              }
            });
          }

          // Debug: Log the actual dividendsymbol data
          console.log('Real dividendsymbol data for similar companies:', dividendData);

          const formattedData: SimilarCompany[] = similarData.map(company => {
            const symbolUpper = company.similar_symbol?.toUpperCase();
            // Try to get logo from database first, then from CSV
            let logoUrl = logoMap.get(symbolUpper) || 
                         csvLogos.get(symbolUpper) || 
                         '/stock.avif';
            
            // Get dividend yield from dividendsymbol table, fallback to similar_companies data
            const dividendYield = dividendMap.get(symbolUpper);
            const dividendYieldDisplay = dividendYield !== undefined && dividendYield !== null 
              ? `${dividendYield.toFixed(2)}%` 
              : company.dividend_yield || 'N/A';
            
            // Debug logging for logo resolution
            if (symbolUpper) {
              console.log(`Logo for ${symbolUpper}:`, {
                fromDB: logoMap.get(symbolUpper),
                fromCSV: csvLogos.get(symbolUpper),
                final: logoUrl
              });
            }
            
            return {
              symbol: company.symbol,
              similar_symbol: company.similar_symbol,
              similar_company: companyNameMap.get(symbolUpper) || company.similar_symbol,
              revenue_2025: company.revenue_2025 || 'N/A',
              dividend_yield: dividendYieldDisplay,
              risks: company.risks || 'N/A',
              as_of_date: company.as_of_date || 'N/A',
              LogoURL: logoUrl
            };
          });
          setSimilarCompanies(formattedData);
        } else {
          console.log('No similar companies found for', stock.Symbol);
          setSimilarCompanies([]);
        }
      } catch (error) {
        console.error('Error in fetchSimilarCompanies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch similar companies",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSimilarCompanies();
    }
  }, [stock?.Symbol, isOpen, toast, csvLogos]);

  const handleOpenSimilarCompany = (company: SimilarCompany) => {
    // Close current dialog
    setIsOpen(false);

    // Wait for dialog to close, then open new one
    setTimeout(() => {
      // Create a new stock object for the similar company
      const newStock = {
        Symbol: company.similar_symbol,
        title: company.similar_company || company.similar_symbol,
        cik_str: '',
        LogoURL: company.LogoURL
      };
      // Open a new dialog for this stock
      const event = new CustomEvent('openStockDetails', { detail: newStock });
      window.dispatchEvent(event);
    }, 300);
  };

  const fetchStockDataForComparison = async (symbol: string) => {
    try {
      // Try backend API first
      try {
        const response = await fetch(`/api/stocks/${symbol}`);
        if (response.ok) {
          const data = await response.json();
          return {
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            marketCap: data.market_capitalization,
            trailing_pe_ratio: data.trailing_pe_ratio,
            forward_pe_ratio: data.forward_pe_ratio,
            ps_ratio: data.ps_ratio,
            annual_revenue_growth_percent: data.annual_revenue_growth_percent,
            net_income_margin_percent: data.net_income_margin_percent,
            upside_percentage: data.upside_percentage,
            cash_position: data.cash_position,
            debt_status: data.debt_status,
            employees: data.employees,
            founded: data.founded,
            sector: data.sector,
            industry: data.industry,
            average_analyst_rating: data.average_analyst_rating,
            average_price_target: data.average_price_target,
            short_ratio: data.short_ratio,
          };
        }
      } catch (error) {
        console.log('Backend API not available, using Supabase fallback');
      }

      // Fallback to Supabase
      const { data: comparisonData, error: comparisonError } = await supabase
        .from('similar_companies')
        .select('*')
        .eq('similar_symbol', symbol.toUpperCase())
        .order('as_of_date', { ascending: false })
        .limit(1)
        .single();

      if (comparisonError && comparisonError.code !== 'PGRST116') {
        console.error('Error fetching from stock_comparison:', comparisonError);
      }

      // Fetch dividend yield data from dividendsymbol table
      const { data: dividendData, error: dividendError } = await supabase
        .from('dividendsymbol')
        .select('symbol, dividendyield, currentprice')
        .eq('symbol', symbol.toUpperCase())
        .order('as_of_date', { ascending: false })
        .limit(1)
        .single();

      if (dividendError && dividendError.code !== 'PGRST116') {
        console.error('Error fetching from dividendsymbol:', dividendError);
      }

      const comparisonDataAny = comparisonData as any;
      const dividendDataAny = dividendData as any;
      
      return {
        symbol: symbol.toUpperCase(),
        name: comparisonDataAny?.similar_company || symbol.toUpperCase(),
        price: dividendDataAny?.currentprice || 0,
        marketCap: 0, // Not available in similar_companies table
        trailing_pe_ratio: 0, // Not available in similar_companies table
        forward_pe_ratio: 0, // Not available in similar_companies table
        ps_ratio: 0, // Not available in similar_companies table
        annual_revenue_growth_percent: 0, // Not available in similar_companies table
        net_income_margin_percent: 0, // Not available in similar_companies table
        upside_percentage: 0, // Not available in similar_companies table
        cash_position: 0, // Not available in similar_companies table
        debt_status: 0, // Not available in similar_companies table
        employees: 0, // Not available in similar_companies table
        founded: 0, // Not available in similar_companies table
        sector: 'N/A', // Not available in similar_companies table
        industry: 'N/A', // Not available in similar_companies table
        average_analyst_rating: 'N/A', // Not available in similar_companies table
        average_price_target: 0, // Not available in similar_companies table
        short_ratio: 0, // Not available in similar_companies table
        dividend_yield: dividendDataAny?.dividendyield,
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        marketCap: 0,
        trailing_pe_ratio: 0,
        forward_pe_ratio: 0,
        ps_ratio: 0,
        annual_revenue_growth_percent: 0,
        net_income_margin_percent: 0,
        upside_percentage: 0,
        cash_position: 0,
        debt_status: 0,
        employees: 0,
        founded: 0,
        sector: 'N/A',
        industry: 'N/A',
        average_analyst_rating: 'N/A',
        average_price_target: 0,
        short_ratio: 0,
        dividend_yield: 0,
      };
    }
  };

  const generateComparisonInsights = (stock1: any, stock2: any): string => {
    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(0)}T`;
      if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(0)}B`;
      if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(0)}M`;
      return `$${marketCap.toLocaleString()}`;
    };

    const insights = `📊 Company Comparison: ${stock1.name} vs ${stock2.name}

📈 Growth Analysis
${stock1.name} shows ${stock1.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}% annual revenue growth vs ${stock2.name}'s ${stock2.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%.

💰 Profitability
${stock1.name} has a net income margin of ${stock1.net_income_margin_percent?.toFixed(1) || 'N/A'}% vs ${stock2.name}'s ${stock2.net_income_margin_percent?.toFixed(1) || 'N/A'}%.

💹 Valuation
${stock1.name} trades at $${stock1.price?.toFixed(1) || 'N/A'} (P/E: ${stock1.trailing_pe_ratio?.toFixed(1) || 'N/A'}) vs ${stock2.name} at $${stock2.price?.toFixed(1) || 'N/A'} (P/E: ${stock2.trailing_pe_ratio?.toFixed(1) || 'N/A'}).

📊 Dividend Analysis
${stock1.name} offers a dividend yield of ${stock1.dividend_yield?.toFixed(2) || 'N/A'}% vs ${stock2.name}'s ${stock2.dividend_yield?.toFixed(2) || 'N/A'}%.
${stock1.dividend_yield && stock2.dividend_yield ? 
  (stock1.dividend_yield > stock2.dividend_yield ? 
    `${stock1.name} provides higher dividend income` : `${stock2.name} provides higher dividend income`) : ''}

🧠 Analyst Outlook
${stock1.name} is rated ${stock1.average_analyst_rating || 'N/A'} with ${stock1.upside_percentage?.toFixed(1) || 'N/A'}% upside potential.
${stock2.name} is rated ${stock2.average_analyst_rating || 'N/A'} with ${stock2.upside_percentage?.toFixed(1) || 'N/A'}% upside potential.

✅ Key Takeaways
${stock1.annual_revenue_growth_percent && stock2.annual_revenue_growth_percent ? 
  (stock1.annual_revenue_growth_percent > stock2.annual_revenue_growth_percent ? 
    `${stock1.name} leads in growth` : `${stock2.name} leads in growth`) : ''}
${stock1.trailing_pe_ratio && stock2.trailing_pe_ratio ? 
  (stock1.trailing_pe_ratio < stock2.trailing_pe_ratio ? 
    `${stock1.name} appears better valued` : `${stock2.name} appears better valued`) : ''}
${stock1.dividend_yield && stock2.dividend_yield ? 
  (stock1.dividend_yield > stock2.dividend_yield ? 
    `${stock1.name} offers better dividend yield` : `${stock2.name} offers better dividend yield`) : ''}`;

    return insights;
  };

  const handleCompare = async (company: SimilarCompany) => {
    setSelectedCompany(company);
    setComparisonDialogOpen(true);
    setComparisonLoading(true);

    try {
      const [stock1Data, stock2Data] = await Promise.all([
        fetchStockDataForComparison(stock.Symbol),
        fetchStockDataForComparison(company.similar_symbol),
      ]);

      const priceDifference = stock2Data.price - stock1Data.price;
      const priceDifferencePercent = ((priceDifference / stock1Data.price) * 100);
      const marketCapDifference = stock2Data.marketCap - stock1Data.marketCap;
      const marketCapDifferencePercent = ((marketCapDifference / stock1Data.marketCap) * 100);
      const peRatioDifference = (stock2Data.trailing_pe_ratio || 0) - (stock1Data.trailing_pe_ratio || 0);

      // Generate comparison insights
      const comparisonInsights = generateComparisonInsights(stock1Data, stock2Data);

      setComparisonData({
        symbol1: stock1Data,
        symbol2: stock2Data,
        comparison: {
          priceDifference,
          priceDifferencePercent,
          marketCapDifference,
          marketCapDifferencePercent,
          peRatioDifference,
        },
        comparison_insights: comparisonInsights,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Comparison Complete",
        description: `Successfully compared ${stock.Symbol} and ${company.similar_symbol}`,
      });

    } catch (error) {
      console.error('Error comparing stocks:', error);
      toast({
        title: "Error",
        description: "Failed to compare stocks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setComparisonLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Similar Companies</span>
        <TrendingUp className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              
              <div>
                <div className="text-lg font-semibold">Similar Companies to {stock.Symbol}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">Loading similar companies...</span>
                </div>
              </div>
            ) : similarCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No similar companies found for {stock.Symbol}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="text-sm text-gray-600 mb-2">
                  Found {similarCompanies.length} similar companies based on industry and sector analysis
                </div>
                
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Company</th>
                        <th className="px-4 py-3 text-left font-medium">Revenue 2025</th>
                        <th className="px-4 py-3 text-center font-medium">Dividend Yield</th>
                        <th className="px-4 py-3 text-center font-medium">Risk Level</th>
                        <th className="px-4 py-3 text-center font-medium">As of Date</th>
                        <th className="px-4 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {similarCompanies.map((company, index) => (
                        <tr
                          key={company.similar_symbol}
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 flex-shrink-0 overflow-hidden">
                                <img
                                  src={company.LogoURL || '/stock.avif'}
                                  alt={`${company.similar_symbol} logo`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/stock.avif';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-blue-600 dark:text-blue-400">
                                  {company.similar_symbol}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {company.similar_company}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {company.revenue_2025}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                              parseFloat(company.dividend_yield || '0') > 3 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {company.dividend_yield || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {company.risks || 'Low'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {company.as_of_date}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenSimilarCompany(company)}
                                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompare(company)}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                              >
                                Compare
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">About Similar Companies</p>
                      <p>
                        These companies are selected based on industry sector, market capitalization, 
                        and dividend characteristics similar to {stock.Symbol}. Click "View Details" 
                        to open a detailed analysis of any company, or "Compare" to analyze both companies side by side.
                      </p>
                    </div>
                  </div>
                </div>

             
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">
                  {comparisonLoading ? 'Loading Comparison...' : 
                   `Comparing ${stock.Symbol} vs ${selectedCompany?.similar_symbol}`}
                </div>
                <div className="text-sm text-gray-500">
                  Detailed financial analysis and comparison
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {comparisonLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-gray-600">Analyzing companies...</span>
                </div>
              </div>
            ) : comparisonData ? (
              <>
                {/* Key Metrics Overview */}
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Key Metrics Comparison</span>
                    </CardTitle>
                    <CardDescription>
                      Essential financial metrics side by side
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                          <Badge variant="outline" className="text-xs">
                            {comparisonData.comparison.priceDifference > 0 ? '+' : ''}
                            {formatCurrency(comparisonData.comparison.priceDifference)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol1.symbol}</span>
                            <span className="font-medium">{formatCurrency(comparisonData.symbol1.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol2.symbol}</span>
                            <span className="font-medium">{formatCurrency(comparisonData.symbol2.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                          <Badge variant="outline" className="text-xs">
                            {comparisonData.comparison.marketCapDifference > 0 ? '+' : ''}
                            {formatNumber(comparisonData.comparison.marketCapDifference)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol1.symbol}</span>
                            <span className="font-medium">{formatNumber(comparisonData.symbol1.marketCap)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol2.symbol}</span>
                            <span className="font-medium">{formatNumber(comparisonData.symbol2.marketCap)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                          <Badge variant="outline" className="text-xs">
                            {comparisonData.comparison.peRatioDifference > 0 ? '+' : ''}
                            {comparisonData.comparison.peRatioDifference.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol1.symbol}</span>
                            <span className="font-medium">{comparisonData.symbol1.trailing_pe_ratio?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol2.symbol}</span>
                            <span className="font-medium">{comparisonData.symbol2.trailing_pe_ratio?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</span>
                          <Badge variant="outline" className="text-xs">
                            {comparisonData.symbol1.annual_revenue_growth_percent && comparisonData.symbol2.annual_revenue_growth_percent ? 
                              (comparisonData.symbol1.annual_revenue_growth_percent > comparisonData.symbol2.annual_revenue_growth_percent ? 
                                `${comparisonData.symbol1.symbol} leads` : `${comparisonData.symbol2.symbol} leads`) : 'N/A'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol1.symbol}</span>
                            <span className={`font-medium ${comparisonData.symbol1.annual_revenue_growth_percent && comparisonData.symbol1.annual_revenue_growth_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {comparisonData.symbol1.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol2.symbol}</span>
                            <span className={`font-medium ${comparisonData.symbol2.annual_revenue_growth_percent && comparisonData.symbol2.annual_revenue_growth_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {comparisonData.symbol2.annual_revenue_growth_percent?.toFixed(1) || 'N/A'}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield</span>
                          <Badge variant="outline" className="text-xs">
                            {comparisonData.symbol1.dividend_yield && comparisonData.symbol2.dividend_yield ? 
                              (comparisonData.symbol1.dividend_yield > comparisonData.symbol2.dividend_yield ? 
                                `${comparisonData.symbol1.symbol} higher` : `${comparisonData.symbol2.symbol} higher`) : 'N/A'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol1.symbol}</span>
                            <span className={`font-medium ${comparisonData.symbol1.dividend_yield && comparisonData.symbol1.dividend_yield > 3 ? 'text-green-600' : 'text-blue-600'}`}>
                              {comparisonData.symbol1.dividend_yield?.toFixed(2) || 'N/A'}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{comparisonData.symbol2.symbol}</span>
                            <span className={`font-medium ${comparisonData.symbol2.dividend_yield && comparisonData.symbol2.dividend_yield > 3 ? 'text-green-600' : 'text-blue-600'}`}>
                              {comparisonData.symbol2.dividend_yield?.toFixed(2) || 'N/A'}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Company Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5" />
                        <span>{comparisonData.symbol1.symbol} - {comparisonData.symbol1.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sector</span>
                          <span>{comparisonData.symbol1.sector || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Industry</span>
                          <span>{comparisonData.symbol1.industry || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Founded</span>
                          <span>{comparisonData.symbol1.founded || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Employees</span>
                          <span>{comparisonData.symbol1.employees?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Analyst Rating</span>
                          <span>{comparisonData.symbol1.average_analyst_rating || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Price Target</span>
                          <span>{comparisonData.symbol1.average_price_target ? formatCurrency(comparisonData.symbol1.average_price_target) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Upside Potential</span>
                          <span className={comparisonData.symbol1.upside_percentage && comparisonData.symbol1.upside_percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                            {comparisonData.symbol1.upside_percentage?.toFixed(1) || 'N/A'}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5" />
                        <span>{comparisonData.symbol2.symbol} - {comparisonData.symbol2.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sector</span>
                          <span>{comparisonData.symbol2.sector || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Industry</span>
                          <span>{comparisonData.symbol2.industry || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Founded</span>
                          <span>{comparisonData.symbol2.founded || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Employees</span>
                          <span>{comparisonData.symbol2.employees?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Analyst Rating</span>
                          <span>{comparisonData.symbol2.average_analyst_rating || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Price Target</span>
                          <span>{comparisonData.symbol2.average_price_target ? formatCurrency(comparisonData.symbol2.average_price_target) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Upside Potential</span>
                          <span className={comparisonData.symbol2.upside_percentage && comparisonData.symbol2.upside_percentage > 0 ? 'text-green-600' : 'text-red-600'}>
                            {comparisonData.symbol2.upside_percentage?.toFixed(1) || 'N/A'}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Analysis Insights */}
                {comparisonData.comparison_insights && (
                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>AI Analysis & Insights</span>
                      </CardTitle>
                      <CardDescription>
                        Comprehensive analysis and investment recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {comparisonData.comparison_insights}
                        </div>
                        {comparisonData.timestamp && (
                          <div className="mt-4 text-xs text-gray-500">
                            Analysis generated on: {new Date(comparisonData.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimilarCompaniesButton; 