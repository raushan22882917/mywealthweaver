
import { FC } from "react";
import { Gift, Flag, PartyPopper, Calendar } from "lucide-react";

interface Holiday {
  name: string;
  date: string;
  icon: any;
  description?: string;
  type: 'federal' | 'market' | 'observance';
}

interface HolidayCalendarCellProps {
  date: Date;
  holiday: Holiday | null;
  isCurrentWeek: boolean;
  children?: React.ReactNode;
}

const holidays: Holiday[] = [
  {
    name: "New Year's Day",
    date: "2024-01-01",
    icon: PartyPopper,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Martin Luther King Jr. Day",
    date: "2024-01-15",
    icon: Flag,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Presidents Day",
    date: "2024-02-19",
    icon: Flag,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Good Friday",
    date: "2024-03-29",
    icon: Calendar,
    type: 'market',
    description: "Markets Closed"
  },
  {
    name: "Memorial Day",
    date: "2024-05-27",
    icon: Flag,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Juneteenth",
    date: "2024-06-19",
    icon: Flag,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Independence Day",
    date: "2024-07-04",
    icon: PartyPopper,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Labor Day",
    date: "2024-09-02",
    icon: Flag,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Thanksgiving Day",
    date: "2024-11-28",
    icon: Gift,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  },
  {
    name: "Christmas Day",
    date: "2024-12-25",
    icon: Gift,
    type: 'federal',
    description: "Markets Closed - Federal Holiday"
  }
];

export const isHoliday = (date: Date): Holiday | null => {
  const formattedDate = date.toISOString().split('T')[0];
  return holidays.find(holiday => holiday.date === formattedDate) || null;
};

const HolidayCalendarCell: FC<HolidayCalendarCellProps> = ({ 
  date, 
  holiday,
  isCurrentWeek,
  children 
}) => {
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div
      className={`min-h-[220px] w-full border dark:border-gray-800 p-3 rounded-lg transition-all duration-200 ${
        holiday ? 'bg-gradient-to-br from-red-50/30 to-red-100/30 dark:from-red-900/20 dark:to-red-800/20' :
        isCurrentWeek ? 'bg-yellow-50/50 dark:bg-yellow-900/20' :
        isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' :
        'bg-white/50 dark:bg-gray-900/50'
      }`}
    >
      {/* Date Header */}
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <span className={holiday ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
          {date.getDate()}
        </span>
      </div>

      {/* Holiday Display */}
      {holiday && (
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-800/50 mb-2">
            {holiday.icon && <holiday.icon className="w-5 h-5 text-red-600 dark:text-red-400" />}
          </div>
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 text-center mb-1">
            {holiday.name}
          </h4>
          <p className="text-xs text-red-500/80 dark:text-red-400/80 text-center">
            {holiday.description}
          </p>
        </div>
      )}

      {/* Render children (stocks or other content) */}
      {children}
    </div>
  );
};

export default HolidayCalendarCell;
