import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  Calculator,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { HealthStatus } from '../types';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  health: HealthStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
  health,
}) => {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Stock Research', label: 'Stock Research', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'Portfolio Analyzer', label: 'Portfolio Analyzer', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'Risk Analytics', label: 'Risk Analytics', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'SIP Calculator', label: 'SIP Calculator', icon: <Calculator className="w-5 h-5" /> },
    { id: 'AI Assistant', label: 'AI Assistant', icon: <BotMessageSquare className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`bg-[#10182A] border-r border-[#26324A] flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      } min-h-screen shrink-0`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#26324A]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-xl">📈</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#F8FAFC] tracking-tight">FinPilot AI</span>
              <span className="text-[11px] text-[#60A5FA] uppercase tracking-wider font-semibold">Financial Intelligence</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-3 py-2 text-[10px] font-bold text-[#60A5FA] tracking-wider uppercase ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? 'NAV' : 'NAVIGATION'}
        </div>

        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#1E293B] text-[#60A5FA] border border-[#3B82F6]/30 shadow-md shadow-blue-900/20'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#152033]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className={`${isActive ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>{item.icon}</div>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Platform Info & Status */}
      <div className="p-4 border-t border-[#26324A] text-xs text-[#94A3B8] space-y-3">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#CBD5E1]">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> API Engine
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                health?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {health?.status === 'healthy' ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>

            <div className="bg-[#152033] p-2.5 rounded-lg border border-[#26344E] space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Gemini AI</span>
                <span className={`font-medium ${health?.ai_ready ? 'text-[#60A5FA]' : 'text-amber-400'}`}>
                  {health?.ai_model || 'gemini-3.8-flash'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Market Data</span>
                <span className="font-medium text-[#CBD5E1]">Yahoo Finance</span>
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-1">
              <span>FinPilot AI v1.0 • React + FastAPI</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center" title="Backend Connected">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
};
