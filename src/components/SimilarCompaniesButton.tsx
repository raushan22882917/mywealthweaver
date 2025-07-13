import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

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

interface SimilarCompaniesButtonProps {
  stock: Stock;
}

const SimilarCompaniesButton: React.FC<SimilarCompaniesButtonProps> = ({ stock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [similarCompanies, setSimilarCompanies] = useState<SimilarCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [csvLogos, setCsvLogos] = useState<Map<string, string>>(new Map());
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

          const formattedData: SimilarCompany[] = similarData.map(company => {
            const symbolUpper = company.similar_symbol?.toUpperCase();
            // Try to get logo from database first, then from CSV
            let logoUrl = logoMap.get(symbolUpper) || 
                         csvLogos.get(symbolUpper) || 
                         '/stock.avif';
            
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
              dividend_yield: company.dividend_yield || 'N/A',
              risks: company.risks || 'N/A',
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
                                {company.risks && company.risks.length > 20 
                                  ? company.risks.substring(0, 20) + '...' 
                                  : company.risks || 'Low'
                                }
                              </span>
                            </div>
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
                                onClick={() => {
                                  toast({
                                    title: "Comparison",
                                    description: `Comparing ${stock.Symbol} with ${company.similar_symbol}`,
                                  });
                                }}
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
    </>
  );
};

export default SimilarCompaniesButton; 