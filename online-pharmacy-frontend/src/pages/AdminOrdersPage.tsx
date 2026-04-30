import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, AlertCircle, ChevronRight, ArrowLeft, Search } from 'lucide-react';
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

const paymentDecisionStyles: Record<string, string> = {
  SUCCESS: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  FAILED: 'text-red-700 bg-red-50 border-red-200',
  CANCELLED: 'text-amber-700 bg-amber-50 border-amber-200',
  REFUNDED: 'text-indigo-700 bg-indigo-50 border-indigo-200',
};

export function AdminOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userEmails, setUserEmails] = useState<Record<number, string>>({});
  const [paymentDecisions, setPaymentDecisions] = useState<Record<number, string>>({});

  const storedIsAuth = !!localStorage.getItem('token');
  const authenticated = isAuthenticated || storedIsAuth;

  const fetchOrders = async () => {
    if (!authenticated) { setLoading(false); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/internal/orders?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const fetchedOrders = (data.content || data.data || data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
      setOrders(fetchedOrders);

      // Fetch user emails
      const numericUserIds = (fetchedOrders as any[])
        .map((o) => Number(o.userId))
        .filter((id) => Number.isFinite(id) && id > 0) as number[];
      const userIds = Array.from(new Set<number>(numericUserIds));
      for (const userId of userIds) {
        const emailKey = Number(userId);
        try {
          const res = await fetch(`/internal/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await res.json();
          setUserEmails(prev => ({ ...prev, [emailKey]: userData.email || `User #${userId}` }));
        } catch {
          setUserEmails(prev => ({ ...prev, [emailKey]: `User #${userId}` }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders?page=0&size=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders((Array.isArray(data) ? data : data.data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0)));
      } catch (err2) {
        console.error('Failed to fetch orders (fallback):', err2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [authenticated]);

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'ALL') {
      const activeStatuses = ['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID', 'PACKED', 'OUT_FOR_DELIVERY'];
      const completedStatuses = ['DELIVERED'];
      const cancelledStatuses = ['CUSTOMER_CANCELLED', 'ADMIN_CANCELLED'];
      if (statusFilter === 'ACTIVE' && !activeStatuses.includes(order.status)) return false;
      if (statusFilter === 'COMPLETED' && !completedStatuses.includes(order.status)) return false;
      if (statusFilter === 'CANCELLED' && !cancelledStatuses.includes(order.status)) return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const userEmail = userEmails[order.userId]?.toLowerCase() || '';
    return order.id?.toString().includes(query) ||
      order.userId?.toString().includes(query) ||
      userEmail.includes(query) ||
      order.status?.toLowerCase().includes(query);
  });

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/status?status=CUSTOMER_CANCELLED`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { success('Order cancelled successfully'); fetchOrders(); }
      else showError('Failed to cancel order');
    } catch {
      showError('Failed to cancel order');
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, successMessage: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        success(successMessage);
        fetchOrders();
      } else {
        showError('Failed to update order status');
      }
    } catch {
      showError('Failed to update order status');
    }
  };

  const handlePaymentDecision = async (orderId: number) => {
    const decision = paymentDecisions[orderId];
    if (!decision) {
      showError('Select a payment result first');
      return;
    }
    const statusMap: Record<string, string> = {
      SUCCESS: 'PAID',
      FAILED: 'PAYMENT_FAILED',
      CANCELLED: 'ADMIN_CANCELLED',
      REFUNDED: 'REFUND_COMPLETED',
    };
    const targetStatus = statusMap[decision];
    if (!targetStatus) {
      showError('Invalid payment decision');
      return;
    }
    await updateOrderStatus(orderId, targetStatus, `Payment marked as ${decision}`);
  };

  if (!authenticated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view orders</p>
        <Link to="/login"><Button>Login</Button></Link>
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

  const statusTabs = [
    { key: 'ALL', label: 'All', count: orders.length },
    { key: 'ACTIVE', label: 'Active', count: orders.filter(o => ['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)).length },
    { key: 'COMPLETED', label: 'Completed', count: orders.filter(o => o.status === 'DELIVERED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => ['CUSTOMER_CANCELLED', 'ADMIN_CANCELLED'].includes(o.status)).length },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, email, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Package className="h-16 w-16 text-slate-300" />
          <p className="text-lg text-slate-600">No orders found</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-700">{userEmails[order.userId] || `User #${order.userId}`}</p>
                        <p className="text-xs text-slate-500">ID: {order.userId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 font-medium">₹{order.grandTotal}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-slate-100'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {order.status === 'PAYMENT_PENDING' && (
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                            <select
                              value={paymentDecisions[order.id!] || ''}
                              onChange={(e) =>
                                setPaymentDecisions((prev) => ({ ...prev, [order.id!]: e.target.value }))
                              }
                              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors ${
                                paymentDecisions[order.id!]
                                  ? paymentDecisionStyles[paymentDecisions[order.id!]]
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <option value="">Payment Result</option>
                              <option value="SUCCESS">SUCCESS</option>
                              <option value="FAILED">FAILED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                            <Button
                              size="sm"
                              className="h-8 px-3"
                              onClick={() => handlePaymentDecision(order.id!)}
                              disabled={!paymentDecisions[order.id!]}
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                        {['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID'].includes(order.status) && (
                          <Button size="sm" variant="destructive" onClick={() => cancelOrder(order.id!)}>
                            Cancel
                          </Button>
                        )}
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {filteredOrders.map(order => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {userEmails[order.userId] || `User #${order.userId}`} • {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : 'In progress'}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-slate-100'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-slate-600">{order.items?.length || 0} item(s) - ₹{order.grandTotal}</p>
                    <p className="text-sm text-slate-500 truncate">{order.addressSnapshot}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PAYMENT_PENDING' && (
                      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Confirm Payment
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={paymentDecisions[order.id!] || ''}
                            onChange={(e) =>
                              setPaymentDecisions((prev) => ({ ...prev, [order.id!]: e.target.value }))
                            }
                            className={`flex-1 rounded-md border px-2.5 py-2 text-xs font-medium outline-none transition-colors ${
                              paymentDecisions[order.id!]
                                ? paymentDecisionStyles[paymentDecisions[order.id!]]
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <option value="">Select Payment Result</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="FAILED">FAILED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </select>
                          <Button
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => handlePaymentDecision(order.id!)}
                            disabled={!paymentDecisions[order.id!]}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                    {['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID'].includes(order.status) && (
                      <Button size="sm" variant="destructive" onClick={() => cancelOrder(order.id!)}>
                        Cancel
                      </Button>
                    )}
                    <Link to={`/orders/${order.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
