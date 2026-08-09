import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ApiError } from '../services/api/client';
import {
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  UserCheck,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle2,
  ArrowRight,
  Database,
  Key,
  Users,
  CreditCard,
  Cpu,
  LockKeyhole,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface DemoAccount {
  role: 'Administrator' | 'Manager' | 'Viewer';
  email: string;
  password: string;
  desc: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Administrator',
    email: 'admin@nexora.demo',
    password: 'Admin@123',
    desc: 'Full administrative access to all systems, security settings & team roles',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    role: 'Manager',
    email: 'manager@nexora.demo',
    password: 'Manager@123',
    desc: 'Operational access to revenue analytics, customer ledgers & reports',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
  },
  {
    role: 'Viewer',
    email: 'viewer@nexora.demo',
    password: 'Viewer@123',
    desc: 'Read-only access to analytics dashboards & system activity views',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
];

const sparklineData = [
  { month: 'Jan', val: 320 },
  { month: 'Feb', val: 410 },
  { month: 'Mar', val: 490 },
  { month: 'Apr', val: 580 },
  { month: 'May', val: 670 },
  { month: 'Jun', val: 760 },
  { month: 'Jul', val: 842 },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  // Apply saved theme to html on mount (login page respects user theme)
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [resolvedTheme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address.';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const emailError = emailTouched ? validateEmail(email) : null;
  const passwordError = passwordTouched ? validatePassword(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    clearError();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    if (eErr || pErr) {
      setFormError(eErr || pErr || 'Please check input fields.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError('Invalid email or password.');
        } else if (err.status === 403) {
          setFormError('User account is inactive. Please contact support.');
        } else if (err.status === 0) {
          setFormError('Unable to connect to the server. Please try again.');
        } else {
          setFormError(err.message || 'Authentication failed.');
        }
      } else {
        setFormError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setEmailTouched(false);
    setPasswordTouched(false);
    setFormError(null);
    clearError();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0D10] text-slate-900 dark:text-[#F8FAFC] flex flex-col font-body selection:bg-[#8B5CF6]/20 selection:text-[#8B5CF6] overflow-x-hidden relative">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[#8B5CF6]/30">
            N
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading italic font-bold text-xl tracking-tight text-slate-900">Nexora</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-body">2026 Enterprise SaaS</span>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#8B5CF6] transition-colors py-2 px-4 rounded-full bg-slate-100 hover:bg-purple-50 border border-slate-200/80 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* Split-Screen Executive Container */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 gap-8 lg:gap-12 my-auto">
        {/* Left Side: Breathtaking Interactive White-Theme Security & Telemetry Hub (No Dark Boxes) */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-10 rounded-3xl bg-gradient-to-br from-white via-purple-50/60 to-slate-100 border border-slate-200/90 shadow-2xl shadow-slate-200/90 relative overflow-hidden group min-h-[640px]">
          {/* Volumetric Aura Ambient Halo Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-r from-purple-200/50 via-cyan-100/40 to-indigo-200/40 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none" />

          {/* Top Headline & Trust Badges */}
          <div className="space-y-4 relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span>SOC2 Type II Certified SaaS Infrastructure</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-heading italic text-slate-900 tracking-tight leading-[0.92]">
              Real-Time Telemetry & <br />
              <span className="bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#22D3EE] bg-clip-text text-transparent">
                Multi-Tenant Governance.
              </span>
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed max-w-lg font-medium">
              Unified executive portal with thread-safe Go state engine, sub-millisecond RBAC authorization, and automated security ledgers.
            </p>
          </div>

          {/* Center Interactive White-Theme Live Glass Dashboard Card Stack */}
          <div className="relative z-10 my-6 space-y-4 text-left">
            {/* Live ARR Telemetry Glass Card */}
            <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xl shadow-purple-100/50 backdrop-blur-xl space-y-3 transition-transform duration-500 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Annual Recurring Revenue Velocity</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                  +18.4% ARR
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 font-heading italic tracking-tight">$332.8M</span>
                <span className="text-xs text-slate-500 font-semibold">Synced from Go In-Memory Store</span>
              </div>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="whiteThemeSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#whiteThemeSpark)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Security & Access Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                  <LockKeyhole className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">AES-256 GCM</span>
                  <span className="text-[11px] text-slate-500 font-medium">Encrypted at Rest</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Go 1.22 Core</span>
                  <span className="text-[11px] text-slate-500 font-medium">Sub-ms Handler</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live System Activity Bar */}
          <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>All 2026 Engine Services Operational</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Build v2.4.0</span>
          </div>
        </div>

        {/* Right Side: ENLARGED Spacious Executive White Theme Login Form */}
        <div className="w-full lg:w-[560px] shrink-0 flex flex-col justify-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/90 backdrop-blur-2xl relative space-y-7">
            {/* Header Brand Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-indigo-600 to-[#22D3EE] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#8B5CF6]/30 mb-2">
                N
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading italic">
                Welcome to Nexora
              </h1>
              <p className="text-sm font-semibold text-slate-500">
                Sign in to access your executive workspace
              </p>
            </div>

            {/* Form Error Alert */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-shake shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{formError}</div>
              </div>
            )}

            {/* Expanded Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left">
              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailTouched) setFormError(null);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                      emailError ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-100'
                    }`}
                    placeholder="admin@nexora.demo"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-rose-600 font-semibold">{emailError}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordTouched) setFormError(null);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                      passwordError ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-100'
                    }`}
                    placeholder="••••••••••••"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-rose-600 font-semibold">{passwordError}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-[#8B5CF6]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating Workspace...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Sign In to Executive Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick-Fill Demo Accounts Panel */}
            <div className="pt-6 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Key className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Demo Accounts</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold">1-Click Auto-Fill</span>
              </div>

              <div className="space-y-2.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.role}
                    onClick={() => fillDemoCredentials(acc)}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-[#8B5CF6]/50 transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-xs hover:shadow-md text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${acc.badgeBg} ${acc.badgeText} ${acc.badgeBorder}`}>
                          {acc.role}
                        </span>
                        <span className="text-xs text-slate-900 font-bold truncate">{acc.email}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium">{acc.desc}</p>
                    </div>

                    <div className="shrink-0 px-3.5 py-2 rounded-xl bg-white group-hover:bg-[#8B5CF6] text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-[#8B5CF6] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
                      <UserCheck className="w-4 h-4" />
                      <span>Use</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">Nexora SaaS Platform</span>
          <span>&copy; 2026 Nexora Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-slate-600 font-semibold">
          <Link to="/" className="hover:text-[#8B5CF6] transition-colors">
            Landing Page
          </Link>
          <Link to="/privacy" className="hover:text-[#8B5CF6] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
