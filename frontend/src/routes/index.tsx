import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { CustomerCreatePage } from '../pages/CustomerCreatePage';
import { SubscriptionsPage } from '../pages/SubscriptionsPage';
import { SubscriptionDetailPage } from '../pages/SubscriptionDetailPage';
import { SubscriptionCreatePage } from '../pages/SubscriptionCreatePage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { TransactionDetailPage } from '../pages/TransactionDetailPage';
import { TransactionCreatePage } from '../pages/TransactionCreatePage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { ReportCreatePage } from '../pages/ReportCreatePage';
import { ActivityPage } from '../pages/ActivityPage';
import { AuditPage } from '../pages/AuditPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { InviteAcceptPage } from '../pages/InviteAcceptPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
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
  );
};
