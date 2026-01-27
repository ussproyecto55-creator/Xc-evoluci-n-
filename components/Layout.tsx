
import React from 'react';
import { Home, TrendingUp, Users, User, ArrowLeftRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username: string;
  balance: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, username, balance }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex justify-between items-center shadow-lg border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900">N</div>
          <span className="font-bold text-lg tracking-tight">NexusProfit</span>
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
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('bet')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'bet' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <TrendingUp size={24} />
          <span className="text-[10px] font-medium">Apostar</span>
        </button>
        <button 
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'records' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <ArrowLeftRight size={24} />
          <span className="text-[10px] font-medium">Finanzas</span>
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'team' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <Users size={24} />
          <span className="text-[10px] font-medium">Equipo</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'profile' ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};
