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
import MarketData from "./pages/MarketData";
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

function App() {
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
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/team" element={<Team />} />
              <Route path="/policy" element={<PrivacyPolicy />} />
              <Route path="/updown" element={<UpDown />} />
              <Route path="/education" element={<Education />} />
              <Route path="/ticker/:symbol" element={<TickerDetail />} />
              <Route path="/stock/:symbol" element={<StockDetails />} />
              <Route path="/education/topic/:id" element={<Education />} />
              <Route path="/reporting" element={<Reporting />} />
              <Route path="/dividend" element={<Dividend />} />
              <Route path="/dividend/:symbol?" element={<Dividend />} />
              <Route path="/top-stocks" element={<TopStocks />}/>
              <Route path="/market-data" element={<MarketData />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id?" element={<News />} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard session={session} /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/announcements/:id?" element={<Announcements />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
