import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LiveGlassDashboardPreview } from '../components/landing/LiveGlassDashboardPreview';
import { InteractiveTechStack } from '../components/landing/InteractiveTechStack';
import { CoreLayerExplosionAnimation } from '../components/landing/CoreLayerExplosionAnimation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Cpu,
  Database,
  Code2,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DemoIndicator } from '../components/layout/DemoIndicator';

export const LandingPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Landing page ALWAYS forces dark mode — completely isolated from dashboard theme settings
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  // Async dynamic HLS cinematic video background load (non-blocking)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';
    let hlsInstance: any = null;
    let isCancelled = false;

    const startPlayback = () => {
      if (video) {
        video.play().catch((err) => {
          console.warn('Autoplay prevented or failed:', err);
        });
      }
    };

    // Defer HLS loading asynchronously so DOM renders instantly
    import('hls.js').then(({ default: Hls }) => {
      if (isCancelled || !video) return;

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
          enableWorker: true,
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          startPlayback();
        });
        hlsInstance.on(Hls.Events.ERROR, (_event: any, data: any) => {
          if (data.fatal) {
            console.warn('HLS video playback error, using visual fallback:', data.type);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', startPlayback);
      } else {
        startPlayback();
      }
    }).catch((err) => {
      console.warn('HLS module failed to load, falling back to ambient mesh:', err);
    });

    return () => {
      isCancelled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-[#F7F8FA] flex flex-col font-body selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE] overflow-x-hidden">
      {/* Dynamic Ambient Background Mesh & Poster Fallback */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/hero_3d.png"
          alt="Ambient Background Mesh"
          className="w-full h-full object-cover opacity-30 mix-blend-screen filter blur-[2px]"
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#8B5CF6]/20 via-[#22D3EE]/15 to-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      {/* Cinematic HLS Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero_3d.png"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none"
      />

      {/* Atmospheric Overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none z-[1]" />
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Top Header Navigation */}
      <header className="h-20 border-b border-white/[0.08] glass-header sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between backdrop-blur-xl bg-black/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[#8B5CF6]/30" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)' }}>
            N
          </div>
          <div className="flex flex-col">
            <span className="font-heading italic font-bold text-xl tracking-tight text-[#F7F8FA]">Nexora</span>
            <span className="text-[10px] text-[#A5ACB8] uppercase tracking-wider font-semibold font-body">2026 Enterprise SaaS</span>
          </div>
        </div>

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

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] py-24 px-6 lg:px-12 w-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center justify-center space-y-8 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            <span>Next-Generation 2026 Enterprise SaaS Core</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-[0.88] max-w-3xl mx-auto">
            Modern SaaS Platform. <br />
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-white bg-clip-text text-transparent">
              Built for intelligent decisions.
            </span>
          </h1>

          <p className="text-white/70 font-body font-light text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Unify your customer relationships, recurring subscriptions, real-time revenue velocity, and security audit logs in one powerful executive dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <Link to="/dashboard">
              <button className="liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-all font-body shadow-2xl shadow-[#8B5CF6]/30">
                Explore Dashboard
                <ArrowUpRight className="h-5 w-5 text-[#22D3EE]" />
              </button>
            </Link>

            <Link to="/login">
              <button className="bg-white text-black rounded-full px-8 py-3.5 text-sm font-medium flex items-center gap-2 hover:bg-white/90 transition-colors font-body">
                Sign In to Enterprise
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Seamless 3D Product Showcase Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] block">
            Executive 3D Visual Experience
          </span>
          <h2 className="text-4xl sm:text-6xl font-heading italic text-[#F7F8FA]">
            Interactive SaaS Dashboard Panel
          </h2>
          <p className="text-sm text-[#A5ACB8] max-w-lg mx-auto">
            Explore your revenue analytics, subscription tiers, customer growth, and real-time transaction ledgers.
          </p>
        </div>

        {/* Live Interactive Glass Dashboard Preview Component */}
        <LiveGlassDashboardPreview />
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#22D3EE] mb-2 block">
            Enterprise Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl font-heading italic text-[#F7F8FA]">
            Built with Clean SOLID Design Patterns
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" className="p-8 space-y-4 border-white/[0.08] hover:border-[#8B5CF6]/40 transition-colors backdrop-blur-xl bg-black/50">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-heading italic text-[#F7F8FA]">Go In-Memory Store</h3>
            <p className="text-xs text-[#A5ACB8] leading-relaxed">
              Sub-millisecond thread-safe state store with concurrent read locks, atomic counters, and instant reset capabilities.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-4 border-white/[0.08] hover:border-[#22D3EE]/40 transition-colors backdrop-blur-xl bg-black/50">
            <div className="w-12 h-12 rounded-2xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-heading italic text-[#F7F8FA]">Role-Based Access Control</h3>
            <p className="text-xs text-[#A5ACB8] leading-relaxed">
              Enforces Administrator, Manager, and Viewer permissions across all REST handlers and UI routes.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-4 border-white/[0.08] hover:border-emerald-400/40 transition-colors backdrop-blur-xl bg-black/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-heading italic text-[#F7F8FA]">Real-time Analytics</h3>
            <p className="text-xs text-[#A5ACB8] leading-relaxed">
              Monthly vs Weekly revenue charts, active subscription plan breakdowns, and customer cohort velocity.
            </p>
          </Card>
        </div>
      </section>

      {/* Technology Stack Interactive Section */}
      <section className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <InteractiveTechStack />
      </section>

      {/* Final Cinematic 3D CTA Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-black/60 backdrop-blur-2xl shadow-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#22D3EE]/10 blur-3xl pointer-events-none" />

          {/* Left CTA Typography */}
          <div className="space-y-6 max-w-xl text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
              <Sparkles className="w-4 h-4 text-[#22D3EE]" />
              <span>Simplicity • Technology • Growth • Control</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-heading italic text-[#F7F8FA] tracking-tight leading-tight">
              Build smarter. <br />
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-white bg-clip-text text-transparent">
                Move faster.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#A5ACB8] leading-relaxed">
              Empower your enterprise with real-time analytics, automated lifecycles, and unified executive control.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/dashboard">
                <button className="liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-all font-body shadow-xl shadow-[#8B5CF6]/30">
                  Launch Executive Dashboard
                  <ArrowUpRight className="w-5 h-5 text-[#22D3EE]" />
                </button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 text-base">
                  Sign In to Enterprise
                </Button>
              </Link>
            </div>
          </div>

          {/* Right 3D CTA Core Layer Explosion Animation Component */}
          <div className="w-full lg:w-1/2 relative z-10 shrink-0 flex items-center justify-center">
            <CoreLayerExplosionAnimation />
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-8 px-6 lg:px-12 border-t border-white/10 bg-black/80 backdrop-blur-xl text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading italic text-sm text-white font-bold">Nexora SaaS</span>
          <span>&copy; 2026 Nexora Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-white/60">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/privacy" className="hover:text-[#22D3EE] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};
