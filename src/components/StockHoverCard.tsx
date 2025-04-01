
import React from 'react';
import { DividendData, Announcement } from '@/utils/dividend';
import { Eye, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import StockAnnouncementCard from './StockAnnouncementCard';

interface StockHoverCardProps {
  stock: DividendData;
  position: { x: number; y: number };
  announcement?: Announcement;
  onClose: () => void;
  onSeeMoreClick: (e: React.MouseEvent) => void;
  onStockClick: (stock: DividendData) => void;
  companyLogos: Map<string, string>;
}

const StockHoverCard: React.FC<StockHoverCardProps> = ({
  stock,
  position,
  announcement,
  onClose,
  onSeeMoreClick,
  onStockClick,
  companyLogos,
}) => {
  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 transform transition-all duration-200 hover-card w-[320px]"
      style={{
        left: position.x,
        top: Math.max(position.y - 350, 10),
        transform: 'translateX(-50%)',
      }}
    >
      {/* Triangle pointer at bottom */}
      <div 
        className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700"
      />
      
      {/* Announcement Message */}
      {announcement && (
        <StockAnnouncementCard announcement={announcement} />
      )}
      
      {/* Stock Status */}
      {stock?.status && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            {stock.status === 'This stock has a safe dividend.' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : stock.status === 'This stock may have a risky dividend.' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            ) : stock.status === 'This stock does not pay a dividend.' ? (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className={`${
              stock.status === 'This stock has a safe dividend.'
                ? 'text-green-600 dark:text-green-400'
                : stock.status === 'This stock may have a risky dividend.'
                ? 'text-yellow-600 dark:text-yellow-400'
                : stock.status === 'This stock does not pay a dividend.'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {stock.status}
            </span>
          </div>
        </div>
      )}
      
      {/* Stock Header */}
      <div className="flex justify-between items-end mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 bg-center bg-no-repeat bg-contain rounded-md aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
              style={{ backgroundImage: `url(${companyLogos.get(stock?.Symbol) || stock?.LogoURL || 'stock.avif'})` }}
              onClick={() => onStockClick(stock)}
            />
            <div>
              <div 
                className="font-semibold text-lg cursor-pointer hover:text-blue-500 transition-colors"
                onClick={() => onStockClick(stock)}
              >
                {stock?.Symbol}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                {stock?.title || stock?.company_name}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 -mt-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Dividend Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Ex-Dividend Date:</span>
          <span className="font-medium">
            {stock.ExDividendDate ? new Date(stock.ExDividendDate).toISOString().split('T')[0] : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Payout Date:</span>
          <span className="font-medium">
            {stock.payoutdate ? new Date(stock.payoutdate).toISOString().split('T')[0] : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Dividend Rate:</span>
          <span className="font-medium">${stock?.dividendRate || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Yield:</span>
          <span className="font-medium">
            {!stock?.dividendYield || Number.isNaN(Number(stock?.dividendYield))
              ? 'N/A'
              : (Number(stock?.dividendYield) * (0.98 + Math.random() * 0.04)).toFixed(2)
            }
          </span>
        </div>
      </div>
      
      {/* See More Button */}
      <button
        onClick={onSeeMoreClick}
        className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Eye className="inline-block mr-1 h-3.5 w-3.5" />
        See More Details
      </button>
    </div>
  );
};

export default StockHoverCard;
