import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Shield, Clock, Truck, Phone, Mail, MapPin, Home, Search, ShoppingCart, User, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    const storedUser = (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    
    if (storedUser?.role === 'ADMIN' && location.pathname === '/') {
      navigate('/admin/dashboard');
    }
  }, [location.pathname]);

  const isAdmin = user?.role === 'ADMIN' || (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored)?.role === 'ADMIN' : false;
    } catch {
      return false;
    }
  })();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && !isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden">
          <div className="flex items-center justify-around py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                location.pathname === '/' ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <button
              onClick={() => document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                location.pathname.includes('/search') ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
            <Link
              to="/cart"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                location.pathname === '/cart' ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </Link>
            <Link
              to="/orders"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                location.pathname === '/orders' ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Orders</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                location.pathname.includes('/profile') ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
                >
                  <span className="text-white font-bold">P</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-slate-900">PharmaCare</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Your trusted online pharmacy delivering genuine medicines and healthcare products to your doorstep.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Shield className="h-4 w-4 text-success" />
                <span>100% Authentic</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="/cart" className="hover:text-primary transition-colors">Cart</a></li>
                <li><a href="/orders" className="hover:text-primary transition-colors">My Orders</a></li>
                <li><a href="/profile" className="hover:text-primary transition-colors">Profile</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>1800-123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@pharmacare.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Why Choose Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <Shield className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Genuine Products</p>
                    <p className="text-xs text-slate-500">100% authentic medicines</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Fast Delivery</p>
                    <p className="text-xs text-slate-500">Delivery within 24-48 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">24/7 Support</p>
                    <p className="text-xs text-slate-500">Always here to help</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} PharmaCare. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Refund Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}