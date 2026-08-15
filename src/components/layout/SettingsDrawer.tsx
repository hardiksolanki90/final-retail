import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  SlidersHorizontal,
  Percent,
  DollarSign,
  Landmark,
  Warehouse,
  Globe,
  MapPin,
  Home,
  Truck,
  Navigation,
  Tag,
  CreditCard,
  QrCode,
  Folder,
  Ruler,
  RefreshCw,
  HelpCircle,
  UserCheck,
  Download,
  Map,
  type LucideIcon,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { settingsMenu } from '../../data/menuData';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping for settings menu items
const iconMap: Record<string, LucideIcon> = {
  building: Building2,
  users: Users,
  sliders: SlidersHorizontal,
  percent: Percent,
  'dollar-sign': DollarSign,
  landmark: Landmark,
  warehouse: Warehouse,
  globe: Globe,
  'map-pin': MapPin,
  home: Home,
  truck: Truck,
  navigation: Navigation,
  tag: Tag,
  'credit-card': CreditCard,
  'qr-code': QrCode,
  folder: Folder,
  ruler: Ruler,
  'refresh-cw': RefreshCw,
  'help-circle': HelpCircle,
  'user-check': UserCheck,
  download: Download,
  map: Map,
};

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const location = useLocation();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Settings" width="w-80">
      <nav className="py-2">
        <ul className="space-y-1 px-3">
          {settingsMenu.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span
                  className={
                    isActive(item.path)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }
                >
                  {getIcon(item.icon)}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
