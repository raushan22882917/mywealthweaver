
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all page components
import Index from "./pages/Index";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import TickerDetail from "./pages/TickerDetail";
import MarketData from "./pages/MarketData";
import News from "./pages/News";
import Dividend from "./pages/Dividend";
import StockDetails from "./pages/StockDetails";
import Education from "./pages/Education";
import Settings from "./pages/Settings";
import Reporting from "./pages/Reporting";
import Dashboard from "./pages/dashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UpDown from "./pages/UpDown";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Announcements from "./pages/Announcements";
import DividendYield from "./pages/DividendYield";

// Import UI components
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Import styles
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ticker/:symbol" element={<TickerDetail />} />
          <Route path="/market" element={<MarketData />} />
          <Route path="/news" element={<News />} />
          <Route path="/dividend" element={<Dividend />} />
          <Route path="/stock/:symbol" element={<StockDetails />} />
          <Route path="/education" element={<Education />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/updown" element={<UpDown />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/announcements" element={<Announcements />} />
          {/* Add the new dividend yield routes */}
          <Route path="/dividend-yield" element={<DividendYield />} />
          <Route path="/dividend-yield/:symbol" element={<DividendYield />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
