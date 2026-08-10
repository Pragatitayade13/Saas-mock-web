import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Mail,
  ArrowRight,
  Database,
  Eye,
  Server,
  Globe,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DemoIndicator } from '../components/layout/DemoIndicator';

export const PrivacyPolicyPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');

    const video = videoRef.current;
    if (!video) return;

    const src = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-[#F7F8FA] flex flex-col font-body selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE] overflow-x-hidden">
      {/* Constant Fixed Full-Screen HLS Video Stream Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      />

      {/* Atmospheric Ambient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none z-[1]" />

      {/* Top Header Navigation */}
      <header className="h-20 border-b border-white/[0.08] glass-header sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between backdrop-blur-xl bg-black/60">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[#8B5CF6]/30">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-heading italic font-bold text-xl tracking-tight text-[#F7F8FA]">Nexora</span>
            <span className="text-[10px] text-[#A5ACB8] uppercase tracking-wider font-semibold font-body">2026 Enterprise SaaS</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <DemoIndicator className="hidden sm:inline-flex" />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Privacy Policy Page Content */}
      <main className="relative z-10 flex-1 py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />
            <span>SOC2 Type II • GDPR • CCPA Compliant</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            Enterprise Privacy Policy
          </h1>

          <p className="text-white/70 font-body text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your trust is our highest technical commitment. Learn how Nexora safeguards your organizational data, transactional ledgers, and team identity credentials.
          </p>

          <div className="flex items-center justify-center gap-6 text-xs text-white/50 pt-2 font-mono">
            <span>Last Updated: August 9, 2026</span>
            <span>•</span>
            <span>Policy Version v2.6.0</span>
          </div>
        </div>

        {/* Content Layout: Sticky Table of Contents (Left) & Document Sections (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Table of Contents Sticky Bar */}
          <div className="lg:col-span-1 sticky top-28 hidden lg:block">
            <Card variant="glass" className="p-6 space-y-3 border-white/10 bg-black/60 backdrop-blur-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-3">
                Table of Contents
              </h3>
              <nav className="space-y-2 text-xs">
                <a href="#collect" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  1. Information We Collect
                </a>
                <a href="#isolation" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  2. Multi-Tenant Isolation
                </a>
                <a href="#usage" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  3. How We Use Data
                </a>
                <a href="#retention" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  4. Data Retention & Erasure
                </a>
                <a href="#rights" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  5. Your Rights (GDPR / CCPA)
                </a>
                <a href="#subprocessors" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  6. Sub-processors
                </a>
                <a href="#contact" className="block text-white/70 hover:text-[#22D3EE] transition-colors py-1">
                  7. Contact DPO
                </a>
                </nav>
            </Card>
          </div>

          {/* Policy Document Sections */}
          <div className="lg:col-span-3 space-y-10">
            {/* Section 1 */}
            <section id="collect">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-[#22D3EE]">
                  <Database className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">1. Information We Collect</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Nexora collects only the business data necessary to provide high-velocity SaaS management, transaction auditing, and analytics visualization services:
                </p>
                <ul className="space-y-2 text-xs text-white/70 list-disc list-inside pt-2">
                  <li><strong className="text-white">Account & Identity Credentials:</strong> Email addresses, hashed authentication tokens, user roles (Administrator, Manager, Viewer).</li>
                  <li><strong className="text-white">Transactional & Subscription Data:</strong> Invoice metadata, payment status identifiers, recurring plan tiers, and subscription counts.</li>
                  <li><strong className="text-white">Audit & Operational Logs:</strong> IP address logs, session durations, endpoint interaction timestamps, and permission change history.</li>
                </ul>
              </Card>
            </section>

            {/* Section 2 */}
            <section id="isolation">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-[#8B5CF6]">
                  <Lock className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">2. Multi-Tenant Data Isolation & Encryption</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  All customer data is strictly segregated using multi-tenant database isolation patterns in our Go backend engine:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-xs font-bold text-white mb-1">Encryption at Rest</h4>
                    <p className="text-[11px] text-white/60">AES-256 GCM encryption for stored configuration, session data, and database records.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-xs font-bold text-white mb-1">Encryption in Transit</h4>
                    <p className="text-[11px] text-white/60">TLS 1.3 enforced across all API endpoints and WebSocket telemetry channels.</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 3 */}
            <section id="usage">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Server className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">3. How We Use Information</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  We strictly process your data for contract performance, security enforcement, and system optimization. We <strong className="text-white">never sell, monetize, or rent</strong> your business metrics or user data to third parties.
                </p>
              </Card>
            </section>

            {/* Section 4 */}
            <section id="retention">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-amber-400">
                  <FileText className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">4. Data Retention & Erasure</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Active subscription data is retained for the duration of your tenant subscription. Upon account termination, all tenant records, transaction logs, and user profiles are purged within 30 days.
                </p>
              </Card>
            </section>

            {/* Section 5 */}
            <section id="rights">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-blue-400">
                  <Globe className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">5. Your Rights (GDPR & CCPA)</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Depending on your jurisdiction, you possess the right to access, rectify, export, or request deletion of your personal data at any time.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#22D3EE] font-bold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automated Data Export CSV Available in Business Reports</span>
                </div>
              </Card>
            </section>

            {/* Section 6 */}
            <section id="subprocessors">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-purple-400">
                  <Eye className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">6. Authorized Sub-processors</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Nexora engages vetted infrastructure sub-processors adhering to SOC2 standards, including Mux (video streaming delivery), AWS/GCP (cloud hosting), and Stripe (payment processing).
                </p>
              </Card>
            </section>

            {/* Section 7 */}
            <section id="contact">
              <Card variant="glass" className="p-8 space-y-4 border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-[#22D3EE]">
                  <Mail className="w-6 h-6 shrink-0" />
                  <h2 className="text-2xl font-heading italic text-white">7. Contact Data Protection Officer (DPO)</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  If you have privacy questions or wish to exercise your data protection rights, contact our security team:
                </p>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Nexora Data Protection Office</span>
                    <span className="text-xs text-[#22D3EE]">privacy@nexora.io</span>
                  </div>
                  <a href="mailto:privacy@nexora.io">
                    <button className="liquid-glass-strong rounded-full px-5 py-2 text-xs font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-all font-body">
                      Email Privacy Team
                      <ArrowUpRight className="w-4 h-4 text-[#22D3EE]" />
                    </button>
                  </a>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 lg:px-12 border-t border-white/10 bg-black/80 backdrop-blur-xl text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading italic text-sm text-white font-bold">Nexora SaaS</span>
          <span>&copy; 2026 Nexora Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-white/60">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/privacy" className="text-[#22D3EE] font-bold hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
