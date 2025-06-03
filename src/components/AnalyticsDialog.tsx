
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart as LineChartIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueChartData: any[];
}

const AnalyticsDialog: React.FC<AnalyticsDialogProps> = ({
  open,
  onOpenChange,
  revenueChartData
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[70vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-blue-400" />
            Analytics Overview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Revenue Analysis */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-blue-400" />
                Revenue Analysis
              </CardTitle>
              <CardDescription>Revenue estimates in billions USD</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <XAxis dataKey="symbol" tick={{fill: '#9ca3af'}} />
                  <YAxis tick={{fill: '#9ca3af'}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <Tooltip 
                    formatter={(value) => [`$${value}B`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="High" fill="#ef4444" name="High Estimate" />
                  <Bar dataKey="Average" fill="#14b8a6" name="Average" />
                  <Bar dataKey="Low" fill="#10b981" name="Low Estimate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsDialog;
