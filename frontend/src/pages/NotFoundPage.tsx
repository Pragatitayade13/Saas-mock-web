import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <AppShell>
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-extrabold text-[#8B5CF6] uppercase tracking-widest mb-2">
          Error 404 — Page Not Found
        </span>

        <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight mb-3">
          Lost in the Nexus?
        </h1>

        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-8">
          The route or analytics resource you requested does not exist or may have been moved.
        </p>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
};
