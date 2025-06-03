import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { StockAnalysis, analyzeStock, saveAnalysisToFavorites } from "@/services/aiAnalysisService";
import { Heart, TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart, Target, Award, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
}

export function AIAnalysisDialog({ isOpen, onClose, symbol, companyName, sector, currentPrice }: AIAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('buy')) return 'text-green-500';
    if (recommendation.toLowerCase().includes('sell')) return 'text-red-500';
    return 'text-yellow-500'; // for hold or neutral
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleAnalyze = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeStock(symbol, companyName, sector, currentPrice);
      setAnalysis(result);
      
      // Save to database
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('stock_analysis_history')
          .insert([{
            user_id: session.user.id,
            symbol: symbol,
            company_name: companyName,
            analysis_date: new Date().toISOString(),
            recommendation: result.recommendation,
            price_target: result.price_target || 'N/A',
            confidence_score: result.confidence_score
          }]);
          
        if (error) {
          console.error('Error saving analysis history:', error);
        }
      }
    } catch (error) {
      console.error('Error analyzing stock:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate stock analysis. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFavorites = async () => {
    if (!analysis || isSaving) return;
    
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save analyses to favorites.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      const success = await saveAnalysisToFavorites(analysis, session.user.id);
      if (success) {
        setIsSaved(true);
        toast({
          title: "Analysis Saved",
          description: "This analysis has been added to your favorites.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to save analysis");
      }
    } catch (error) {
      console.error('Error saving to favorites:', error);
      toast({
        title: "Save Failed",
        description: "Could not save analysis to favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart className="h-5 w-5" />
            AI Stock Analysis: {symbol} - {companyName}
          </DialogTitle>
          <DialogDescription>
            Powered by GROQ AI - Advanced financial analysis and investment insights
          </DialogDescription>
        </DialogHeader>

        {!analysis && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Stock Analysis</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get detailed financial analysis, investment recommendations, and insights powered by advanced AI.
            </p>
            <Button onClick={handleAnalyze} className="gap-2">
              <Target className="h-4 w-4" />
              Analyze {symbol}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyzing {symbol}...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is performing a comprehensive analysis of {companyName}. This may take a moment.
            </p>
          </div>
        )}

        {analysis && !isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 flex flex-col">
                <span className="text-sm text-muted-foreground">Recommendation</span>
                <span className={`text-xl font-bold ${getRecommendationColor(analysis.recommendation)}`}>
                  {analysis.recommendation.split(' ')[0]}
                </span>
                <span className="text-xs mt-1">{analysis.price_target}</span>
              </Card>
              
              <Card className="p-4 flex flex-col">
                <span className="text-sm text-muted-foreground">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{analysis.confidence_score}/10</span>
                  <Badge className={`${getConfidenceColor(analysis.confidence_score)} text-white`}>
                    {analysis.confidence_score >= 7 ? 'High' : analysis.confidence_score >= 4 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2">
                  <div 
                    className={`${getConfidenceColor(analysis.confidence_score)} h-2 rounded-full`} 
                    style={{ width: `${analysis.confidence_score * 10}%` }}
                  ></div>
                </div>
              </Card>
              
              <Card className="p-4 flex flex-col">
                <span className="text-sm text-muted-foreground">Analysis Date</span>
                <span className="text-xl font-bold">
                  {new Date(analysis.analysis_date).toLocaleDateString()}
                </span>
                <span className="text-xs mt-1">
                  {new Date(analysis.analysis_date).toLocaleTimeString()}
                </span>
              </Card>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                <TabsTrigger value="strengths">SWOT</TabsTrigger>
                <TabsTrigger value="thesis">Investment Thesis</TabsTrigger>
                <TabsTrigger value="risks">Catalysts & Risks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Financial Health</h4>
                        <p className="text-sm text-muted-foreground">{analysis.financial_health}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Growth Potential</h4>
                        <p className="text-sm text-muted-foreground">{analysis.growth_potential}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Risk Assessment</h4>
                        <p className="text-sm text-muted-foreground">{analysis.risk_assessment}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Competitive Position</h4>
                        <p className="text-sm text-muted-foreground">{analysis.competitive_position}</p>
                      </div>
                    </div>
                  </Card>
                  
                  {analysis.dividend_analysis && (
                    <Card className="p-4 md:col-span-2">
                      <div className="flex items-start gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Dividend Analysis</h4>
                          <p className="text-sm text-muted-foreground">{analysis.dividend_analysis}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metrics">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Key Financial Metrics</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Assessment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analysis.key_metrics).map(([key, value]) => {
                        // Skip if value is undefined or null
                        if (value === undefined || value === null) return null;
                        
                        // Format the key for display
                        const formattedKey = key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{formattedKey}</TableCell>
                            <TableCell>{value}</TableCell>
                            <TableCell>
                              {/* Add assessment logic here if needed */}
                              {key === 'pe_ratio' && (
                                <Badge variant={Number(value) < 15 ? 'default' : Number(value) > 25 ? 'destructive' : 'outline'}>
                                  {Number(value) < 15 ? 'Attractive' : Number(value) > 25 ? 'Expensive' : 'Fair'}
                                </Badge>
                              )}
                              {key === 'debt_to_equity' && (
                                <Badge variant={Number(value) < 1 ? 'default' : Number(value) > 2 ? 'destructive' : 'outline'}>
                                  {Number(value) < 1 ? 'Low' : Number(value) > 2 ? 'High' : 'Moderate'}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
              
              <TabsContent value="strengths" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.key_strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">+</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Key Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {analysis.key_weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">-</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="thesis">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Investment Thesis</h3>
                  <p className="whitespace-pre-line">{analysis.investment_thesis}</p>
                </Card>
              </TabsContent>
              
              <TabsContent value="risks" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Potential Catalysts
                    </h3>
                    <ul className="space-y-2">
                      {analysis.catalysts.map((catalyst, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">→</span>
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Risks to Consider
                    </h3>
                    <ul className="space-y-2">
                      {analysis.risks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 font-bold">!</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveToFavorites} 
                disabled={isSaving || isSaved}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Saved to Favorites' : isSaving ? 'Saving...' : 'Save to Favorites'}
              </Button>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
