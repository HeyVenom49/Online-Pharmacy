import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Edit, Package, HeartPulse, MapPin, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { User as UserType } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { ordersApi } from '../api/orders';
import { useUserPrefsStore } from '../store/userPrefsStore';

export function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) as UserType : null;
    } catch {
      return null;
    }
  })();

  const displayUser = user || storedUser;
  const authenticated = isAuthenticated || !!storedUser;
  const { wishlistIds } = useUserPrefsStore();
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!authenticated || !displayUser || displayUser.role === 'ADMIN') return;
    ordersApi.getOrders().then((orders: any[]) => {
      const myOrders = orders.filter((o) => o.userId === displayUser.id);
      setOrderCount(myOrders.length);
      const spent = myOrders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      setTotalSpent(spent);
    }).catch(() => null);
  }, [authenticated, displayUser?.id, displayUser?.role]);

  const memberSince = useMemo(() => {
    const key = `memberSince:${displayUser?.id}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const now = new Date().toISOString();
    localStorage.setItem(key, now);
    return now;
  }, [displayUser?.id]);

  if (!authenticated || !displayUser) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <User className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view your profile</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/profile/edit')}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {displayUser.role !== 'ADMIN' && (
          <Card className="md:col-span-2 animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Orders</p>
                  <p className="text-lg font-semibold">{orderCount}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Spent</p>
                  <p className="text-lg font-semibold">₹{totalSpent.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Wishlist</p>
                  <p className="text-lg font-semibold">{wishlistIds.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm font-semibold">{new Date(memberSince).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600">
                <HeartPulse className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{displayUser.name}</CardTitle>
                <p className="text-sm text-slate-500">{displayUser.email}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  displayUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-sky-100 text-sky-700'
                }`}>
                  {displayUser.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="font-medium text-slate-900">{displayUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Phone Number</p>
                <p className="font-medium text-slate-900">{displayUser.mobile || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Shield className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Account Type</p>
                <p className="font-medium text-slate-900">{displayUser.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Account Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
            {displayUser.role !== 'ADMIN' && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/orders')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View My Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/addresses')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Addresses
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  My Wishlist
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}