import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const allStocks = [
  { symbol: "AAPL", price: "187.32", change: "+1.2%" },
  { symbol: "MSFT", price: "376.17", change: "-0.5%" },
  { symbol: "GOOGL", price: "142.65", change: "+0.8%" },
  { symbol: "AMZN", price: "153.42", change: "+2.1%" },
  { symbol: "NVDA", price: "495.22", change: "+1.5%" },
  { symbol: "META", price: "334.92", change: "+2.3%" },
  { symbol: "TSLA", price: "238.45", change: "-1.8%" },
  { symbol: "JPM", price: "147.63", change: "+0.7%" },
  { symbol: "V", price: "267.89", change: "+1.1%" },
  { symbol: "WMT", price: "156.71", change: "-0.3%" },
  { symbol: "NFLX", price: "421.57", change: "+1.9%" },
  { symbol: "DIS", price: "112.35", change: "-0.6%" },
  { symbol: "BABA", price: "86.45", change: "+0.4%" },
  { symbol: "AMD", price: "117.26", change: "+1.7%" },
  { symbol: "INTC", price: "44.98", change: "-0.9%" },
  { symbol: "BA", price: "209.15", change: "+2.0%" },
  { symbol: "XOM", price: "98.23", change: "-1.2%" },
  { symbol: "PG", price: "152.34", change: "+0.5%" },
  { symbol: "KO", price: "59.76", change: "-0.4%" },
  { symbol: "PEP", price: "176.88", change: "+1.3%" },
  { symbol: "CSCO", price: "48.15", change: "+0.6%" },
  { symbol: "PFE", price: "34.52", change: "-1.0%" },
  { symbol: "MRNA", price: "120.89", change: "+3.4%" },
  { symbol: "CRM", price: "281.42", change: "+2.2%" },
  { symbol: "NKE", price: "105.76", change: "-0.7%" },
  { symbol: "MCD", price: "294.11", change: "+1.0%" },
  { symbol: "T", price: "17.23", change: "-0.2%" },
  { symbol: "UNH", price: "520.18", change: "+2.5%" },
  { symbol: "GS", price: "378.45", change: "+1.8%" },
  { symbol: "CVX", price: "160.33", change: "-0.9%" },
  { symbol: "ADBE", price: "588.21", change: "+1.6%" },
  { symbol: "PYPL", price: "62.74", change: "-0.5%" },
  { symbol: "ABBV", price: "154.56", change: "+1.3%" },
  { symbol: "COST", price: "631.22", change: "+2.1%" },
  { symbol: "WBA", price: "23.78", change: "-1.4%" },
  { symbol: "LMT", price: "435.19", change: "+0.9%" },
  { symbol: "DHR", price: "238.91", change: "+1.0%" },
  { symbol: "TGT", price: "135.87", change: "-0.6%" },
  { symbol: "SO", price: "72.34", change: "+0.5%" },
  { symbol: "LOW", price: "226.45", change: "+1.7%" },
  { symbol: "IBM", price: "159.22", change: "-0.3%" },
  { symbol: "BKNG", price: "3164.78", change: "+2.5%" },
  { symbol: "SPGI", price: "435.12", change: "+1.9%" },
  { symbol: "GS", price: "385.72", change: "+1.4%" }
];



const StockTicker = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=" py-4">
      <div className="container mx-auto px-4">
        
        <div className="ticker-container">
          <div className="ticker-content">
            {filteredStocks.map((stock, index) => (
              <span key={index} className="inline-flex items-center mx-6">
                <span className="font-semibold">{stock.symbol}</span>
                <span className="ml-2">${stock.price}</span>
                <span className={`ml-2 inline-flex items-center ${
                  stock.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}>
                  {stock.change.startsWith("+") ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stock.change}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTicker;