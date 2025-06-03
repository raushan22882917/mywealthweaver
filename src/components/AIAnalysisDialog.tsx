import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Calendar, Building, Globe, Phone, MapPin, AlertTriangle, CheckCircle, XCircle, Star, BookOpen, BarChart3, LineChart, Activity, Target, Shield, Zap, Award } from "lucide-react";

interface AIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
}

interface StockAnalysis {
  symbol: string;
  analysis_date: string;
  overall_score: number;
  growth_score: number;
  value_score: number;
  momentum_score: number;
  financial_health_score: number;
  summary: string;
  recommendation: string;
  target_price: number;
  stop_loss: number;
  technical_summary: string;
}

const AIAnalysisDialog: React.FC<AIAnalysisDialogProps> = ({ open, onOpenChange, symbol }) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<StockAnalysis | null>(null);

  useEffect(() => {
    const fetchStockAnalysis = async () => {
      setLoading(true);
      try {
        // Remove the invalid stock_analysis_history query and use stock_analysis instead
        const { data: analysisData, error } = await supabase
          .from('stock_analysis')
          .select('*')
          .eq('symbol', symbol)
          .order('analysis_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching stock analysis:", error);
        }

        setAnalysisData(analysisData || null);
      } catch (error) {
        console.error("Error fetching stock analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockAnalysis();
    }
  }, [symbol]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-white">AI Stock Analysis</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          </div>
        ) : (
          <div className="space-y-6 mt-6 text-white">
            {analysisData ? (
              <>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">Overall Score: {analysisData.overall_score}</Badge>
                  <Badge variant="outline">Recommendation: {analysisData.recommendation}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Key Scores</h3>
                    <p>Growth: {analysisData.growth_score}</p>
                    <p>Value: {analysisData.value_score}</p>
                    <p>Momentum: {analysisData.momentum_score}</p>
                    <p>Financial Health: {analysisData.financial_health_score}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Financial Targets</h3>
                    <p>Target Price: ${analysisData.target_price}</p>
                    <p>Stop Loss: ${analysisData.stop_loss}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Summary</h3>
                  <p>{analysisData.summary}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Technical Analysis</h3>
                  <p>{analysisData.technical_summary}</p>
                </div>
              </>
            ) : (
              <p>No analysis data available for this stock.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisDialog;
