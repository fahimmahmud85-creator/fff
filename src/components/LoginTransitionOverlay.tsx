import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Building2, User, CheckCircle2, Lock } from 'lucide-react';
import { AppUser } from '../types';
import { CompanyProfile } from '../utils/companyProfile';
import { playLoginSound } from '../utils/audioChimes';

interface LoginTransitionOverlayProps {
  user: AppUser;
  activeCompany: CompanyProfile;
  onFinish: () => void;
}

export default function LoginTransitionOverlay({ user, activeCompany, onFinish }: LoginTransitionOverlayProps) {
  const [phase, setPhase] = useState<'entering' | 'pulsing' | 'exiting'>('entering');

  useEffect(() => {
    // Play the executive sound chime immediately on mount
    playLoginSound();

    const pulseTimer = setTimeout(() => {
      setPhase('pulsing');
    }, 400);

    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 1400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1850);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const compCode = activeCompany.code || 'MFI';

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-[#07131e]/95 backdrop-blur-md transition-all duration-500 select-none ${
        phase === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f37021]/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#0088cc]/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg animate-in zoom-in-95 duration-300">
        {/* Company & Security Emblem */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#083c54] via-[#0f2860] to-[#f37021] p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-[#081826] rounded-[14px] flex items-center justify-center text-white relative overflow-hidden">
              <span className="font-black text-2xl tracking-widest text-[#f37021]">
                {compCode}
              </span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#081826]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* System & Company Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 mb-2.5">
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AUTHENTICATED SECURE GATEWAY</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase leading-tight mb-1">
          {activeCompany.name}
        </h1>
        <p className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-widest">
          INDUSTRIAL ENTERPRISE RESOURCE PLANNING • AJMAN, UAE
        </p>

        {/* User Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 text-left backdrop-blur-xs mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f37021]/20 border border-[#f37021]/40 flex items-center justify-center text-[#f37021] font-black text-base">
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>{user.firstName} {user.secondName || ''}</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#f37021] text-white rounded uppercase tracking-wider">
                  {user.role}
                </span>
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                UID: <span className="text-amber-400 font-bold">{user.uniqueId || 'MF-AUTH'}</span> • {user.position || 'EXECUTIVE'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono text-emerald-400 font-bold block uppercase">
              • LIVE ONLINE
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              SESSION #2026
            </span>
          </div>
        </div>

        {/* Futuristic Loading Beam */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden relative border border-white/10">
          <div className="h-full bg-gradient-to-r from-[#0088cc] via-[#f37021] to-emerald-400 rounded-full animate-[shimmer_1.5s_infinite] w-full" />
        </div>
        <p className="text-[9.5px] font-mono text-slate-400 mt-2 tracking-wider uppercase">
          LAUNCHING FOCUS WORKSPACE MODULES...
        </p>
      </div>
    </div>
  );
}
