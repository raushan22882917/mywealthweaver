import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Filter, Search, TrendingUp, DollarSign, Building } from "lucide-react";
import StockDetailsDialog from "@/components/StockDetailsDialog";

interface Stock {
  Symbol: string;
  title: string;
  cik_str: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

const TopStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: topStocks, error } = await supabase
          .from('top_stocks')
          .select('Symbol, Sector, Industry, Rank, Score, Industry_Rank')
          .limit(100);

        if (error) throw error;

        const { data: companyLogos } = await supabase
          .from('company_logos')
          .select('*');

        const enrichedStocks: Stock[] = topStocks.map(stock => {
          const logo = companyLogos?.find(logo => logo.symbol === stock.Symbol);

          return {
            Symbol: stock.Symbol,
            title: stock.Sector,
            cik_str: stock.Industry,
            LogoURL: logo?.url,
            marketCap: stock.Rank,
            dividendyield: stock.Score
          };
        });

        setStocks(enrichedStocks);
        setFilteredStocks(enrichedStocks);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = stocks.filter(stock =>
      stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sectorFilter !== "all") {
      filtered = filtered.filter(stock => stock.title === sectorFilter);
    }

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, sectorFilter]);

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {[...new Set(stocks.map(stock => stock.title))].map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStocks.map(stock => (
          <Card key={stock.Symbol} className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => handleStockClick(stock)}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {stock.LogoURL && (
                  <img src={stock.LogoURL} alt={`${stock.Symbol} Logo`} className="w-6 h-6 rounded-full" />
                )}
                {stock.Symbol}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-2">
              <p><strong>Sector:</strong> {stock.title}</p>
              <p><strong>Industry:</strong> {stock.cik_str}</p>
              <p><strong>Market Cap:</strong> {stock.marketCap}</p>
              <p><strong>Dividend Yield:</strong> {stock.dividendyield}</p>
            </CardContent>
          </Card>
        ))}
      </div>

          <StockDetailsDialog
            symbol={selectedStock?.Symbol || ''}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
    </div>
  );
};

export default TopStocks;
