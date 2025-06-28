
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  symbol?: string;
}

const AIAnalysisDialog: React.FC<AIAnalysisDialogProps> = ({ isOpen, onClose, symbol }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">AI Analysis for {symbol}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-gray-400">AI analysis feature coming soon...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisDialog;
