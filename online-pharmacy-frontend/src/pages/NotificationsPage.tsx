import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CreditCard, Truck, Package, AlertCircle } from 'lucide-react';
import { ordersApi } from '../api/orders';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const typeColors: Record<string, string> = {
  PAYMENT: 'bg-orange-100 text-orange-800',
  DELIVERY: 'bg-blue-100 text-blue-800',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const orders = await ordersApi.getOrders();
      const notificationItems: any[] = [];
      
      if (orders && orders.length > 0) {
        orders.forEach((order: any) => {
          if (order.paymentStatus && order.paymentStatus !== 'SUCCESS') {
            notificationItems.push({
              id: `${order.id}-payment`,
              type: 'PAYMENT',
              title: 'Payment Update',
              message: `Payment ${order.paymentStatus} for Order #${order.id}`,
              orderId: order.id,
              status: order.paymentStatus,
              createdAt: order.orderedAt,
              isRead: order.paymentStatus === 'SUCCESS'
            });
          }
          if (order.status) {
            notificationItems.push({
              id: `${order.id}-status`,
              type: 'DELIVERY',
              title: 'Delivery Update',
              message: `Order #${order.id} is ${order.status.replace('_', ' ')}`,
              orderId: order.id,
              status: order.status,
              createdAt: order.orderedAt,
              isRead: order.status === 'DELIVERED'
            });
          }
        });
      }
      setNotifications(notificationItems);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <p className="text-sm text-slate-500">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Bell className="h-16 w-16 text-slate-300" />
          <p className="text-lg text-slate-600">No notifications yet</p>
          <p className="text-sm text-slate-400">You'll see order updates here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Link key={notification.id} to={`/orders/${notification.orderId}`}>
              <Card className={`hover:shadow-md transition-shadow ${notification.isRead ? 'opacity-60' : ''}`}>
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    notification.type === 'PAYMENT' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    {notification.type === 'PAYMENT' ? (
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Truck className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          typeColors[notification.type] || 'bg-slate-100'
                        }`}
                      >
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <h3 className="mt-1 font-medium">{notification.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  {notification.status === 'PENDING' || notification.status === 'PACKED' ? (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}