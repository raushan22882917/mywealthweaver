import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowUpRight, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DividendCalendar from '@/components/DividendCalendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Holiday } from '@/utils/types'; // Import the properly defined Holiday type

const Dividend = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [errorHolidays, setErrorHolidays] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      setErrorHolidays(null);
      try {
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/US`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Holiday[] = await response.json();
        setHolidays(data);
      } catch (e: any) {
        setErrorHolidays(e.message);
      } finally {
        setLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-blue-500" />
            Dividend &amp; Market Holiday Calendar
          </h1>
          <p className="text-gray-400">
            Stay informed about upcoming dividend dates and important market holidays.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-1">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-900/50">
              Dividend Calendar
            </TabsTrigger>
            <TabsTrigger value="holidays" className="data-[state=active]:bg-purple-900/50">
              Market Holidays
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <DividendCalendar />
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                US Market Holidays
              </h2>

              {loadingHolidays ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner loading-md text-purple-500"></span>
                  <p className="text-gray-400 mt-2">Loading market holidays...</p>
                </div>
              ) : errorHolidays ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                  <p className="text-red-400">Error: {errorHolidays}</p>
                </div>
              ) : holidays.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {holidays.map((holiday) => (
                    <Card key={holiday.date} className="bg-gray-900/80 border border-gray-800 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center">
                          {holiday.name}
                          <Badge variant="secondary" className="ml-2">
                            {holiday.type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 mb-2">
                          <CalendarIcon className="mr-2 h-4 w-4 inline-block" />
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <Button
                          variant="link"
                          asChild
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(
                              `US market holiday ${holiday.name} ${holiday.date}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            Learn More
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No market holidays found.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dividend;
