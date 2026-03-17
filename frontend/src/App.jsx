import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { FullPageLoader } from './components/common/Loader';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const About = lazy(() => import('./pages/About'));

// Buyer pages
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const BuyerVerification = lazy(() => import('./pages/buyer/BuyerVerification'));

// Seller pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerVerification = lazy(() => import('./pages/seller/SellerVerification'));
const CreateProperty = lazy(() => import('./pages/seller/CreateProperty'));
const EditProperty = lazy(() => import('./pages/seller/EditProperty'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Pages that show Navbar
const HIDE_NAVBAR_PATHS = [];

const AppLayout = ({ children, hideNavbar }) => (
  <>
    {!hideNavbar && <Navbar />}
    <main>{children}</main>
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* ── Public Routes ─────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <Home />
                </AppLayout>
              }
            />
            <Route
              path="/properties"
              element={
                <AppLayout>
                  <Properties />
                </AppLayout>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <AppLayout>
                  <PropertyDetail />
                </AppLayout>
              }
            />
            <Route
              path="/about"
              element={
                <AppLayout>
                  <About />
                </AppLayout>
              }
            />

            {/* ── Auth Routes (no navbar) ────────────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* ── Buyer Routes ───────────────────────────────────────── */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <AppLayout>
                    <BuyerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/verification"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <AppLayout>
                    <BuyerVerification />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Seller Routes ──────────────────────────────────────── */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <SellerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/verification"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <SellerVerification />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/properties/create"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <CreateProperty />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/properties/:id/edit"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <EditProperty />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Admin Routes ───────────────────────────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <AdminVerifications />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <AdminProperties />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <AdminSettings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ──────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PropertyProvider>
    </AuthProvider>
  );
};

export default App;
