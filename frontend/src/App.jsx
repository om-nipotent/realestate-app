import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollProgress from './components/common/ScrollProgress';
import { FullPageLoader } from './components/common/Loader';
import AnimatedPage from './components/common/AnimatedPage';

// Public pages
const Home           = lazy(() => import('./pages/Home'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const Properties     = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const About          = lazy(() => import('./pages/About'));

// Buyer pages
const BuyerDashboard    = lazy(() => import('./pages/buyer/BuyerDashboard'));
const BuyerVerification = lazy(() => import('./pages/buyer/BuyerVerification'));

// Seller pages
const SellerDashboard    = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerVerification = lazy(() => import('./pages/seller/SellerVerification'));
const CreateProperty     = lazy(() => import('./pages/seller/CreateProperty'));
const EditProperty       = lazy(() => import('./pages/seller/EditProperty'));

// Admin pages
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminProperties    = lazy(() => import('./pages/admin/AdminProperties'));
const AdminSettings      = lazy(() => import('./pages/admin/AdminSettings'));

const AppLayout = ({ children }) => (
  <AnimatedPage>{children}</AnimatedPage>
);

const GlobalLayout = ({ children }) => {
  const location = useLocation();
  const noNavRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const hideNav = noNavRoutes.some((path) => location.pathname.startsWith(path));

  return (
    <>
      {!hideNav && <Navbar />}
      <main className="flex-grow flex flex-col min-h-screen">
        {children}
      </main>
    </>
  );
};

// AnimatePresence requires useLocation to key on route changes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <GlobalLayout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* ── Public ─────────────────────────────────────────────── */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/properties" element={<AppLayout><Properties /></AppLayout>} />
          <Route path="/properties/:id" element={<AppLayout><PropertyDetail /></AppLayout>} />
          <Route path="/about" element={<AppLayout><About /></AppLayout>} />

          {/* ── Auth (no navbar) ────────────────────────────────────── */}
          <Route path="/login"                  element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/register"               element={<AnimatedPage><Register /></AnimatedPage>} />
          <Route path="/forgot-password"        element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
          <Route path="/reset-password/:token"  element={<AnimatedPage><ResetPassword /></AnimatedPage>} />

          {/* ── Buyer ─────────────────────────────────────────────── */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute requiredRole="buyer">
              <AppLayout><BuyerDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/buyer/verification" element={
            <ProtectedRoute requiredRole="buyer">
              <AppLayout><BuyerVerification /></AppLayout>
            </ProtectedRoute>
          } />

          {/* ── Seller ────────────────────────────────────────────── */}
          <Route path="/seller/dashboard" element={
            <ProtectedRoute requiredRole="seller">
              <AppLayout><SellerDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/seller/verification" element={
            <ProtectedRoute requiredRole="seller">
              <AppLayout><SellerVerification /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/seller/properties/create" element={
            <ProtectedRoute requiredRole="seller">
              <AppLayout><CreateProperty /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/seller/properties/:id/edit" element={
            <ProtectedRoute requiredRole="seller">
              <AppLayout><EditProperty /></AppLayout>
            </ProtectedRoute>
          } />

          {/* ── Admin ─────────────────────────────────────────────── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/verifications" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminVerifications /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminProperties /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminSettings /></AppLayout>
            </ProtectedRoute>
          } />

          {/* ── Catch-all ─────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </GlobalLayout>
  );
};

const App = () => (
  <AuthProvider>
    <PropertyProvider>
      {/* Global scroll progress bar */}
      <ScrollProgress />
      <Suspense fallback={<FullPageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </PropertyProvider>
  </AuthProvider>
);

export default App;
