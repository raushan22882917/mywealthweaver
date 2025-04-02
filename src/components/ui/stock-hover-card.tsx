
import React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { TrendingUp, TrendingDown, CalendarDays, DollarSign, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { DividendData } from "@/utils/dividend";

interface StockHoverCardProps {
  stock: DividendData;
  children: React.ReactNode;
}

const StockHoverCard = ({ stock, children }: StockHoverCardProps) => {
  const priceChange = stock.currentPrice - stock.previousClose;
  const priceChangePercent = (priceChange / stock.previousClose) * 100;
  const isPriceUp = priceChange >= 0;

  return (
    <HoverCard openDelay={0} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div>{children}</div>
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-80 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 shadow-xl p-0 rounded-xl animate-fade-in"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {stock.logo && (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                  <img 
                    src={stock.logo} 
                    alt={stock.Symbol} 
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/stock.avif';
                    }}
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold text-white">{stock.Symbol}</h3>
                <p className="text-xs text-gray-400">{stock.title || stock.companyName || "Company"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">${stock.currentPrice.toFixed(2)}</p>
              <p className={`text-xs ${isPriceUp ? 'text-green-400' : 'text-red-400'} flex items-center justify-end gap-1`}>
                {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800/70 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Dividend Yield</p>
              <p className="text-green-400 font-medium">{(stock.dividendYield * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-gray-800/70 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Annual Rate</p>
              <p className="text-blue-400 font-medium">${stock.AnnualRate?.toFixed(2) || "N/A"}</p>
            </div>
            <div className="bg-gray-800/70 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Ex-Dividend</p>
              <p className="text-purple-400 font-medium">
                {stock.ExDividendDate ? format(new Date(stock.ExDividendDate), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/70 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Payout Ratio</p>
              <p className="text-amber-400 font-medium">{(stock.payoutRatio * 100).toFixed(2)}%</p>
            </div>
          </div>
          
          {stock.message && (
            <div className="mt-3 text-xs text-gray-300 bg-blue-900/20 border border-blue-500/20 rounded-lg p-2 flex items-start">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 mr-1.5 flex-shrink-0 mt-0.5" />
              <p>{stock.message}</p>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
            <div className="flex items-center">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              <span>Dividend: {stock.DividendDate ? format(new Date(stock.DividendDate), 'MMM d, yyyy') : 'N/A'}</span>
            </div>
            <div className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <span className="mr-1">Details</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default StockHoverCard;
