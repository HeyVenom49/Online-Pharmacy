import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { Package, MapPin, CreditCard, ArrowLeft, CheckCircle, Truck, Box, Wallet, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
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

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  CARD: 'Card',
  UPI: 'UPI',
  WALLET: 'Wallet',
};

const trackingSteps = [
  { key: 'ORDERED', label: 'Order Placed', icon: Package },
  { key: 'PAID', label: 'Payment Confirmed', icon: Wallet },
  { key: 'PACKED', label: 'Order Packed', icon: Box },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();
  const { user, token } = useAuthStore();

  const isAdmin = (() => {
    if (user?.role === 'ADMIN') return true;
    const tokenStr = token || localStorage.getItem('token');
    if (!tokenStr) return false;
    try {
      const base64 = tokenStr.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload.role === 'ADMIN';
    } catch {
      return false;
    }
  })();

  const fetchOrder = async () => {
    if (!orderId) { setLoading(false); return; }
    const id = parseInt(orderId);
    const authToken = token || localStorage.getItem('token');
    if (!authToken) { setLoading(false); return; }

    try {
      setLoading(true);
      const endpoint = isAdmin ? `/internal/orders/${id}` : `/api/orders/${id}`;
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrder((data.data?.data || data.data || data) as Order);
      }
    } catch {
      // Silently handle order fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId, isAdmin]);

  if (!token && !localStorage.getItem('token')) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view order details</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded skeleton mb-6" />
        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded skeleton" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-16 bg-slate-200 rounded skeleton" />
            <div className="h-16 bg-slate-200 rounded skeleton" />
            <div className="h-16 bg-slate-200 rounded skeleton" />
            <div className="h-16 bg-slate-200 rounded skeleton" />
          </div>
          <div className="h-32 bg-slate-200 rounded skeleton" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Order not found</p>
        <Link to={isAdmin ? "/admin/orders" : "/orders"}>
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const payment = order.payment;
  const paymentStatus = payment?.status || 'PENDING';
  const paymentMethod = payment?.paymentMethod || '';

  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'pending' => {
    const statusMap: Record<string, string> = {
      'ORDERED': 'CHECKOUT_STARTED',
      'PAID': 'PAID',
      'PACKED': 'PACKED',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
    };
    const stepStatus = statusMap[stepKey];
    const statusOrder = ['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(stepStatus);
    if (stepIdx < 0) return 'pending';
    if (order.status === 'CUSTOMER_CANCELLED' || order.status === 'ADMIN_CANCELLED') return 'pending';
    if (currentIdx >= stepIdx) return 'completed';
    if (currentIdx === stepIdx - 1) return 'current';
    return 'pending';
  };

  const downloadInvoice = () => {
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) return;
    const rows = items
      .map(
        (item) =>
          `<tr><td>${item.medicineName}</td><td>${item.quantity}</td><td>₹${item.unitPrice}</td><td>₹${item.subtotal}</td></tr>`
      )
      .join('');
    popup.document.write(`
      <html>
        <head><title>Invoice #${order.id}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>PharmaCare Invoice</h2>
          <p><strong>Order:</strong> #${order.id}</p>
          <p><strong>Date:</strong> ${order.orderedAt ? new Date(order.orderedAt).toLocaleString() : '-'}</p>
          <p><strong>Address:</strong> ${order.addressSnapshot || '-'}</p>
          <table border="1" cellspacing="0" cellpadding="8" width="100%" style="border-collapse:collapse; margin-top:12px;">
            <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="margin-top:16px;">Grand Total: ₹${order.grandTotal || 0}</h3>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Link to={isAdmin ? "/admin/orders" : "/orders"} className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadInvoice}>
            <Download className="mr-1 h-4 w-4" />
            Invoice
          </Button>
          <button onClick={fetchOrder} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 rotate-180" />
            Refresh
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order #{order.id}</CardTitle>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-slate-100'}`}>
              {order.status?.replace('_', ' ') || 'Unknown'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Tracking Timeline */}
          {!['DRAFT_CART', 'CUSTOMER_CANCELLED', 'ADMIN_CANCELLED'].includes(order.status) && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-4">Order Tracking</h3>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === 'completed' ? 'bg-green-100 text-green-600' :
                          status === 'current' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        {index < trackingSteps.length - 1 && (
                          <div className={`w-0.5 flex-1 ${status === 'completed' ? 'bg-green-300' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-medium ${
                          status === 'completed' || status === 'current' ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                        {status === 'current' && order.updatedAt && (
                          <p className="text-xs text-slate-500">
                            {new Date(order.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Order Date</h3>
              <p>{order.orderedAt ? new Date(order.orderedAt).toLocaleString() : '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Total Amount</h3>
              <p className="font-semibold">₹{order.totalAmount || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Delivery Fee</h3>
              <p>₹{order.deliveryFee || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Grand Total</h3>
              <p className="font-semibold">₹{order.grandTotal || 0}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Delivery Address</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <p>{order.addressSnapshot || 'Not specified'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Payment</h3>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <p>{paymentMethodLabels[paymentMethod] || paymentMethod || 'Not specified'}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${
                paymentStatus === 'SUCCESS' ? 'bg-green-500' :
                paymentStatus === 'FAILED' ? 'bg-red-500' :
                'bg-amber-500'
              }`} />
              <p className={`text-sm font-medium ${
                paymentStatus === 'SUCCESS' ? 'text-green-600' :
                paymentStatus === 'FAILED' ? 'text-red-600' :
                'text-amber-600'
              }`}>
                {paymentStatus}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Items ({items.length})</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                  </div>
                  <p className="font-semibold">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Admin Actions</h3>
              <div className="flex flex-wrap gap-2">
                {order.status === 'CHECKOUT_STARTED' && (
                  <Button size="sm" onClick={async () => {
                    const res = await fetch(`/api/orders/${order.id}/status?status=PAYMENT_PENDING`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Status updated'); fetchOrder(); }
                    else showError('Failed to update status');
                  }}>Start Payment</Button>
                )}
                {order.status === 'PAYMENT_PENDING' && (
                  <Button size="sm" onClick={async () => {
                    const res = await fetch(`/api/orders/${order.id}/status?status=PAID`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Marked as PAID'); fetchOrder(); }
                    else showError('Failed to update status');
                  }}>Mark Paid</Button>
                )}
                {order.status === 'PAID' && (
                  <Button size="sm" onClick={async () => {
                    const res = await fetch(`/api/orders/${order.id}/status?status=PACKED`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Marked as PACKED'); fetchOrder(); }
                    else showError('Failed to update status');
                  }}>Mark Packed</Button>
                )}
                {order.status === 'PACKED' && (
                  <Button size="sm" onClick={async () => {
                    const res = await fetch(`/api/orders/${order.id}/status?status=OUT_FOR_DELIVERY`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Marked as OUT FOR DELIVERY'); fetchOrder(); }
                    else showError('Failed to update status');
                  }}>Out for Delivery</Button>
                )}
                {order.status === 'OUT_FOR_DELIVERY' && (
                  <Button size="sm" onClick={async () => {
                    const res = await fetch(`/api/orders/${order.id}/status?status=DELIVERED`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Marked as DELIVERED'); fetchOrder(); }
                    else showError('Failed to update status');
                  }}>Mark Delivered</Button>
                )}
                {['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID'].includes(order.status) && (
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm('Are you sure you want to cancel this order?')) return;
                    const res = await fetch(`/api/orders/${order.id}/status?status=ADMIN_CANCELLED`, {
                      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) { success('Order cancelled'); fetchOrder(); }
                    else showError('Failed to cancel order');
                  }}>Cancel Order</Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">Last updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
