import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, AlertCircle, ChevronRight } from 'lucide-react';
import type { Order } from '../types';

const statusColors: Record<string, string> = {
  DRAFT_CART: 'bg-slate-100 text-slate-800',
  CHECKOUT_STARTED: 'bg-slate-100 text-slate-800',
  PRESCRIPTION_PENDING: 'bg-amber-100 text-amber-800',
  PRESCRIPTION_APPROVED: 'bg-green-100 text-green-800',
  PRESCRIPTION_REJECTED: 'bg-red-100 text-red-800',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CUSTOMER_CANCELLED: 'bg-red-100 text-red-800',
  ADMIN_CANCELLED: 'bg-red-100 text-red-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
};

export function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const storedIsAuth = (() => {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  })();

  const authenticated = isAuthenticated || storedIsAuth;

  const fetchOrders = () => {
    if (authenticated) {
      ordersApi.getOrders()
        .then((data) => {
           const userOrders = user?.id
            ? data.filter((order) => order.userId === user.id)
            : data;
          setOrders(userOrders);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [authenticated, user?.id]);

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/status?status=CUSTOMER_CANCELLED`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        success('Order cancelled successfully');
        fetchOrders();
      } else {
        showError('Failed to cancel order');
      }
    } catch (err) {
      showError('Failed to cancel order');
    }
  };

  if (!authenticated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view your orders</p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded skeleton mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl space-y-3">
              <div className="flex justify-between">
                <div className="h-6 w-32 bg-slate-200 rounded skeleton" />
                <div className="h-6 w-24 bg-slate-200 rounded-full skeleton" />
              </div>
              <div className="h-4 w-full bg-slate-200 rounded skeleton" />
              <div className="h-4 w-2/3 bg-slate-200 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">You have no orders yet</p>
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <p className="text-sm text-slate-500">
                  Ordered on: {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-slate-100'}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    {order.items.length} item(s) - ₹{order.grandTotal}
                  </p>
                  <p className="text-sm text-slate-500">{order.addressSnapshot}</p>
                </div>
                <div className="flex items-center gap-2">
                  {['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID'].includes(order.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelOrder(order.id!)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
