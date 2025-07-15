import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DividendCalendar from "@/components/DividendCalendar";

const Reporting: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <DividendCalendar />
      </main>
      <Footer />
    </div>
  );
};

export default Reporting;
