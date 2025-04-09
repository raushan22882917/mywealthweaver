import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Brain, Sparkles } from "lucide-react";

// Database types
interface InsightRow {
  yield: number;
  symbol: string;
  fiveyearavgdividendyield: number;
  diff: number;
  statement: string;
}

// Component types
interface InsightData extends InsightRow {}

interface InsightProps {
  symbol?: string;
  className?: string;
}

const getInsightStatement = (diff: number): { text: string; color: string } => {
  if (diff > 0) {
    return {
      text: "Above 5Y Average",
      color: "bg-green-500/10 text-green-700 dark:text-green-400",
    };
  } else if (diff < 0) {
    return {
      text: "Below 5Y Average",
      color: "bg-red-500/10 text-red-700 dark:text-red-400",
    };
  }
  return {
    text: "At 5Y Average",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  };
};

export const InsightCard: React.FC<InsightProps> = ({ symbol, className = "" }) => {
  const { symbol: urlSymbol } = useParams<{ symbol: string }>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [insightData, setInsightData] = React.useState<InsightData | null>(null);

  const stockSymbol = symbol || urlSymbol;

  React.useEffect(() => {
    const fetchInsightData = async () => {
      if (!stockSymbol) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('insight')
          .select('yield, symbol, fiveyearavgdividendyield, diff, statement')
          .eq('symbol', stockSymbol.toUpperCase())
          .single();

        if (error) throw error;

        if (data) {
          const formattedData: InsightData = {
            yield: data.yield,
            symbol: data.symbol,
            fiveyearavgdividendyield: data.fiveyearavgdividendyield,
            diff: data.diff,
            statement: data.statement
          };
          setInsightData(formattedData);
        }
      } catch (err: any) {
        console.error("Error fetching insight data:", err);
        setError(err.message || "Failed to load insight data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsightData();
  }, [stockSymbol]);

  if (!stockSymbol) {
    return null;
  }

  const insightStatement = insightData?.diff 
    ? getInsightStatement(insightData.diff)
    : null;

  return (
    <Card className={`${className} relative overflow-hidden transition-all duration-300 hover:shadow-lg`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader message="Loading insight data..." />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
        ) : insightData ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-grow">
                {insightData.statement && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insightData.statement}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center">
            No insight data available for {stockSymbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InsightPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Stock Insights</h1>
      <InsightCard symbol={symbol} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm" />
    </div>
  );
};

export default InsightPage;