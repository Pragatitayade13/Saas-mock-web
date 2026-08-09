import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/api';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex flex-col justify-center items-center p-6">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#12151C] border border-[#272C36] shadow-2xl">
          <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
          <div className="text-center">
            <h3 className="text-sm font-medium text-[#F8FAFC]">Validating authentication...</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">Establishing secure session with Nexora ICM</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#12151C] border border-[#272C36] shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Access Restricted</h2>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Your current role (<span className="font-semibold text-white">{user.role}</span>) does not have permission to view this page.
          </p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="mt-6 px-4 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
