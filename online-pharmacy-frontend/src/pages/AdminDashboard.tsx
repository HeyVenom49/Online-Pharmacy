import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, ShoppingCart, Pill, Users, DollarSign, TrendingUp, Plus, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalMedicines: number;
  lowStockItems: number;
  statusBuckets?: Array<{ label: string; value: number; color: string }>;
  revenueSeries?: Array<{ label: string; value: number }>;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const storedIsAuth = (() => {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  })();

  const storedUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const authenticated = isAuthenticated || storedIsAuth;
  const currentUser = user || storedUser;

  useEffect(() => {
    if (authenticated && currentUser?.role === 'ADMIN') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [authenticated, currentUser]);

const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, medicinesRes] = await Promise.all([
        fetch('/internal/orders', { headers }).then(r => r.json()),
        fetch('/api/catalog/medicines?page=0&size=100', { headers }).then(r => r.json())
      ]);

      const orders = Array.isArray(ordersRes) ? ordersRes : 
                    Array.isArray(ordersRes?.content) ? ordersRes.content :
                    Array.isArray(ordersRes?.data) ? ordersRes.data : [];
      const medicines = Array.isArray(medicinesRes) ? medicinesRes :
                      Array.isArray(medicinesRes?.content) ? medicinesRes.content :
                      Array.isArray(medicinesRes?.data) ? medicinesRes.data : [];

      const completedOrders = orders.filter((o: any) =>
        ['DELIVERED', 'CUSTOMER_CANCELLED', 'ADMIN_CANCELLED'].includes(o.status)
      ).length;
      const pendingOrders = orders.filter((o: any) => 
        ['CHECKOUT_STARTED', 'PAYMENT_PENDING', 'PAID', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)
      ).length;
      const totalRevenue = orders
        .filter((o: any) => o.status === 'DELIVERED')
        .reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
      const lowStockItems = medicines.filter((m: any) => m.stock < 20).length;
      const statusBuckets = [
        { label: 'Pending', value: pendingOrders, color: '#f59e0b' },
        { label: 'Completed', value: completedOrders, color: '#22c55e' },
        {
          label: 'Cancelled',
          value: orders.filter((o: any) => ['CUSTOMER_CANCELLED', 'ADMIN_CANCELLED'].includes(o.status)).length,
          color: '#ef4444'
        },
      ];
      const revenueSeries = Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - idx));
        const monthLabel = d.toLocaleString('en-US', { month: 'short' });
        const month = d.getMonth();
        const year = d.getFullYear();
        const monthRevenue = orders
          .filter((o: any) => {
            if (!o.orderedAt || o.status !== 'DELIVERED') return false;
            const od = new Date(o.orderedAt);
            return od.getMonth() === month && od.getFullYear() === year;
          })
          .reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
        return { label: monthLabel, value: monthRevenue };
      });

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalMedicines: medicines.length,
        lowStockItems,
        statusBuckets,
        revenueSeries,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Users className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view admin dashboard</p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-16 w-16 text-red-300" />
        <p className="text-lg text-slate-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {currentUser?.name || 'Admin'}!</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/medicines">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              View Orders
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Orders - Gradient Card */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Orders</p>
              <p className="mt-1 text-3xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">↗ All time orders</p>
        </div>
      
        {/* Pending Orders */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Pending</p>
              <p className="mt-1 text-3xl font-bold">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">⌚ Awaiting processing</p>
        </div>
      
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Revenue</p>
              <p className="mt-1 text-3xl font-bold">₹{stats?.totalRevenue?.toFixed(0) || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">↗ From delivered orders</p>
        </div>
      
        {/* Total Medicines */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Medicines</p>
              <p className="mt-1 text-3xl font-bold">{stats?.totalMedicines || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Pill className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">📦 Active products</p>
        </div>
      
        {/* Low Stock Alert */}
        <div className={`rounded-xl p-6 shadow-lg ${stats?.lowStockItems ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-slate-500 to-slate-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Low Stock</p>
              <p className="mt-1 text-3xl font-bold">{stats?.lowStockItems || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">
            {stats?.lowStockItems ? '⚠ Needs attention!' : '✓ All well stocked'}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.revenueSeries || []).map((point) => {
                const max = Math.max(...(stats?.revenueSeries || [{ value: 1 }]).map((p) => p.value), 1);
                const width = `${Math.max(8, (point.value / max) * 100)}%`;
                return (
                  <div key={point.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{point.label}</span>
                      <span>₹{point.value.toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up animation-delay-100">
          <CardHeader>
            <CardTitle className="text-base">Order Status Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.statusBuckets || []).map((bucket) => {
                const total = (stats?.totalOrders || 1);
                const width = `${Math.max(6, (bucket.value / total) * 100)}%`;
                return (
                  <div key={bucket.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{bucket.label}</span>
                      <span>{bucket.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width, backgroundColor: bucket.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/medicines" className="block">
            <Card className="transition-all duration-200 hover:shadow-card-hover cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <Pill className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Manage Medicines</p>
                  <p className="text-sm text-slate-500">Add, edit, or remove medicines</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/orders" className="block">
            <Card className="transition-all duration-200 hover:shadow-card-hover cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Process Orders</p>
                  <p className="text-sm text-slate-500">View and update order status</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/medicines/add" className="block">
            <Card className="transition-all duration-200 hover:shadow-card-hover cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Add New Medicine</p>
                  <p className="text-sm text-slate-500">Expand your inventory</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}