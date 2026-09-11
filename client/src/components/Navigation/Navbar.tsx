import React from 'react';
import { 
  Search, 
  LogOut, 
  Sparkles, 
  Building2, 
  Activity,
  Bell,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenAssistant: () => void;
  activeRole: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenAssistant,
  activeRole
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-900 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-lime-400 flex items-center justify-center font-black text-base shadow-sm">
          <Activity className="w-5 h-5 text-lime-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg tracking-tight text-slate-900">
              VikasDrishti
            </span>
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200">
              MoSPI Platform
            </span>
          </div>
        </div>
      </div>

      {/* Center Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project code (e.g. 40001), ministry, or state..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Actions & User Context */}
      <div className="flex items-center space-x-3">
        {/* Subtle AI Assistance entry point */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200 transition-all active:scale-98"
          title="Ask for automated project insights and risk summaries"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Ask for insights</span>
        </button>

        {/* Compact Role Selector Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-400">Viewing:</span>
          <span className="font-bold text-slate-900">{user?.roleDisplayName || activeRole}</span>
        </div>

        {/* Help / Notifications */}
        <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-lime-400 font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-500">{user?.email || 'authenticated'}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
