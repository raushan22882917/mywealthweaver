import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, BarChart, DollarSign, Target, Shield } from "lucide-react";
import { StockData } from "@/services/stockService";
import { StockAnalysis, analyzeStockWithAI, getLatestAnalysis } from "@/services/groqService";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface StockAnalysisDialogProps {
  stock: StockData;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const StockAnalysisDialog = ({ stock, isOpen, setIsOpen }: StockAnalysisDialogProps) => {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && stock) {
      loadAnalysis();
    }
  }, [isOpen, stock]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // First try to get the latest analysis from the database
      const latestAnalysis = await getLatestAnalysis(stock.symbol);
      
      if (latestAnalysis) {
        // Check if the analysis is recent (less than 24 hours old)
        const analysisDate = new Date(latestAnalysis.analysis_date);
        const now = new Date();
        const hoursDiff = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setAnalysis(latestAnalysis);
          setIsLoading(false);
          return;
        }
      }
      
      // If no recent analysis, generate a new one
      const newAnalysis = await analyzeStockWithAI(stock);
      setAnalysis(newAnalysis);
    } catch (error) {
      console.error("Error loading analysis:", error);
      toast.error("Failed to load stock analysis. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    if (rating.toLowerCase().includes('buy')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (rating.toLowerCase().includes('sell')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  };

  const getRiskColor = (risk: string) => {
    if (risk.toLowerCase().includes('low')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (risk.toLowerCase().includes('high')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[90vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto bg-white dark:bg-gray-900`}>
        <DialogHeader className="space-y-2">
          <DialogTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">AI Analysis: {stock.symbol}</span>
          </DialogTitle>
          <DialogDescription className={`${isMobile ? 'text-sm' : ''}`}>
            Comprehensive AI-powered analysis for {stock.symbol}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader className="h-8 w-8 sm:h-12 sm:w-12 mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">Analyzing {stock.symbol} with AI...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Section */}
            <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <Card className="p-3 sm:p-4 flex flex-col">
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">Investment Rating</span>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className={`${getRatingColor(analysis.investment_rating)} text-xs sm:text-sm font-medium`}>
                    {analysis.investment_rating}
                  </Badge>
                  {analysis.price_target && (
                    <span className="text-xs sm:text-sm">
                      Target: ${analysis.price_target.toFixed(2)}
                    </span>
                  )}
                </div>
              </Card>
              
              <Card className="p-3 sm:p-4 flex flex-col">
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">Risk Level</span>
                <Badge className={`${getRiskColor(analysis.risk_level)} text-xs sm:text-sm font-medium w-fit`}>
                  {analysis.risk_level}
                </Badge>
              </Card>
              
              <Card className="p-3 sm:p-4 flex flex-col">
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">AI Recommendation</span>
                <span className="font-medium text-xs sm:text-sm">{analysis.ai_recommendation}</span>
              </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`${isMobile ? 'grid grid-cols-2 h-auto' : 'grid grid-cols-5'} mb-4`}>
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="swot" className="text-xs sm:text-sm">SWOT</TabsTrigger>
                {!isMobile && <TabsTrigger value="outlook" className="text-xs sm:text-sm">Outlook</TabsTrigger>}
                {!isMobile && <TabsTrigger value="metrics" className="text-xs sm:text-sm">Metrics</TabsTrigger>}
                <TabsTrigger value="technical" className="text-xs sm:text-sm">Technical</TabsTrigger>
              </TabsList>

              {/* Mobile Additional Tabs */}
              {isMobile && (
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="outlook" className="text-xs">Outlook</TabsTrigger>
                  <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
                </TabsList>
              )}

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-3 sm:space-y-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Financial Health</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{analysis.financial_health}</p>
                </Card>
                
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Analyst Consensus</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{analysis.analyst_consensus}</p>
                </Card>
                
                {analysis.dividend_analysis && (
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Dividend Analysis</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{analysis.dividend_analysis}</p>
                  </Card>
                )}
              </TabsContent>

              {/* SWOT Analysis Tab */}
              <TabsContent value="swot" className="space-y-3 sm:space-y-4">
                <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                      Strengths
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-muted-foreground text-xs sm:text-sm">{strength}</li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                      Weaknesses
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-muted-foreground text-xs sm:text-sm">{weakness}</li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                      Opportunities
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-muted-foreground text-xs sm:text-sm">{opportunity}</li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500" />
                      Threats
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.threats.map((threat, index) => (
                        <li key={index} className="text-muted-foreground text-xs sm:text-sm">{threat}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              {/* Outlook Tab */}
              <TabsContent value="outlook" className="space-y-3 sm:space-y-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" />
                    Short-Term Outlook (3-6 months)
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{analysis.short_term_outlook}</p>
                </Card>
                
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Long-Term Outlook (1-3 years)
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{analysis.long_term_outlook}</p>
                </Card>
              </TabsContent>

              {/* Key Metrics Tab */}
              <TabsContent value="metrics" className="space-y-3 sm:space-y-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Key Financial Metrics</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Metric</TableHead>
                          <TableHead className="text-xs sm:text-sm">Value</TableHead>
                          <TableHead className="text-xs sm:text-sm">Assessment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analysis.key_metrics?.pe_ratio !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium text-xs sm:text-sm">P/E Ratio</TableCell>
                            <TableCell className="text-xs sm:text-sm">{analysis.key_metrics.pe_ratio.toFixed(2)}</TableCell>
                            <TableCell>
                              {analysis.key_metrics.pe_ratio < 15 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Undervalued
                                </Badge>
                              ) : analysis.key_metrics.pe_ratio > 25 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                                  Overvalued
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">
                                  Fair
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {analysis.key_metrics?.price_to_book !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium text-xs sm:text-sm">Price to Book</TableCell>
                            <TableCell className="text-xs sm:text-sm">{analysis.key_metrics.price_to_book.toFixed(2)}</TableCell>
                            <TableCell>
                              {analysis.key_metrics.price_to_book < 1 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Below Book
                                </Badge>
                              ) : analysis.key_metrics.price_to_book > 3 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                                  Premium
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">
                                  Reasonable
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {analysis.key_metrics?.debt_to_equity !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium text-xs sm:text-sm">Debt to Equity</TableCell>
                            <TableCell className="text-xs sm:text-sm">{analysis.key_metrics.debt_to_equity.toFixed(2)}</TableCell>
                            <TableCell>
                              {analysis.key_metrics.debt_to_equity < 0.5 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Low Leverage
                                </Badge>
                              ) : analysis.key_metrics.debt_to_equity > 1.5 ? (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                                  High Leverage
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                                  Moderate Leverage
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {analysis.key_metrics?.profit_margin !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium text-xs sm:text-sm">Profit Margin</TableCell>
                            <TableCell className="text-xs sm:text-sm">{(analysis.key_metrics.profit_margin * 100).toFixed(2)}%</TableCell>
                            <TableCell>
                              {analysis.key_metrics.profit_margin > 0.15 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Strong
                                </Badge>
                              ) : analysis.key_metrics.profit_margin < 0.05 ? (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                                  Weak
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                                  Average
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {analysis.key_metrics?.revenue_growth !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium text-xs sm:text-sm">Revenue Growth</TableCell>
                            <TableCell className="text-xs sm:text-sm">{(analysis.key_metrics.revenue_growth * 100).toFixed(2)}%</TableCell>
                            <TableCell>
                              {analysis.key_metrics.revenue_growth > 0.1 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Strong Growth
                                </Badge>
                              ) : analysis.key_metrics.revenue_growth < 0 ? (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                                  Declining
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                                  Moderate Growth
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-3 sm:space-y-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-500" />
                    Technical Indicators
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{analysis.technical_indicators}</p>
                </Card>
                
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Current Price vs. Target</h3>
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center'}`}>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Price</p>
                      <p className="text-base sm:text-lg font-bold">${stock.regularMarketPrice.toFixed(2)}</p>
                    </div>
                    
                    {analysis.price_target && (
                      <>
                        <div className={`flex-1 ${isMobile ? '' : 'text-center'}`}>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Potential Change</p>
                          <div className="flex items-center justify-start">
                            {analysis.price_target > stock.regularMarketPrice ? (
                              <>
                                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                                <span className="text-green-500 font-medium text-sm sm:text-base">
                                  {(((analysis.price_target - stock.regularMarketPrice) / stock.regularMarketPrice) * 100).toFixed(2)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                                <span className="text-red-500 font-medium text-sm sm:text-base">
                                  {(((analysis.price_target - stock.regularMarketPrice) / stock.regularMarketPrice) * 100).toFixed(2)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className={`flex-1 ${isMobile ? '' : 'text-right'}`}>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Target Price</p>
                          <p className="text-base sm:text-lg font-bold">${analysis.price_target.toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className={`${isMobile ? 'flex-col space-y-2' : 'flex-row'} gap-2`}>
              <p className="text-xs text-muted-foreground">
                Analysis generated on {new Date(analysis.analysis_date).toLocaleDateString()} at {new Date(analysis.analysis_date).toLocaleTimeString()}
              </p>
              <Button onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mb-4 text-yellow-500" />
            <p className="text-muted-foreground text-sm sm:text-base">Failed to load analysis for {stock.symbol}</p>
            <Button onClick={loadAnalysis} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockAnalysisDialog;
