import { BarChart2, LineChart, Search, BookOpen } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    title: "Real-Time Data",
    description: "Access live market data and stock quotes from global exchanges."
  },
  {
    icon: LineChart,
    title: "Technical Analysis",
    description: "Advanced charting tools with multiple technical indicators."
  },
  {
    icon: Search,
    title: "Stock Screening",
    description: "Filter stocks based on fundamental and technical criteria."
  },
  {
    icon: BookOpen,
    title: "Market Research",
    description: "In-depth analysis and research from market experts."
  }
];

const Features = () => {
  return (
    <div className="container mx-auto px-4 py-16  text-white">
      <h2 className="text-3xl font-bold text-center text-green-500 mb-12">
        Powerful Tools for Smart Investing
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow transform hover:scale-105"
          >
            <feature.icon className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
