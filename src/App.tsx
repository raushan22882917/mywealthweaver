
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
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
import News from "./pages/News";
import Dividend from "./pages/Dividend";
import StockDetails from "./pages/StockDetails";
import Education from "./pages/Education";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import Reporting from "./pages/Reporting";
import Dashboard from "./pages/dashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UpDown from "./pages/UpDown";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import { Session } from '@supabase/supabase-js';
import TopStocks from "./components/TopStocks";
import Announcements from "./pages/Announcements";
import DividendDetail from "./pages/dividenddetail";
import DividendYield from "./pages/DividendYield";
import InsightPage from "./pages/insight";
import HelpSupport from "./pages/HelpSupport";
import ProtectedRoute from "./components/ProtectedRoute";

interface Stock {
  cik_str: string;
  Symbol: string;
  title: string;
  LogoURL?: string;
  marketCap?: number;
  dividendyield?: number;
}

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStockForDetails, setSelectedStockForDetails] = useState<Stock | null>(null);
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);

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

  // Add event listener for openStockDetails
  useEffect(() => {
    const handleOpenStockDetails = (event: CustomEvent<Stock>) => {
      setSelectedStockForDetails(event.detail);
      setIsStockDetailsOpen(true);
    };

    window.addEventListener('openStockDetails', handleOpenStockDetails as EventListener);

    return () => {
      window.removeEventListener('openStockDetails', handleOpenStockDetails as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
              <Route path="/updown" element={<ProtectedRoute><UpDown /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />
              <Route path="/ticker/:symbol" element={<ProtectedRoute><TickerDetail /></ProtectedRoute>} />
              <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetails /></ProtectedRoute>} />
              <Route path="/education/topic/:id" element={<ProtectedRoute><Education /></ProtectedRoute>} />
              <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
              <Route path="/dividend" element={<ProtectedRoute><Dividend /></ProtectedRoute>} />
              <Route path="/dividend/:symbol?" element={<ProtectedRoute><Dividend /></ProtectedRoute>} />
              <Route path="/top-stocks" element={<ProtectedRoute><TopStocks /></ProtectedRoute>}/>
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/news/:id?" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/insight" element={<ProtectedRoute><InsightPage /></ProtectedRoute>} />
              <Route path="/insight/:symbol?" element={<ProtectedRoute><InsightPage /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard session={session} /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/announcements/:id?" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/dividenddetail" element={<ProtectedRoute><DividendDetail /></ProtectedRoute>} />
              <Route path="/dividendyield" element={<ProtectedRoute><DividendYield /></ProtectedRoute>} />
              <Route path="/dividendyield/:symbol?" element={<ProtectedRoute><DividendYield /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global StockDetailsDialog */}
            {selectedStockForDetails && (
              <StockDetailsDialog
                stock={selectedStockForDetails}
                isOpen={isStockDetailsOpen}
                setIsOpen={setIsStockDetailsOpen}
              />
            )}
            
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
