
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import EmailSubscription from './EmailSubscription';
import { Stock } from '@/types/dividend';

interface StockDialogProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
}

const StockDialog: React.FC<StockDialogProps> = ({ stock, isOpen, onClose }) => {
  if (!stock) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 text-white border-gray-800 shadow-xl shadow-purple-500/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={stock.LogoURL || "/stock.avif"} 
              alt={stock.Symbol} 
              className="w-12 h-12 rounded-full bg-white p-1 border border-gray-300"
            />
            <div>
              <DialogTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {stock.Symbol}
              </DialogTitle>
              <p className="text-gray-400">{stock.title}</p>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="dividends">Dividends</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="py-4">
            <div className="space-y-4">
              <p className="text-gray-300">
                Stock information and company overview will appear here.
              </p>
              <EmailSubscription stockSymbol={stock.Symbol} />
              <div className="flex justify-end mt-4">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Details
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="py-4">
            <p className="text-gray-300">
              Financial data will appear here.
            </p>
          </TabsContent>
          
          <TabsContent value="dividends" className="py-4">
            <p className="text-gray-300">
              Dividend history and upcoming payments will appear here.
            </p>
          </TabsContent>
          
          <TabsContent value="news" className="py-4">
            <p className="text-gray-300">
              Latest news and announcements will appear here.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StockDialog;
