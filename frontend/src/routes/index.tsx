import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { ProtectedRoute } from './ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Dynamic lazy imports for instant initial bundle loading
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('../pages/CustomersPage').then(m => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import('../pages/CustomerDetailPage').then(m => ({ default: m.CustomerDetailPage })));
const CustomerCreatePage = lazy(() => import('../pages/CustomerCreatePage').then(m => ({ default: m.CustomerCreatePage })));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const SubscriptionDetailPage = lazy(() => import('../pages/SubscriptionDetailPage').then(m => ({ default: m.SubscriptionDetailPage })));
const SubscriptionCreatePage = lazy(() => import('../pages/SubscriptionCreatePage').then(m => ({ default: m.SubscriptionCreatePage })));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const TransactionDetailPage = lazy(() => import('../pages/TransactionDetailPage').then(m => ({ default: m.TransactionDetailPage })));
const TransactionCreatePage = lazy(() => import('../pages/TransactionCreatePage').then(m => ({ default: m.TransactionCreatePage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage').then(m => ({ default: m.ReportDetailPage })));
const ReportCreatePage = lazy(() => import('../pages/ReportCreatePage').then(m => ({ default: m.ReportCreatePage })));
const ActivityPage = lazy(() => import('../pages/ActivityPage').then(m => ({ default: m.ActivityPage })));
const AuditPage = lazy(() => import('../pages/AuditPage').then(m => ({ default: m.AuditPage })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const InviteAcceptPage = lazy(() => import('../pages/InviteAcceptPage').then(m => ({ default: m.InviteAcceptPage })));
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 font-body">
    <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
    <span className="text-xs font-semibold text-white/60 tracking-wider">Loading Nexora Platform...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/invite/:token" element={<InviteAcceptPage />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Module Routes */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
              <CustomerCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Subscriptions Module Routes */}
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/new"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
              <SubscriptionCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/:id"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <SubscriptionDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Transactions Module Routes */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
              <TransactionCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <TransactionDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Insights */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
              <ReportCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <ActivityPage />
            </ProtectedRoute>
          }
        />

        {/* Protected System Routes */}
        <Route
          path="/audit"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
              <AuditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Viewer']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Enterprise 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
