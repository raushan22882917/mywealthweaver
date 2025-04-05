
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeStockWithAI, getStockAnalysisFromDB } from "@/services/aiAnalysisService";
import { Button } from "@/components/ui/button";
import { StockAnalysis } from "@/utils/types";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, BarChart, TrendingUp, TrendingDown, CheckCircle2, XCircle, ChevronRight, Target, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIStockAnalysisProps {
  symbol: string;
  companyData: any;
}

const AIStockAnalysis: React.FC<AIStockAnalysisProps> = ({ symbol, companyData }) => {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await getStockAnalysisFromDB(symbol);
        setAnalysis(data);
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast({
          title: "Error",
          description: "Failed to load stock analysis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol, toast]);

  const handleGenerateAnalysis = async () => {
    try {
      setGenerating(true);
      toast({
        title: "Generating Analysis",
        description: "This may take up to 30 seconds...",
      });

      const newAnalysis = await analyzeStockWithAI(symbol, companyData);
      
      if (newAnalysis) {
        setAnalysis(newAnalysis);
        toast({
          title: "Analysis Complete",
          description: "Stock analysis has been generated",
        });
      } else {
        throw new Error("Failed to generate analysis");
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate stock analysis",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'bg-green-500';
      case 'bearish':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'buy':
      case 'strong buy':
        return 'bg-green-500';
      case 'sell':
      case 'strong sell':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return <Loader message="Loading stock analysis..." />;
  }

  return (
    <div className="w-full">
      {!analysis ? (
        <Card className="bg-gray-900 border border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">AI Stock Analysis</CardTitle>
            <CardDescription>
              Generate a detailed AI analysis for {symbol}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
              <p className="text-gray-400 mb-6">
                Generate an AI-powered analysis to get insights about this stock
              </p>
              <Button 
                onClick={handleGenerateAnalysis} 
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart className="mr-2 h-4 w-4" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-400" />
                AI Analysis for {symbol}
              </CardTitle>
              <CardDescription>
                Generated on {new Date(analysis.analysis_date).toLocaleDateString()} at {new Date(analysis.analysis_date).toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={`${getSentimentColor(analysis.sentiment)}`}>
                {analysis.sentiment}
              </Badge>
              {analysis.recommendation && (
                <Badge className={`${getRecommendationColor(analysis.recommendation)}`}>
                  {analysis.recommendation}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardContent className="pt-2 pb-0">
              <TabsList className="bg-gray-800/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-900/30">Overview</TabsTrigger>
                <TabsTrigger value="swot" className="data-[state=active]:bg-purple-900/30">SWOT Analysis</TabsTrigger>
                <TabsTrigger value="price" className="data-[state=active]:bg-purple-900/30">Price Target</TabsTrigger>
              </TabsList>
            </CardContent>
            
            <CardContent className="pt-4">
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {analysis.sentiment?.toLowerCase() === 'bullish' ? (
                      <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                    ) : analysis.sentiment?.toLowerCase() === 'bearish' ? (
                      <TrendingDown className="h-5 w-5 text-red-500 mt-1" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-yellow-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                        {analysis.analysis_text}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="swot" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-green-900/30">
                    <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line">
                      {analysis.strength || "No strength analysis available"}
                    </p>
                  </div>
                  
                  {/* Weaknesses */}
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-red-900/30">
                    <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Weaknesses
                    </h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line">
                      {analysis.weakness || "No weakness analysis available"}
                    </p>
                  </div>
                  
                  {/* Opportunities */}
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-blue-900/30">
                    <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Opportunities
                    </h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line">
                      {analysis.opportunity || "No opportunity analysis available"}
                    </p>
                  </div>
                  
                  {/* Threats */}
                  <div className="bg-gray-800/40 p-4 rounded-lg border border-yellow-900/30">
                    <h3 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Threats
                    </h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line">
                      {analysis.threat || "No threat analysis available"}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="price" className="mt-0">
                <div className="flex flex-col items-center justify-center py-4">
                  {analysis.price_target ? (
                    <>
                      <div className="text-center mb-6">
                        <Target className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                        <h3 className="text-lg font-medium mb-1">Price Target</h3>
                        <div className="text-3xl font-bold text-white">
                          ${analysis.price_target.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-blue-400" />
                          Recommendation
                        </h4>
                        <p className="text-sm text-gray-300">
                          {analysis.recommendation === 'Buy' ? (
                            <span className="text-green-400 font-medium">BUY</span>
                          ) : analysis.recommendation === 'Sell' ? (
                            <span className="text-red-400 font-medium">SELL</span>
                          ) : (
                            <span className="text-yellow-400 font-medium">HOLD</span>
                          )}: {analysis.analysis_text.split('.')[0]}...
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                      <h3 className="text-lg font-medium mb-2">No Price Target Available</h3>
                      <p className="text-gray-400 mb-4">
                        A specific price target couldn't be determined based on available data
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleGenerateAnalysis} disabled={generating}>
              {generating ? "Generating..." : "Refresh Analysis"}
            </Button>
            <p className="text-xs text-gray-500">
              Analysis powered by AI - Not financial advice
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AIStockAnalysis;
