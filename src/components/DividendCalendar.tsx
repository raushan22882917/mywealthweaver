import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ExternalLink } from "lucide-react";
import { format, isSameDay, parseISO, getDaysInMonth, getDay, setDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react";
import StockFilter, { StockFilterCriteria, StockFilterData } from "@/components/ui/stock-filter";

interface DividendEvent {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_average: number;
  revenue_average: number;
  LogoURL?: string;
  company_name?: string;
  earnings_low: number;
  earnings_high: number;
  revenue_low: number;
  revenue_high: number;
}

const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];

const DividendCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dividendEvents, setDividendEvents] = useState<DividendEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyLogos, setCompanyLogos] = useState<Map<string, string>>(new Map());
  const [filteredEvents, setFilteredEvents] = useState<DividendEvent[]>([]);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend_reports")
          .select("*, ex_dividend_date");
        if (dividendError) throw dividendError;
        const { data: logosData, error: logosError } = await supabase
          .from("company_logos")
          .select("Symbol, LogoURL");
        if (logosError) throw logosError;
        const logoMap = new Map(
          logosData.map((logo: { Symbol: string; LogoURL: string }) => [
            logo.Symbol.toUpperCase(),
            logo.LogoURL
          ])
        );
        setCompanyLogos(logoMap);
        const eventsWithLogos = dividendData.map((event: any) => ({
          ...event,
          LogoURL: logoMap.get(event.symbol.toUpperCase()) || null,
          company_name: event.company_name || event.symbol
        }));
        setDividendEvents(eventsWithLogos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDividendData();
  }, []);

  useEffect(() => {
    // Filter events for the selected date only
    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    setFilteredEvents(dividendEvents.filter(event => event.dividend_date === formattedDate));
  }, [selectedDate, dividendEvents]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-6 flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border border-gray-700 bg-gray-900 text-white"
        />
        <div className="mt-4 w-full">
          <h2 className="text-xl font-bold mb-2 text-white text-center">
            Dividend Events for {selectedDate ? format(selectedDate, 'PPP') : ''}
          </h2>
          {filteredEvents.length === 0 ? (
            <div className="text-gray-400 text-center">No dividend events for this date.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Ex-Dividend Date</TableHead>
                  <TableHead>Earnings Avg</TableHead>
                  <TableHead>Revenue Avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id} onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }} className="cursor-pointer hover:bg-gray-800">
                    <TableCell>{event.symbol}</TableCell>
                    <TableCell>{event.company_name}</TableCell>
                    <TableCell>{event.ex_dividend_date}</TableCell>
                    <TableCell>{event.earnings_average}</TableCell>
                    <TableCell>{event.revenue_average}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      {/* Dialog for event details (optional, keep if already present) */}
      {selectedEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.symbol} - {selectedEvent.company_name}</DialogTitle>
              <DialogDescription>
                Ex-Dividend Date: {selectedEvent.ex_dividend_date}<br />
                Earnings Avg: {selectedEvent.earnings_average}<br />
                Revenue Avg: {selectedEvent.revenue_average}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DividendCalendar;