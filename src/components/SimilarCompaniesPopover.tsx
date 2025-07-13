import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle } from "lucide-react";
import { fetchSimilarCompanies, SimilarCompanyWithLogo } from "@/services/similarCompaniesService";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

interface SimilarCompaniesPopoverProps {
  setIsOpen: (open: boolean) => void;
  stock: Stock;
}

const SimilarCompaniesPopover: React.FC<SimilarCompaniesPopoverProps> = ({ setIsOpen, stock }) => {
  const [similarCompanies, setSimilarCompanies] = useState<SimilarCompanyWithLogo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSimilarCompanies = async () => {
      if (!stock.Symbol) return;
      
      setIsLoading(true);
      try {
        const data = await fetchSimilarCompanies(stock.Symbol);
        setSimilarCompanies(data);
      } catch (error) {
        console.error('Error fetching similar companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarCompanies();
  }, [stock.Symbol]);

  if (isLoading) {
    return (
      <div className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
        Loading similar companies...
      </div>
    );
  }

  if (similarCompanies.length === 0) {
    return (
      <div className="text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
        No similar companies found
      </div>
    );
  }

  return (
    <>
      <div className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">Similar Companies</div>
      <Popover>
        <PopoverContent className="w-96 p-4 text-sm rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Symbol Company</th>
                  <th className="px-3 py-2 text-left font-medium">Revenue 2025</th>
                  <th className="px-3 py-2 text-right font-medium">Dividend Yield</th>
                  <th className="px-3 py-2 text-right font-medium">Risks</th>
                </tr>
              </thead>
              <tbody>
                {similarCompanies.slice(0, 5).map((company) => (
                  <tr
                    key={company.similar_symbol}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => {
                        const newStock = {
                          Symbol: company.similar_symbol,
                          title: company.similar_company || company.similar_symbol,
                          cik_str: '',
                          LogoURL: company.LogoURL
                        };
                        const event = new CustomEvent('openStockDetails', { detail: newStock });
                        window.dispatchEvent(event);
                      }, 300);
                    }}
                  >
                    <td className="px-3 py-2 font-medium text-blue-600 dark:text-blue-400">
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded-md"
                      >
                        <div
                          className="w-5 h-5 bg-center bg-no-repeat bg-contain rounded border border-red-500 flex-shrink-0 animate-pulse-border"
                          style={{
                            backgroundImage: `url(${company.LogoURL || "/stock.avif"})`
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{company.similar_symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {company.revenue_2025 || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-medium ${parseFloat(company.dividend_yield || '0') > 3 ? 'text-green-500' : 'text-blue-500'}`}>
                        {company.dividend_yield || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-gray-500 truncate max-w-[60px] overflow-hidden">
                          {company.risks ? (company.risks.length > 10 ? company.risks.substring(0, 10) + '...' : company.risks) : 'N/A'}
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded-full border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={e => e.stopPropagation()}
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-72 p-3 text-sm rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                            onPointerDownOutside={e => e.preventDefault()}
                          >
                            <p className="font-semibold text-red-500 mb-1">Risk Factors</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {company.risks || 'No risk information available'}
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Click on any company to open its details in a new dialog. Click the risk icon <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-red-100 text-red-500"><AlertTriangle className="w-2 h-2" /></span> to view risk information.
          </p>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default SimilarCompaniesPopover; 