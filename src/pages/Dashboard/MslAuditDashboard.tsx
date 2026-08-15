import { useState } from 'react';
import {
  Target,
  Store,
  Route,
  CalendarClock,
  LayoutGrid,
  ClipboardCheck,
  Trophy,
  ShieldCheck,
  Eye,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const merchandiserOptions = [
  { value: '', label: 'All Merchandisers' },
  { value: 'ahmed', label: 'Ahmed Al-Hassan' },
  { value: 'mohammed', label: 'Mohammed Reza' },
  { value: 'khalid', label: 'Khalid Omar' },
  { value: 'richard', label: 'Richard Musinguzi' },
  { value: 'abdallah', label: 'Abdallah Mohammad' },
];

const selectOptions = [
  { value: '', label: 'Select Options' },
  { value: 'region', label: 'By Region' },
  { value: 'route', label: 'By Route' },
  { value: 'channel', label: 'By Channel' },
];

interface KpiCard {
  title: string;
  value: string;
  description: string;
  valueColor: 'red' | 'green' | 'orange' | 'default';
  icon: React.ReactNode;
  type: 'metric';
}

interface PerformanceCard {
  title: string;
  name: string;
  score?: string;
  valueColor: 'green' | 'red' | 'orange' | 'default';
  icon: React.ReactNode;
  type: 'performance';
}

interface AuditCard {
  title: string;
  value: string;
  valueColor: 'green' | 'orange' | 'default';
  icon: React.ReactNode;
  type: 'audit';
}

type CardData = KpiCard | PerformanceCard | AuditCard;

const row1: CardData[] = [
  {
    title: 'Coverage',
    value: '0.21%',
    description: 'Weekly planned & unplanned visits based on set outlets visit frequency',
    valueColor: 'red',
    icon: <Target className="w-6 h-6" />,
    type: 'metric',
  },
  {
    title: 'Active Outlets',
    value: '1353',
    description: 'Where at least one invoice was made from a visit this month',
    valueColor: 'green',
    icon: <Store className="w-6 h-6" />,
    type: 'metric',
  },
  {
    title: 'Journey Plan Compliance',
    value: '0.22%',
    description: 'Compliance to route plan',
    valueColor: 'orange',
    icon: <Route className="w-6 h-6" />,
    type: 'metric',
  },
];

const row2: CardData[] = [
  {
    title: 'Visit Frequency',
    value: '287',
    description: 'Visit frequency per outlet',
    valueColor: 'green',
    icon: <CalendarClock className="w-6 h-6" />,
    type: 'metric',
  },
  {
    title: 'Share Of Shelf',
    value: '0%',
    description: 'Share Of Shelf',
    valueColor: 'default',
    icon: <LayoutGrid className="w-6 h-6" />,
    type: 'metric',
  },
  {
    title: 'MSL Compliance',
    value: '0%',
    description: 'MSL Compliance',
    valueColor: 'default',
    icon: <ClipboardCheck className="w-6 h-6" />,
    type: 'metric',
  },
];

const row3: CardData[] = [
  {
    title: 'Top Performance',
    name: 'Richard Musinguzi',
    score: '20%',
    valueColor: 'green',
    icon: <Trophy className="w-6 h-6" />,
    type: 'performance',
  },
  {
    title: 'MSL Audit',
    value: '85.14',
    valueColor: 'green',
    icon: <ShieldCheck className="w-6 h-6" />,
    type: 'audit',
  },
  {
    title: 'OSA Audit',
    value: '89.54',
    valueColor: 'green',
    icon: <Eye className="w-6 h-6" />,
    type: 'audit',
  },
];

const row4: CardData[] = [
  {
    title: 'Lower Performance',
    name: 'Abdallah Mohammad',
    valueColor: 'red',
    icon: <TrendingDown className="w-6 h-6" />,
    type: 'performance',
  },
];

const valueColorMap: Record<string, string> = {
  red: 'text-red-600',
  green: 'text-green-600',
  orange: 'text-amber-500',
  default: 'text-gray-700 dark:text-gray-300',
};

const iconBgMap: Record<string, string> = {
  red: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  green: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
  orange: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400',
  default: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function KpiCardComponent({ card }: { card: CardData }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${iconBgMap[card.valueColor]}`}>
          {card.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            {card.title}
          </p>

          {card.type === 'metric' && (
            <>
              <p className={`text-2xl font-bold mt-1 ${valueColorMap[card.valueColor]}`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {card.description}
              </p>
            </>
          )}

          {card.type === 'performance' && (
            <>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {card.name}
              </p>
              {card.score && (
                <p className={`text-sm font-semibold mt-0.5 ${valueColorMap[card.valueColor]}`}>
                  Score: {card.score}
                </p>
              )}
            </>
          )}

          {card.type === 'audit' && (
            <p className={`text-2xl font-bold mt-1 ${valueColorMap[card.valueColor]}`}>
              {card.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MslAuditDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchandising – Reach-mslAudit
        </h2>
        <span className="text-xs text-gray-400">
          Last Reload Date: 12/12/2020
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-end gap-3">
          <div className="w-full md:w-auto md:flex-1">
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Select
              label="Merchandiser"
              options={merchandiserOptions}
              value={merchandiser}
              onChange={(e) => setMerchandiser(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Select
              label="Select Options"
              options={selectOptions}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
          </div>
          <Button size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Submit
          </Button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {row1.map((card) => (
          <KpiCardComponent key={card.title} card={card} />
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {row2.map((card) => (
          <KpiCardComponent key={card.title} card={card} />
        ))}
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {row3.map((card) => (
          <KpiCardComponent key={card.title} card={card} />
        ))}
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {row4.map((card) => (
          <KpiCardComponent key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
