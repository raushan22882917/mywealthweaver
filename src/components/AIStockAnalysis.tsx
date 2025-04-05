
import React, { useState, useEffect } from "react";
import { analyzeStockWithAI, getStockAnalysisFromDB } from "@/services/aiAnalysisService";
import { StockAnalysis } from "@/utils/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIStockAnalysisProps {
  symbol: string;
  companyData: any;
}

const AIStockAnalysis: React.FC<AIStockAnalysisProps> = ({ symbol, companyData }) => {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalysis();
  }, [symbol]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // First try to get from database
      const dbAnalysis = await getStockAnalysisFromDB(symbol);
      
      if (dbAnalysis) {
        setAnalysis(dbAnalysis);
      } else {
        // If not in database, generate new analysis
        const newAnalysis = await analyzeStockWithAI(symbol, companyData);
        setAnalysis(newAnalysis);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast({
        title: "Error",
        description: "Failed to fetch stock analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    setRefreshing(true);
    try {
      const newAnalysis = await analyzeStockWithAI(symbol, companyData);
      setAnalysis(newAnalysis);
      toast({
        title: "Analysis Updated",
        description: "Stock analysis has been refreshed with latest data",
      });
    } catch (error) {
      console.error("Error refreshing analysis:", error);
      toast({
        title: "Error",
        description: "Failed to refresh stock analysis",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) return "bg-gray-500";
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getRecommendationBadge = (recommendation: string | undefined) => {
    if (!recommendation) return null;
    
    switch (recommendation.toLowerCase()) {
      case "buy":
        return (
          <Badge className="bg-green-500 text-white">
            <ArrowUp className="h-3 w-3 mr-1" />
            Buy
          </Badge>
        );
      case "sell":
        return (
          <Badge className="bg-red-500 text-white">
            <ArrowDown className="h-3 w-3 mr-1" />
            Sell
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Hold
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm border border-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Analyzing {symbol}...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm border border-gray-800">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <CardTitle className="mb-2">Analysis Unavailable</CardTitle>
          <CardDescription className="mb-4">
            We couldn't generate an analysis for this stock at the moment.
          </CardDescription>
          <Button onClick={fetchAnalysis}>Try Again</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900/60 backdrop-blur-sm border border-gray-800">
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              AI Analysis
              <div className={`h-3 w-3 rounded-full ${getSentimentColor(analysis.sentiment)}`} />
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(analysis.analysis_date).toLocaleString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalysis}
            disabled={refreshing}
            className="border-gray-700"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {refreshing ? "Updating..." : "Refresh Analysis"}
          </Button>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-gray-800 p-1 mx-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="outlook">Outlook</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="px-4 pb-4">
          <CardContent className="px-2 py-4">
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <Badge variant="outline" className="bg-gray-800 border-0 px-3 py-1 text-base">
                Sentiment: <span className="ml-1 font-semibold capitalize">{analysis.sentiment}</span>
              </Badge>
              <Badge variant="outline" className="bg-gray-800 border-0 px-3 py-1 text-base">
                Target: <span className="ml-1 font-semibold">${analysis.price_target?.toFixed(2) || "N/A"}</span>
              </Badge>
              {getRecommendationBadge(analysis.recommendation)}
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>{analysis.analysis_text}</p>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="swot" className="px-4 pb-4">
          <CardContent className="px-2 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/80 p-4 rounded-lg border border-green-900/30">
                <h3 className="font-semibold text-green-400 mb-2 text-sm uppercase tracking-wider">Strengths</h3>
                <p className="text-gray-300">{analysis.strength || "No data available"}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-red-900/30">
                <h3 className="font-semibold text-red-400 mb-2 text-sm uppercase tracking-wider">Weaknesses</h3>
                <p className="text-gray-300">{analysis.weakness || "No data available"}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-blue-900/30">
                <h3 className="font-semibold text-blue-400 mb-2 text-sm uppercase tracking-wider">Opportunities</h3>
                <p className="text-gray-300">{analysis.opportunity || "No data available"}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-yellow-900/30">
                <h3 className="font-semibold text-yellow-400 mb-2 text-sm uppercase tracking-wider">Threats</h3>
                <p className="text-gray-300">{analysis.threat || "No data available"}</p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="outlook" className="px-4 pb-4">
          <CardContent className="px-2 py-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Price Target</h3>
                <div className="bg-gray-800/80 p-4 rounded-lg">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-purple-400">
                      ${analysis.price_target?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-gray-400 text-sm mb-1">
                      Current: ${companyData?.price || companyData?.previousClose?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Current</span>
                      <span>Target</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ 
                          width: `${Math.min(Math.max(
                            ((analysis.price_target || 0) / (companyData?.price || companyData?.previousClose || 1)) * 100, 0), 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Recommendation</h3>
                <div className="bg-gray-800/80 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                      {analysis.recommendation || "N/A"}
                    </div>
                    <div className="flex-1">
                      <div className="flex w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            analysis.recommendation?.toLowerCase() === "buy" 
                              ? "bg-green-500" 
                              : analysis.recommendation?.toLowerCase() === "sell"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                          style={{ 
                            width: analysis.recommendation?.toLowerCase() === "buy" 
                              ? "100%" 
                              : analysis.recommendation?.toLowerCase() === "sell"
                                ? "30%"
                                : "65%" 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="pt-0 pb-4 px-6 text-xs text-gray-500">
        Powered by AI analysis • Based on current market data and historical performance
      </CardFooter>
    </Card>
  );
};

export default AIStockAnalysis;
