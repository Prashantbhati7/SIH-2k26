import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  User, 
  LogOut, 
  Sparkles, 
  Building2, 
  Activity,
  Layers
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
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-400 bg-clip-text text-transparent">
              VikasDrishti
            </span>
            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              SIH 2026 Prototype
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            AI Infrastructure Project Intelligence Platform
          </p>
        </div>
      </div>

      {/* Center Command Search & Quick Navigation */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project code (e.g. 40001), sector, or ministry..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Actions & User Profile */}
      <div className="flex items-center space-x-3">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-indigo-200 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline">AI Project Assistant</span>
        </button>

        {/* User Role Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-indigo-300">{user?.roleDisplayName || activeRole}</span>
        </div>

        {/* User & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400">{user?.email || 'authenticated'}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
