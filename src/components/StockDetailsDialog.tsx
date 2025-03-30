
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export interface StockDetails {
  symbol: string;
  title: string;
  logoUrl: string;
  industry: string;
  employees: string;
  founded: string;
  address: string;
  ceo: string;
  website: string;
  description: string;
  market_cap: string;
  peRatio: string;
  weekRange: string;
  volume: string;
  dividend_yield: string;
  financials: {
    revenue: string;
    netIncome: string;
    eps: string;
  };
}

interface StockDetailsDialogProps {
  stock: StockDetails | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const StockDetailsDialog: React.FC<StockDetailsDialogProps> = ({
  stock,
  isOpen,
  setIsOpen,
}) => {
  if (!stock) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{stock.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-4">
              <img
                src={stock.logoUrl || "/stock.avif"}
                alt={`${stock.title} Logo`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-gray-600">{stock.symbol}</p>
                <a
                  href={stock.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {stock.website}
                </a>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Company Overview</h3>
            <p>{stock.description}</p>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="font-semibold">Industry:</span> {stock.industry}
              </li>
              <li>
                <span className="font-semibold">Employees:</span> {stock.employees}
              </li>
              <li>
                <span className="font-semibold">Founded:</span> {stock.founded}
              </li>
              <li>
                <span className="font-semibold">Address:</span> {stock.address}
              </li>
              <li>
                <span className="font-semibold">CEO:</span> {stock.ceo}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Financial Highlights</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="font-semibold">Market Cap:</span>
                <p>{stock.market_cap || "N/A"}</p>
              </li>
              <li>
                <span className="font-semibold">PE Ratio:</span> {stock.peRatio}
              </li>
              <li>
                <span className="font-semibold">Week Range:</span> {stock.weekRange}
              </li>
              <li>
                <span className="font-semibold">Volume:</span> {stock.volume}
              </li>
              <li>
                <span className="font-semibold">Dividend Yield:</span>
                <p>{stock.dividend_yield || "N/A"}</p>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Financials</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <span className="font-semibold">Revenue:</span>
              <p>{stock.financials?.revenue || "N/A"}</p>
            </li>
            <li>
              <span className="font-semibold">Net Income:</span> {stock.financials?.netIncome}
            </li>
            <li>
              <span className="font-semibold">EPS:</span> {stock.financials?.eps}
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
