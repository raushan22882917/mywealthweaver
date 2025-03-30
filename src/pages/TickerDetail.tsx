import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TickerDetail = () => {
  const { symbol } = useParams();

  const stockData = {
    symbol: "GOOG",
    name: "Alphabet Inc.",
    price: "197.55",
    change: "3.14",
    changePercent: "+1.62%",
    time: "4:00 PM 01/17/25",
    postMarket: "$197.55 -0.65 (-0.33%) 7:59 PM"
  };

  // Company profile data
  const companyData = {
    sector: "Communication Services",
    address: "1600 Amphitheatre Parkway Mountain View, CA, 94043",
    phone: "650-253-0000",
    website: "abc.xyz",
    employees: "91,259",
    founded: "1998"
  };

  // Key stats data
  const keyStats = {
    "52 Week Range": "92.85 - 198.41",
    "Day Range": "196.85 - 198.41",
    "EPS (FWD)": "7.48",
    "P/E (FWD)": "24.78",
    "Beta": "0.94",
    "Div Yield": "0.00%",
    "Market Cap": "2.8T",
    "Prev Close": "$194.41"
  };

  // Chart data
  const chartData = Array(50).fill(0).map((_, i) => ({
    date: new Date(2023, i % 12, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    price: 150 + Math.random() * 50
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Navbar />
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-medium">{symbol} - Alphabet Inc.</h1>
                <div className="text-xs text-gray-500">Stock Price & Overview</div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-semibold">{stockData.price}</span>
                <span className="text-sm text-green-600">{stockData.change} ({stockData.changePercent})</span>
                <span className="text-xs text-gray-500">{stockData.time}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                NASDAQ | $URG | Post Market: {stockData.postMarket}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">1.34M followers</div>
              <button className="px-4 py-1 text-sm bg-black text-white rounded">Follow</button>
              <button className="px-4 py-1 text-sm bg-orange-500 text-white rounded">Analyze With AI</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 text-sm">
            {["Summary", "Ratings", "Financials", "Earnings", "Dividends", "Valuation", "Growth", "Profitability", "Momentum", "Peers", "Options", "Charting"].map((tab) => (
              <button key={tab} className="px-4 py-2 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600">
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 text-sm py-2">
            {["All", "Analysis", "Comments", "News", "Transcripts", "SEC Filings", "Press Releases", "Related Analysis", "Risks"].map((tab) => (
              <button key={tab} className="px-2 text-gray-600 hover:text-gray-900">
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="border rounded-lg">
            <div className="bg-[#1e3a8a] text-white p-3 font-medium">
              Insight statement: Report date, Ex-dividend date etc main news
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-6" />
                <h2 className="text-lg font-medium">GOOG Company Profile</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Sector</div>
                  <div className="text-blue-600">{companyData.sector}</div>
                </div>
                <div>
                  <div className="font-medium">Address</div>
                  <div>{companyData.address}</div>
                </div>
                <div>
                  <div className="font-medium">Phone Number</div>
                  <div>{companyData.phone}</div>
                </div>
                <div>
                  <div className="font-medium">Website</div>
                  <div className="text-blue-600">{companyData.website}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Chart */}
          <div className="border rounded-lg p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#4CAF50" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column */}
          <div className="border rounded-lg">
            <div className="bg-[#1e3a8a] text-white p-3 font-medium">
              Twitter followers, Growth Factor Facebook Followers
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(keyStats).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm text-gray-600">{key}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TickerDetail;