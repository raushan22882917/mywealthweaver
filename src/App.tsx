
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import TickerDetail from "./pages/TickerDetail";
import MarketData from "./pages/MarketData";
import News from "./pages/News";
import Dividend from "./pages/Dividend";
import StockDetails from "./pages/StockDetails";
import Education from "./pages/Education";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import Reporting from "./pages/Reporting";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/policy";
import UpDown from "./pages/UpDown";
import { Session } from '@supabase/supabase-js';
import TopStocks from "./components/TopStocks";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStockSymbol, setCurrentStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<{ cik_str: string; Symbol: string; title: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/education" element={<Education />} />
              <Route 
                path="/market-data" 
                element={
                  <ProtectedRoute>
                    <MarketData />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/news" 
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dividend" 
                element={
                  <ProtectedRoute>
                    <Dividend />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/updown" 
                element={
                  <ProtectedRoute>
                    <UpDown />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/Topstock" 
                element={
                  <ProtectedRoute>
                    <TickerDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/top-stocks" 
                element={
                  <ProtectedRoute>
                    <TopStocks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  session ? (
                    <Dashboard session={session} />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/policy" 
                element={
                  <ProtectedRoute>
                    <PrivacyPolicy />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/reporting" 
                element={
                  <ProtectedRoute>
                    <Reporting />
                  </ProtectedRoute>
                }
              />
              <Route path="/stock/:symbol" element={<StockDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          {selectedStock && (
            <StockDetailsDialog
              stock={selectedStock}
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
            />
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
