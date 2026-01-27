
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Zap, X, Info, Clock, Gift, Users, Landmark, Percent, Star, Send } from 'lucide-react';
import { useApp } from '../store';
import { VIP_LEVELS, BUSINESS_HOURS, ARRIVAL_TIMES, FIRST_RECHARGE_BONUS } from '../constants';
import { Banner } from '../components/Banner';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useApp();
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    setShowAnnouncement(true);
  }, []);

  if (!user) return null;
  const currentVIP = VIP_LEVELS[user.vipLevel];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* ANUNCIO INTEGRAL - ACTUALIZADO */}
      {showAnnouncement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setShowAnnouncement(false)}></div>
          <div className="relative glass w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-amber-500/30 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-center relative shrink-0">
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/80 hover:bg-black/40 transition-colors"
              >
                <X size={20} />
              </button>
              <ShieldCheck size={56} className="mx-auto text-slate-900 mb-3" />
              <h2 className="text-3xl font-black text-slate-900 font-display italic leading-none uppercase">ELITE SPORTS</h2>
              <p className="text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-80">Protocolo de Crecimiento Seguro</p>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto bg-slate-900/90 custom-scrollbar">
              {/* TELEGRAM OFICIAL LINK - NUEVO */}
              <a 
                href="https://t.me/+xb9nTH7qSvs0ZjFh" 
                target="_blank"
                className="flex items-center justify-between p-4 bg-blue-500/20 border border-blue-500/40 rounded-2xl group active:scale-95 transition-all shadow-lg shadow-blue-500/5"
              >
                <div className="flex items-center space-x-3 text-blue-400">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <Send size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Canal Oficial</p>
                    <p className="text-[8px] text-blue-300 font-bold mt-1">Únete para noticias y señales</p>
                  </div>
                </div>
                <Zap size={18} className="text-blue-400 animate-pulse" />
              </a>

              {/* BONO BIENVENIDA HIGHLIGHT */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-1 rounded-3xl shadow-lg">
                <div className="bg-slate-900 p-5 rounded-[1.4rem] flex flex-col items-center text-center space-y-1">
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Star size={24} className="animate-bounce" />
                    <h4 className="font-black uppercase text-lg italic tracking-tighter">¡BONO DE BIENVENIDA!</h4>
                    <Star size={24} className="animate-bounce" />
                  </div>
                  <p className="text-2xl font-black text-white italic">+{(FIRST_RECHARGE_BONUS * 100).toFixed(0)}% EXTRA</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En tu primera recarga de capital</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-[2rem] flex flex-col items-center text-center space-y-2 shadow-inner">
                <Landmark size={28} className="text-amber-500" />
                <h4 className="text-amber-500 font-black uppercase text-sm tracking-tight italic">ENTREGA EN +40 MINUTOS</h4>
                <p className="text-[11px] text-slate-200 italic leading-relaxed font-medium">
                  "Operaciones de 11 AM a 4 PM. Las ganancias se acreditan automáticamente 40 minutos después de tu operación diaria."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Depósitos</span>
                  </div>
                  <p className="text-xl font-black text-white">24/7</p>
                  <p className="text-[9px] text-slate-400 italic">Acreditación en max. 1h.</p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Retiros</span>
                  </div>
                  <p className="text-xl font-black text-white">24/7</p>
                  <p className="text-[9px] text-slate-400 italic">Llegada en max. 24h.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-900 border border-white/5 rounded-2xl">
                <Info size={16} className="text-blue-500 shrink-0" />
                <p className="text-[9px] text-slate-400 italic leading-relaxed">
                  Recuerda que si no operas en la ventana horaria de 11:00 a 16:00, tu capital no generará interés ese día.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-950 shrink-0 border-t border-white/5">
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="w-full py-4 gradient-gold rounded-[1.5rem] text-slate-900 font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                ENTRAR A LA PLATAFORMA
              </button>
            </div>
          </div>
        </div>
      )}

      <Banner />

      <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px]"></div>
        <div className="relative flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Saldo Disponible USDT</p>
            <h2 className="text-4xl font-black text-slate-50 font-display italic tracking-tight">${user.balance.toFixed(2)}</h2>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-2 ${currentVIP.color} text-slate-900 shadow-xl border border-white/20`}>
             <ShieldCheck size={14} />
             <span>{currentVIP.name}</span>
          </div>
        </div>
        
        <div className="mt-10 grid grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate('recharge')}
            className="flex items-center justify-center space-x-2 py-4 rounded-[1.5rem] gradient-gold text-slate-900 font-black transition-all active:scale-95 shadow-xl shadow-amber-500/20 hover:brightness-110"
          >
            <ArrowDownToLine size={20} />
            <span className="uppercase tracking-widest text-xs">Recargar</span>
          </button>
          <button 
            onClick={() => onNavigate('withdraw')}
            className="flex items-center justify-center space-x-2 py-4 rounded-[1.5rem] bg-slate-800 text-slate-200 font-black border border-white/10 transition-all active:scale-95 hover:bg-slate-700"
          >
            <ArrowUpFromLine size={20} />
            <span className="uppercase tracking-widest text-xs">Retirar</span>
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-center space-x-2 text-amber-500/60 font-bold text-[9px] uppercase tracking-widest">
           <Percent size={12} />
           <span>Operación Diaria: 11:00 AM - 16:00 PM</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[2rem] p-5 flex flex-col space-y-2 border border-white/5 bg-slate-800/20">
          <div className="bg-blue-500/20 w-10 h-10 rounded-2xl flex items-center justify-center text-blue-400 mb-1 border border-blue-500/10">
            <Clock size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ciclo Ganancias</p>
          <p className="text-slate-100 font-black text-xl font-display italic">+40 Minutos</p>
        </div>
        <div className="glass rounded-[2rem] p-5 flex flex-col space-y-2 border border-white/5 bg-slate-800/20">
          <div className="bg-purple-500/20 w-10 h-10 rounded-2xl flex items-center justify-center text-purple-400 mb-1 border border-purple-500/10">
            <Users size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Comisiones Red</p>
          <p className="text-slate-100 font-black text-xl font-display italic">Lunes</p>
        </div>
      </div>
    </div>
  );
};
