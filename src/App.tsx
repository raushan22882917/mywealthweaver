import React from 'react'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import StockDetails from "@/pages/StockDetails";
import MarketData from "@/pages/MarketData";
import Team from "@/pages/Team";
import Education from "@/pages/Education";
import News from "@/pages/News";
import TickerDetail from "@/pages/TickerDetail";
import UpDown from "@/pages/UpDown";
import Auth from "@/pages/Auth";
import Dividend from "@/pages/Dividend";
import Reporting from "@/pages/Reporting";
import DividendCalendar from "@/pages/DividendCalendar";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/stock/:cik" element={<StockDetails />} />
          <Route path="/market-data" element={<MarketData />} />
          <Route path="/team" element={<Team />} />
          <Route path="/education" element={<Education />} />
          <Route path="/news" element={<News />} />
          <Route path="/ticker/:symbol" element={<TickerDetail />} />
          <Route path="/updown" element={<UpDown />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dividend" element={<Dividend />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/dividend-calendar" element={<DividendCalendar />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
