import React from 'react';
import { Menu, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { HealthStatus } from '../types';

interface HeaderProps {
  currentPage: string;
  onToggleMobileMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  health: HealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing = false,
  health,
}) => {
  return (
    <header className="h-16 border-b border-[#26324A] bg-[#0B1020]/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#10182A]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">{currentPage}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-[#60A5FA] border border-[#26344E] font-medium hidden sm:inline-block">
              Live Python Analytics
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10182A] border border-[#26344E] text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[#94A3B8]">FastAPI:</span>
          <span className="text-[#E2E8F0] font-semibold">Online</span>
        </div>

        {health?.ai_ready && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10182A] border border-[#26344E] text-xs">
            <Cpu className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="text-[#94A3B8]">Gemini:</span>
            <span className="text-[#60A5FA] font-medium">Active</span>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121D32] hover:bg-[#1A2844] border border-[#26344E] text-xs font-medium text-[#E2E8F0] transition-colors disabled:opacity-50"
            title="Refresh market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#60A5FA] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};
