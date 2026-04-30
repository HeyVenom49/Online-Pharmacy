import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './layouts/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMedicinesPage } from './pages/AdminMedicinesPage';
import { AddMedicinePage } from './pages/AddMedicinePage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { MedicineDetailPage } from './pages/MedicineDetailPage';
import { AddressPage } from './pages/AddressPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminLayout } from './layouts/AdminLayout';
import { ToastProvider, useToast } from './context/ToastContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const storedIsAuth = (() => {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  })();
  const { isAuthenticated } = useAuthStore();
  return (isAuthenticated || storedIsAuth) ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
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
  return (authenticated && currentUser?.role === 'ADMIN') ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="orders/:orderId" element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="addresses" element={
              <ProtectedRoute>
                <AddressPage />
              </ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/dashboard" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/medicines" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminMedicinesPage />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/medicines/add" element={
              <AdminRoute>
                <AdminLayout>
                  <AddMedicinePage />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/medicines/edit/:medicineId" element={
              <AdminRoute>
                <AdminLayout>
                  <AddMedicinePage />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/medicines/:medicineId" element={
              <AdminRoute>
                <AdminLayout>
                  <AddMedicinePage />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="admin/orders" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminOrdersPage />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="medicine/:medicineId" element={
              <ProtectedRoute>
                <MedicineDetailPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;