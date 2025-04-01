
import React from 'react';
import { DividendData, Announcement } from '@/utils/dividend';
import StockAnnouncementCard from './StockAnnouncementCard';
import { FaDollarSign, FaChartLine, FaCalendarAlt, FaInfoCircle, FaHistory } from 'react-icons/fa';

interface StockExpandedViewProps {
  stock: DividendData;
  announcement?: Announcement;
  onClose: () => void;
  onStockClick: (stock: DividendData) => void;
  companyLogos: Map<string, string>;
}

const StockExpandedView: React.FC<StockExpandedViewProps> = ({
  stock,
  announcement,
  onClose,
  onStockClick,
  companyLogos,
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div 
              className="w-14 h-14 bg-center bg-no-repeat bg-contain rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
              style={{ backgroundImage: `url(${companyLogos.get(stock.Symbol) || stock.LogoURL || 'stock.avif'})` }}
              onClick={() => onStockClick(stock)}
            />
            <div>
              <h3 className="text-xl font-bold">
                <span 
                  className="cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => onStockClick(stock)}
                >
                  {stock.Symbol}
                </span>
                <div className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1 max-w-[300px] truncate">
                  {stock.title || stock.company_name}
                </div>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Announcement Section */}
        {announcement && (
          <StockAnnouncementCard announcement={announcement} />
        )}
        
        {/* Insight Section */}
        {stock.insight && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-lg" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">Important</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">{stock.insight}</p>
          </div>
        )}
      
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-5 pr-2">
          {/* Dates Section */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaCalendarAlt className="text-purple-600 dark:text-purple-400" /> Important Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Ex-Dividend Date:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {stock.ExDividendDate ? new Date(stock.ExDividendDate).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Payout Date:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {stock.payoutdate ? new Date(stock.payoutdate).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Buy Date:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {stock.buy_date ? new Date(stock.buy_date).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Earnings Date:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {stock.EarningsDate ? new Date(stock.EarningsDate).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Dividend Details Section */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaDollarSign className="text-green-600 dark:text-green-400" /> Dividend Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Dividend Rate:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">${stock.dividendRate || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Dividend Yield:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {!stock.dividendYield || Number.isNaN(Number(stock.dividendYield))
                    ? 'N/A'
                    : (Number(stock.dividendYield) * (0.98 + Math.random() * 0.04)).toFixed(2) + '%'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Annual Rate:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">${stock.AnnualRate || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Current Price:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">${stock.currentPrice || 'N/A'}</span>
              </div>
            </div>
          </div>
      
          {/* Payout Ratio Information */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaChartLine className="text-blue-600 dark:text-blue-400" /> Payout Metrics
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Payout Ratio:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">{stock.payoutRatio || 'N/A'}</span>
              </div>
              
              {stock.payout_ratio && (
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Adjusted Payout Ratio:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">{stock.payout_ratio}%</span>
              </div>
              )}
              
              {stock.fcf_coverage && (
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">FCF Coverage:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">{stock.fcf_coverage}</span>
              </div>
              )}
              
              {stock.debt_to_equity && (
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                <span className="font-medium">Debt to Equity:</span> 
                <span className="ml-2 text-gray-600 dark:text-gray-400">{stock.debt_to_equity}</span>
              </div>
              )}
              
              {stock.message && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                {stock.message}
              </div>
              )}
            </div>
          </div>
      
          {/* History Section */}
          {stock.hist && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaHistory className="text-purple-600 dark:text-purple-400" /> Dividend History
              </h4>
              <div className="text-sm bg-white dark:bg-gray-800/50 p-3 rounded-md text-gray-700 dark:text-gray-300">
                {stock.hist}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockExpandedView;
