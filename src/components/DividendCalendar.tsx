
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DividendEvent {
  id: string;
  symbol: string;
  dividend_date: string;
  ex_dividend_date: string;
  earnings_date: string;
  earnings_average: number;
  revenue_average: number;
  logo_url?: string;
  company_name?: string;
}

interface CalendarDay {
  date: Date;
  events: DividendEvent[];
}

const DividendCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [dividendEvents, setDividendEvents] = useState<DividendEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        // Fetch dividend reports with company logos
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend_reports")
          .select("*");

        if (dividendError) throw dividendError;

        // Fetch company logos
        const { data: logosData, error: logosError } = await supabase
          .from("company_logos")
          .select("*");

        if (logosError) throw logosError;

        // Map logos to dividend data
        const eventsWithLogos = dividendData.map((event: any) => {
          const matchingLogo = logosData.find((logo: any) => logo.symbol === event.symbol);
          return {
            ...event,
            logo_url: matchingLogo?.logo_url || null,
            company_name: matchingLogo?.company_name || event.symbol
          };
        });

        setDividendEvents(eventsWithLogos);
      } catch (error) {
        console.error("Error fetching dividend data:", error);
      }
    };

    fetchDividendData();
  }, []);

  const handlePreviousMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setMonth(newMonth);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
    }
  };

  const handleEventClick = (event: DividendEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const getEventsByDate = (day: Date): DividendEvent[] => {
    return dividendEvents.filter((event) => {
      if (!event.dividend_date) return false;
      return isSameDay(parseISO(event.dividend_date), day);
    });
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Dividend Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {format(month, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        month={month}
        onMonthChange={setMonth}
        className="rounded-md border"
        components={{
          DayContent: ({ date: day }) => {
            const events = getEventsByDate(day);
            return (
              <div className="h-full w-full">
                <div className="text-center">{format(day, "d")}</div>
                {events.length > 0 && (
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="relative"
                        onMouseEnter={() => setIsHovering(event.id)}
                        onMouseLeave={() => setIsHovering(null)}
                      >
                        <img
                          src={event.logo_url || "https://via.placeholder.com/30"}
                          alt={event.symbol}
                          className="w-6 h-6 rounded-full cursor-pointer border border-gray-200"
                          onClick={() => handleEventClick(event)}
                        />
                        
                        {isHovering === event.id && (
                          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-popover text-popover-foreground px-2 py-1 text-xs rounded shadow whitespace-nowrap">
                            {event.symbol}
                          </div>
                        )}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{events.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          }
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={selectedEvent.logo_url || "https://via.placeholder.com/40"} 
                    alt={selectedEvent.symbol} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <DialogTitle className="text-xl">{selectedEvent.symbol}</DialogTitle>
                    <DialogDescription>{selectedEvent.company_name || selectedEvent.symbol}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Dividend Date</h4>
                  <p className="font-medium">
                    {selectedEvent.dividend_date ? format(parseISO(selectedEvent.dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Ex-Dividend Date</h4>
                  <p className="font-medium">
                    {selectedEvent.ex_dividend_date ? format(parseISO(selectedEvent.ex_dividend_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Earnings Date</h4>
                  <p className="font-medium">
                    {selectedEvent.earnings_date ? format(parseISO(selectedEvent.earnings_date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Earnings (EPS)</h4>
                  <p className="font-medium">${selectedEvent.earnings_average?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Revenue</h4>
                  <p className="font-medium">
                    {selectedEvent.revenue_average
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact',
                          maximumFractionDigits: 1
                        }).format(selectedEvent.revenue_average)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DividendCalendar;
