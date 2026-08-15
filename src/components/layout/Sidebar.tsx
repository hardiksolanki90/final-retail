import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  UserCog,
  Map,
  DollarSign,
  Gift,
  Percent,
  ShoppingCart,
  FileText,
  Layers,
  Briefcase,
  Archive,
  MessageCircle,
  Activity,
  Megaphone,
  LayoutGrid,
  Grid3X3,
  BookOpen,
  Cpu,
  Rocket,
  Shield,
  Clipboard,
  PieChart,
  Tag,
  TrendingUp,
  GitBranch,
  Flag,
  Settings,
  BarChart2,
  X,
  Target,
  Wallet,
  Truck,
  ClipboardList,
  FileCheck,
  Receipt,
  CalendarCheck,
  CheckCircle,
  Boxes,
  Undo,
  BarChart,
  Box,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Navigation,
  CheckSquare,
  GitCompare,
  CloudUpload,
  Warehouse,
  Building,
  UserCheck,
  Download,
  FileBarChart,
  type LucideIcon,
} from 'lucide-react';
import { sidebarMenu } from '../../data/menuData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Icon mapping for sidebar menu items
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  package: Package,
  'user-cog': UserCog,
  map: Map,
  'dollar-sign': DollarSign,
  gift: Gift,
  percent: Percent,
  'shopping-cart': ShoppingCart,
  'file-text': FileText,
  layers: Layers,
  briefcase: Briefcase,
  archive: Archive,
  'message-circle': MessageCircle,
  activity: Activity,
  megaphone: Megaphone,
  layout: LayoutGrid,
  grid: Grid3X3,
  'book-open': BookOpen,
  cpu: Cpu,
  rocket: Rocket,
  shield: Shield,
  clipboard: Clipboard,
  'pie-chart': PieChart,
  tag: Tag,
  'trending-up': TrendingUp,
  'git-branch': GitBranch,
  flag: Flag,
  settings: Settings,
  'bar-chart-2': BarChart2,
  // Sales Operations icons
  target: Target,
  wallet: Wallet,
  truck: Truck,
  'clipboard-list': ClipboardList,
  'file-check': FileCheck,
  receipt: Receipt,
  'calendar-check': CalendarCheck,
  'check-circle': CheckCircle,
  // Logistics icons
  boxes: Boxes,
  undo: Undo,
  'bar-chart': BarChart,
  box: Box,
  // Reports icons
  calendar: Calendar,
  phone: Phone,
  'map-pin': MapPin,
  clock: Clock,
  navigation: Navigation,
  'check-square': CheckSquare,
  'git-compare': GitCompare,
  'cloud-upload': CloudUpload,
  // Master Data icons
  warehouse: Warehouse,
  building: Building,
  'user-check': UserCheck,
  download: Download,
};

export function Sidebar({ isOpen, onClose, isCollapsed = false }: SidebarProps) {
  const location = useLocation();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}`}
      >
        {/* Logo Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Retail App
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarMenu.map((section) => (
            <div key={section.section} className="mb-2">
              {/* Section Caption */}
              {!isCollapsed && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.section}
                </div>
              )}

              {/* Section Items */}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                        isActive(item.path)
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : undefined}
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
                      {!isCollapsed && <span>{item.name}</span>}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Reports Section */}
          <div className="mb-2 mt-4">
            <ul className="space-y-1 px-2">
              <li>
                <Link
                  to="/reports"
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                    location.pathname.startsWith('/reports')
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? 'Reports' : undefined}
                >
                  <span
                    className={
                      location.pathname.startsWith('/reports')
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }
                  >
                    <FileBarChart className="w-5 h-5" />
                  </span>
                  {!isCollapsed && <span>Reports</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      Reports
                    </div>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
