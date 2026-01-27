
import React from 'react';
import { Home, TrendingUp, Users, User, ArrowLeftRight, Settings2, Crown, Shield } from 'lucide-react';
import { useApp } from '../store';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username: string;
  balance: number;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, username, balance, isAdmin }) => {
  const { showNotification } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex justify-between items-center shadow-lg border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]">E</div>
          <span className="font-bold text-lg tracking-tight text-white font-display italic">Elite Sports</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Balance Disponible</span>
          <span className="text-amber-400 font-black text-lg tracking-tighter">${balance.toFixed(2)} USDT</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        {/* Footer Section */}
        <footer className="mt-12 px-6 py-10 border-t border-white/5 bg-slate-950/30 text-center space-y-6">
          <div className="flex justify-center items-center space-x-3 text-amber-500/40">
            <Shield size={24} />
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocolo Elite</span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed max-w-[280px] mx-auto italic">
              Este sitio web es exclusivamente para fines <span className="text-slate-400 font-bold">informativos y de simulación deportiva</span>. Elite Sports no es una entidad bancaria ni ofrece servicios de inversión regulados.
            </p>
            
            <div className="flex justify-center items-center space-x-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              <button onClick={() => showNotification("Info: Privacidad manejada por Nexus Protocol.", "info")} className="hover:text-amber-500 transition-colors">Política de Privacidad</button>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <button onClick={() => showNotification("Info: Términos de simulación de arbitraje.", "info")} className="hover:text-amber-500 transition-colors">Términos de Servicio</button>
            </div>
          </div>

          <p className="text-[8px] text-slate-700 font-bold uppercase tracking-[0.4em]">© 2025 ELITE SPORTS - NEXUS INFRASTRUCTURE</p>
        </footer>
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
