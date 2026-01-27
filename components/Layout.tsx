
import React from 'react';
import { Home, TrendingUp, Users, User, ArrowLeftRight, Settings2, Crown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username: string;
  balance: number;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, username, balance, isAdmin }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex justify-between items-center shadow-lg border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900">E</div>
          <span className="font-bold text-lg tracking-tight">Elite Sports</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400">Balance Total</span>
          <span className="text-amber-400 font-bold text-lg">${balance.toFixed(2)} USDT</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-2 py-3 flex justify-between items-center z-50 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'home' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <Home size={20} />
          <span className="text-[8px] font-medium">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('vip')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'vip' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <Crown size={20} />
          <span className="text-[8px] font-medium">VIP</span>
        </button>
        <button 
          onClick={() => setActiveTab('bet')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'bet' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <TrendingUp size={20} />
          <span className="text-[8px] font-medium">Invertir</span>
        </button>
        <button 
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'records' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <ArrowLeftRight size={20} />
          <span className="text-[8px] font-medium">Finanzas</span>
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'team' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <Users size={20} />
          <span className="text-[8px] font-medium">Equipo</span>
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'admin' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
          >
            <Settings2 size={20} />
            <span className="text-[8px] font-medium">Admin</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 transition-all flex-1 ${activeTab === 'profile' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <User size={20} />
          <span className="text-[8px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};
