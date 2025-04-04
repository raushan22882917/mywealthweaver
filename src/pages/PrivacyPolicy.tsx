
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, User, Lock, Database, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex justify-center items-center px-6 mt-16 mb-16">
        <Card className="max-w-3xl w-full bg-gray-800 border-gray-700 shadow-lg rounded-xl p-6">
          <CardHeader className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-green-400" />
            <CardTitle className="text-lg font-semibold">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300 text-sm">
            <p>
              Your privacy is important to us. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our services.
            </p>

            {/* Information We Collect */}
            <div className="flex items-start space-x-3">
              <User className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-200">1. Information We Collect</h3>
                <p>
                  We collect personal information such as your name, email address, and usage data to 
                  enhance your experience.
                </p>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-yellow-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-200">2. How We Use Your Information</h3>
                <p>
                  We use your data to personalize your experience, improve our platform, and ensure security.
                </p>
              </div>
            </div>

            {/* Data Protection */}
            <div className="flex items-start space-x-3">
              <Lock className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-200">3. Data Protection</h3>
                <p>
                  We implement strict security measures to protect your personal data from unauthorized access.
                </p>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="flex items-start space-x-3">
              <Database className="h-6 w-6 text-purple-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-200">4. Data Sharing</h3>
                <p>
                  We do not sell or share your personal data with third parties, except when required by law.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-md font-semibold text-gray-200">5. Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal data at any time.
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-xs">Last updated: February 2025</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
