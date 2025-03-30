import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Target, Users, Rocket } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About IntelligentInvestor+</h1>
          
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold">Our Company</h2>
              </div>
              <p className="text-lg text-muted-foreground">
              At Intelligent Investor+, we are dedicated to empowering individuals to make smarter investment decisions. We leverage cutting-edge data analytics and expert-driven insights to provide a comprehensive platform for long-term investors. By combining advanced technology with in-depth financial expertise, we simplify complex market data into actionable recommendations and curated stock lists, enabling our users to achieve their financial goals with confidence. Our team of financial analysts, data scientists, and investment strategists is passionate about transforming the way people invest. We believe that long-term investing is the key to building sustainable wealth, and we are committed to providing tools and resources that make this journey both accessible and rewarding for investors of all experience levels.</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground">
              To deliver reliable, transparent, data-driven insights and personalized recommendations that empower investors to build long-term wealth with confidence. We aim to demystify the complexities of the financial markets, offering clarity and actionable strategies to help our users achieve their investment goals.</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold">Our Values</h2>
              </div>
              <ul className="list-disc list-inside text-lg text-muted-foreground space-y-2">
                <li>Transparency in all our operations</li>
                <li>Commitment to user privacy and data security</li>
                <li>Continuous innovation and improvement</li>
                <li>Educational empowerment for all investors</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <Rocket className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold">Our Vision</h2>
              </div>
              <p className="text-lg text-muted-foreground">
              A trusted partner for long-term investors worldwide, fostering financial literacy and enabling wealth creation through innovative, transparent, and user-focused solutions. We envision a future where informed investing becomes the cornerstone of financial independence for individuals across the globe.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;