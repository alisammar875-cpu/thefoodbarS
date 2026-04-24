import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';
import FloatingCart from './components/FloatingCart';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';

// Admin Lazy Imports
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminMenu = lazy(() => import('./admin/AdminMenu'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminReviews = lazy(() => import('./admin/AdminReviews'));
const AdminCustomers = lazy(() => import('./admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./admin/AdminSettings'));

import { useConfig } from './contexts/ConfigContext';
import Maintenance from './pages/Maintenance';
import Preloader from './components/Preloader';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { config, loading: configLoading } = useConfig();
  const { isAdmin } = useAuth();

  if (configLoading) return <Preloader />;

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen pb-20 lg:pb-0">
          {config.maintenanceMode && !isAdmin ? (
            <Routes>
              <Route path="/admin/*" element={
                <AdminRoute>
                  <Suspense fallback={<div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading...</div>}>
                    <AdminLayout />
                  </Suspense>
                </AdminRoute>
              } />
              <Route path="/admin/login" element={
                <Suspense fallback={<div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading...</div>}>
                  <AdminLogin />
                </Suspense>
              } />
              <Route path="*" element={<Maintenance />} />
            </Routes>
          ) : (
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={
                <Suspense fallback={<div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading...</div>}>
                  <AdminLogin />
                </Suspense>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <Suspense fallback={<div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading...</div>}>
                    <AdminLayout />
                  </Suspense>
                </AdminRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Customer Routes */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <CartDrawer />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:id" element={<OrderSuccess />} />
                      <Route path="/track" element={<OrderTracking />} />
                      <Route path="/track/:id" element={<OrderTracking />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          )}
          <BottomNav />
          <FloatingCart />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
