
import React from 'react';
import { Announcement } from '@/utils/dividend';
import { Bell } from 'lucide-react';

interface StockAnnouncementCardProps {
  announcement: Announcement;
}

const StockAnnouncementCard: React.FC<StockAnnouncementCardProps> = ({ announcement }) => {
  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {announcement.header}
        </span>
      </div>
      <p className="text-sm text-blue-800 dark:text-blue-200">
        {announcement.message}
      </p>
      <div className="mt-2 flex justify-between items-center text-xs">
        <span className="text-blue-600 dark:text-blue-400">{announcement.date}</span>
        <span className="font-medium bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded-full text-blue-700 dark:text-blue-300">
          ${announcement.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default StockAnnouncementCard;
