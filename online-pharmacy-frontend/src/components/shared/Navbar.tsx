import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Bell, Menu, X, Phone, Shield, HeartPulse, CreditCard, Truck, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ordersApi } from '../../api/orders';
import { Order } from '../../types';

interface NavNotification {
  id: number;
  type: 'payment' | 'delivery';
  status: string;
  message: string;
  date: string | null;
}

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

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

  const currentUser = user || storedUser;
  const authenticated = isAuthenticated || storedIsAuth;
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchCart();
    }
  }, [authenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!authenticated) return;
    setLoadingNotifications(true);
    try {
      const orders = await ordersApi.getOrders();
      const notificationItems: NavNotification[] = [];
      
      if (orders && orders.length > 0) {
        orders.slice(0, 5).forEach((order) => {
          if (order.payment?.status && order.payment.status !== 'SUCCESS') {
            notificationItems.push({
              id: order.id,
              type: 'payment',
              status: order.payment.status,
              message: `Payment ${order.payment.status} for Order #${order.id}`,
              date: order.orderedAt
            });
          }
          if (order.status && order.status !== 'DELIVERED') {
            notificationItems.push({
              id: order.id,
              type: 'delivery',
              status: order.status,
              message: `Order #${order.id}: ${order.status.replace('_', ' ')}`,
              date: order.orderedAt
            });
          }
        });
      }
      setNotifications(notificationItems);
    } catch {
      // Silently handle notification fetch errors
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-soft' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
                >
                  <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.4} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">PharmaCare</span>
                <span className="text-[10px] text-slate-500 -mt-1">Healthcare Made Easy</span>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 md:mx-8 md:block">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search medicines, health products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-lg pl-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="tel:+918001234567" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">1800-123-4567</span>
            </a>

            {isAdmin ? (
              <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-all">
                <span className="hidden lg:inline font-medium">Dashboard</span>
              </Link>
            ) : (
              <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-pulse-soft">
                      {cart.totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">Cart</span>
              </Link>
            )}

            {authenticated ? (
              <>
                <Link to={isAdmin ? "/admin/orders" : "/orders"} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
                  <Package className="h-5 w-5" />
                  <span className="hidden lg:inline">Orders</span>
                </Link>
                {!isAdmin && (
                  <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
                    <Heart className="h-5 w-5" />
                    <span className="hidden lg:inline">Wishlist</span>
                  </Link>
                )}
                <div className="relative" ref={notificationsRef}>
                  <button type="button" className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary transition-all" onClick={handleNotificationClick}>
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border border-slate-200 bg-white z-50 animate-fade-in">
                      <div className="p-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-700">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="p-4 text-center text-slate-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">No notifications</div>
                        ) : (
                          notifications.map((notif, index) => (
                            <div key={index} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => { navigate(`/orders/${notif.id}`); setShowNotifications(false); }}>
                              <div className="flex items-start gap-2">
                                {notif.type === 'payment' ? (
                                  <CreditCard className="h-4 w-4 text-orange-500 mt-0.5" />
                                ) : (
                                  <Truck className="h-4 w-4 text-blue-500 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm text-slate-700">{notif.message}</p>
                                  <p className="text-xs text-slate-400">{notif.date ? new Date(notif.date).toLocaleDateString() : ''}</p>
                                </div>
                                {notif.status === 'PENDING' || notif.status === 'PACKED' ? (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-sm text-primary hover:underline">
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-slate-700">{currentUser?.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="relative p-2 text-slate-600">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cart.totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden animate-slide-down">
          <div className="p-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            <a href="tel:+918001234567" className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-slate-700">
              <Phone className="h-5 w-5 text-primary" />
              <span>1800-123-4567 (Toll Free)</span>
            </a>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 text-teal-700">
              <Shield className="h-5 w-5" />
              <span className="text-sm">100% Authentic Medicines</span>
            </div>
            <div className="flex flex-col gap-1">
              {authenticated ? (
                <>
                  {isAdmin ? (
                    <>
                      <Link to="/admin/dashboard" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                        <User className="h-5 w-5 text-purple-500" />
                        <span className="text-purple-600 font-medium">Admin Dashboard</span>
                      </Link>
                      <Link to="/admin/medicines" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                        <Package className="h-5 w-5 text-slate-500" />
                        <span>Medicines</span>
                      </Link>
                      <Link to="/admin/orders" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                        <Package className="h-5 w-5 text-slate-500" />
                        <span>Orders</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/orders" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                        <Package className="h-5 w-5 text-slate-500" />
                        <span>My Orders</span>
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                        <Heart className="h-5 w-5 text-slate-500" />
                        <span>Wishlist</span>
                      </Link>
                    </>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                    <User className="h-5 w-5 text-slate-500" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5 text-slate-500" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full">Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}