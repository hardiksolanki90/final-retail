import { Bell, Check, Trash2 } from 'lucide-react';
import { Drawer } from '../ui/Drawer';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample notifications - replace with actual data
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Order Received',
    message: 'Order #12345 has been placed by John Doe',
    time: '5 min ago',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Payment of $1,234.56 has been received',
    time: '1 hour ago',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Low Stock Alert',
    message: 'Product SKU-789 is running low on stock',
    time: '2 hours ago',
    read: true,
    type: 'warning',
  },
  {
    id: '4',
    title: 'Order Cancelled',
    message: 'Order #12340 has been cancelled by customer',
    time: '3 hours ago',
    read: true,
    type: 'error',
  },
];

const getTypeDotColor = (type: Notification['type']) => {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };
  return colors[type];
};

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const unreadCount = sampleNotifications.filter((n) => !n.read).length;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications" width="w-96">
      <div className="flex flex-col h-full">
        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-secondary)]">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button className="p-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {sampleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Bell className="w-12 h-12 text-[var(--text-muted)] mb-4" />
              <p className="text-[var(--text-secondary)]">No notifications yet</p>
              <p className="text-sm text-[var(--text-muted)]">
                We'll notify you when something arrives
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {sampleNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                    !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getTypeDotColor(notification.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {notification.title}
                        </p>
                        <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </button>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)]">
          <button className="w-full py-2 text-sm text-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </Drawer>
  );
}
