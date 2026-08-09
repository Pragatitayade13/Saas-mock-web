import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface LayerInfo {
  id: number;
  levelName: string;
  badge: string;
  color: string;
  glow: string;
  borderColor: string;
  description: string;
  tech: string[];
}

const layersData: LayerInfo[] = [
  {
    id: 1,
    levelName: 'Level 1: Executive Governance UI',
    badge: 'Top Tier • Glass Shell',
    color: 'text-[#22D3EE]',
    glow: 'from-[#22D3EE]/30 via-[#22D3EE]/10 to-transparent',
    borderColor: 'border-[#22D3EE]/60',
    description: 'Liquid glassmorphic UI shell, command palette, and real-time dashboard visualization layer.',
    tech: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts Telemetry'],
  },
  {
    id: 2,
    levelName: 'Level 2: Real-time Analytics Engine',
    badge: 'Middle Tier • Intelligence Core',
    color: 'text-[#8B5CF6]',
    glow: 'from-[#8B5CF6]/30 via-[#8B5CF6]/10 to-transparent',
    borderColor: 'border-[#8B5CF6]/60',
    description: 'In-memory telemetry aggregation, customer cohort tracking, and ARR velocity calculations.',
    tech: ['In-Memory ICM Store', 'Atomic Counters', 'Concurrent Reader Locks'],
  },
  {
    id: 3,
    levelName: 'Level 3: Core Security Foundation',
    badge: 'Base Tier • Enterprise Infrastructure',
    color: 'text-emerald-400',
    glow: 'from-emerald-500/30 via-emerald-500/10 to-transparent',
    borderColor: 'border-emerald-500/60',
    description: 'Go 1.22 REST backend API server, RBAC authorization middleware, and AES-256 GCM encryption.',
    tech: ['Go 1.22 Runtime', 'Gin Framework', 'SOC2 Type II RBAC'],
  },
];

export const CoreLayerExplosionAnimation: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<number | 'all'>(0); // 0 = unified, 1,2,3 = specific level, 'all' = full explosion
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Video-style auto-playback loop cycling through core levels
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveLevel((prev) => {
        if (prev === 0) return 1;
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        if (prev === 3) return 'all';
        return 0;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full flex flex-col items-center space-y-6">
      {/* Video Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={isPlaying ? 'Pause Auto Video Opening' : 'Play Auto Video Opening'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-[#22D3EE]" />
                <span>Pause Video Sequence</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-[#8B5CF6]" />
                <span>Play Level Opening Video</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveLevel(0);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors text-xs"
            title="Reset Core"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Level Step Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveLevel(0);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeLevel === 0 ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-white/60 hover:text-white bg-white/5'
              }`}
          >
            Unified Core
          </button>

          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setIsPlaying(false);
                setActiveLevel(lvl);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeLevel === lvl ? 'bg-[#22D3EE] text-black font-bold shadow-lg' : 'text-white/60 hover:text-white bg-white/5'
                }`}
            >
              Level {lvl}
            </button>
          ))}

          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveLevel('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeLevel === 'all' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-bold shadow-lg' : 'text-white/60 hover:text-white bg-white/5'
              }`}
          >
            Explode All Levels
          </button>
        </div>
      </div>

      {/* Interactive 3D Core Layer Opening Container */}
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center group overflow-visible">
        {/* Ambient Volumetric Aura Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/30 via-[#22D3EE]/20 to-[#6366F1]/30 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

        {/* Main 3D Core Render Base Image */}
        <img
          src="/cta_3d_core.png"
          alt="Cinematic 3D SaaS Core Visualization"
          className={`
            w-full h-auto object-cover rounded-3xl mix-blend-lighten filter drop-shadow-[0_20px_50px_rgba(139,92,246,0.4)]
            transition-all duration-700 ease-out
            ${activeLevel !== 0 ? 'scale-95 opacity-40 blur-[1px]' : 'scale-100 opacity-100'}
          `}
        />

        {/* Layer Explosion Overlay Representation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 space-y-4 pointer-events-none">
          {layersData.map((layer) => {
            const isHighlighted = activeLevel === layer.id || activeLevel === 'all';

            // Vertical offset displacement calculation for level opening
            let translateY = 'translate-y-0';
            if (activeLevel === 'all') {
              if (layer.id === 1) translateY = '-translate-y-16 scale-105';
              if (layer.id === 2) translateY = 'translate-y-0 scale-100';
              if (layer.id === 3) translateY = 'translate-y-16 scale-95';
            } else if (activeLevel === layer.id) {
              translateY = '-translate-y-2 scale-105';
            }

            return (
              <div
                key={layer.id}
                className={`
                  w-full max-w-sm rounded-2xl p-4 transition-all duration-700 ease-out pointer-events-auto cursor-pointer
                  border backdrop-blur-2xl shadow-2xl bg-gradient-to-r
                  ${layer.glow}
                  ${isHighlighted ? `${layer.borderColor} bg-black/80 shadow-glow-primary opacity-100` : 'border-white/10 bg-black/40 opacity-40 hover:opacity-80'}
                  ${translateY}
                `}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveLevel(layer.id);
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${layer.color}`}>
                    {layer.levelName}
                  </span>
                  <span className="text-[10px] text-white/60 font-mono px-2 py-0.5 rounded-full bg-white/10">
                    {layer.badge}
                  </span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed text-left">
                  {layer.description}
                </p>

                {isHighlighted && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-300">
                    {layer.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white flex items-center gap-1">
                        <CheckCircle2 className={`w-3 h-3 ${layer.color}`} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoreLayerExplosionAnimation;
