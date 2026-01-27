
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Zap, X, Info, Clock, Gift, Users, Landmark, Percent } from 'lucide-react';
import { useApp } from '../store';
import { VIP_LEVELS, TEAM_REBATES, REFERRAL_COMMISSION } from '../constants';
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
      {/* ANUNCIO INTEGRAL - NO ELIMINAR CONTENIDO */}
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
              <h2 className="text-3xl font-black text-slate-900 font-display italic leading-none uppercase">NEXUS PROFIT</h2>
              <p className="text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-80">Protocolo de Crecimiento Seguro</p>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto bg-slate-900/90 custom-scrollbar">
              {/* BLOQUE DE CAPITAL - MÁXIMA PRIORIDAD */}
              <div className="bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-[2rem] flex flex-col items-center text-center space-y-2 shadow-inner">
                <Landmark size={28} className="text-amber-500" />
                <h4 className="text-amber-500 font-black uppercase text-sm tracking-tight">¡TU CAPITAL ES RETIRABLE!</h4>
                <p className="text-[11px] text-slate-200 italic leading-relaxed font-medium">
                  "Nexus Profit garantiza la libertad de sus usuarios. Puedes retirar tu **capital total y ganancias** cuando desees, siempre que hayan pasado las primeras 24 horas desde tu registro."
                </p>
              </div>

              {/* BLOQUE DE BONIFICACIONES */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Gift size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Bono Bienvenida</span>
                  </div>
                  <p className="text-xl font-black text-white">3% <span className="text-[10px] font-normal text-slate-500 uppercase">Cashback</span></p>
                  <p className="text-[9px] text-slate-400 italic">En tu primera recarga de inversión.</p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Zap size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Bono Miércoles</span>
                  </div>
                  <p className="text-xl font-black text-white">6% <span className="text-[10px] font-normal text-slate-500 uppercase">Extra</span></p>
                  <p className="text-[9px] text-slate-400 italic">En cada recarga todos los miércoles.</p>
                </div>
              </div>

              {/* ESTRUCTURA DE COMISIONES POR RED */}
              <section className="space-y-3">
                <h3 className="text-amber-500 font-black flex items-center space-x-2 text-xs uppercase tracking-[0.2em] ml-1">
                  <Users size={14} /> <span>SISTEMA DE REFERIDOS</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/20 text-center">
                    <p className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter">Nivel 1</p>
                    <p className="text-xl font-black text-white italic">8%</p>
                  </div>
                  <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/20 text-center">
                    <p className="text-[8px] text-purple-400 font-bold uppercase tracking-tighter">Nivel 2</p>
                    <p className="text-xl font-black text-white italic">3%</p>
                  </div>
                  <div className="bg-pink-500/5 p-3 rounded-xl border border-pink-500/20 text-center">
                    <p className="text-[8px] text-pink-400 font-bold uppercase tracking-tighter">Nivel 3</p>
                    <p className="text-xl font-black text-white italic">1%</p>
                  </div>
                </div>
              </section>

              {/* CONDICIONES DE OPERACIÓN */}
              <section className="space-y-3">
                <h3 className="text-amber-500 font-black flex items-center space-x-2 text-xs uppercase tracking-[0.2em] ml-1">
                  <Clock size={14} /> <span>GESTIÓN DE FONDOS</span>
                </h3>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-400">Procesamiento de Retiro:</span>
                    <span className="text-slate-100 font-bold italic">1 a 24 Horas Máx.</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-400">Comisiones de Retiro:</span>
                    <span className="text-amber-500 font-bold italic">Desde 10% (VIP 1) a 4% (VIP 7)</span>
                  </div>
                  <div className="flex justify-between text-xs items-center border-t border-white/5 pt-2">
                    <span className="text-slate-400">Mínimo Recarga/Retiro:</span>
                    <span className="text-white font-bold italic">10 USDT</span>
                  </div>
                </div>
              </section>

              <div className="flex items-center space-x-3 p-4 bg-slate-900 border border-white/5 rounded-2xl">
                <Info size={16} className="text-blue-500 shrink-0" />
                <p className="text-[9px] text-slate-400 italic leading-relaxed">
                  Las ganancias de red se auditan y entregan todos los lunes de forma automática a su balance.
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

      {/* CARRUSEL DE IMÁGENES / FALLBACK */}
      <Banner />

      {/* Tarjeta de Saldo Principal */}
      <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px]"></div>
        <div className="relative flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Saldo Retirable USDT</p>
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
           <span>Interés Compuesto Activado: 2.5%</span>
        </div>
      </div>

      {/* Cuadrícula de Métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[2rem] p-5 flex flex-col space-y-2 border border-white/5 bg-slate-800/20">
          <div className="bg-blue-500/20 w-10 h-10 rounded-2xl flex items-center justify-center text-blue-400 mb-1 border border-blue-500/10">
            <Zap size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tasa Diaria</p>
          <p className="text-slate-100 font-black text-xl font-display italic">2.5% <span className="text-[10px] text-slate-500 uppercase not-italic">Fijo</span></p>
        </div>
        <div className="glass rounded-[2rem] p-5 flex flex-col space-y-2 border border-white/5 bg-slate-800/20">
          <div className="bg-purple-500/20 w-10 h-10 rounded-2xl flex items-center justify-center text-purple-400 mb-1 border border-purple-500/10">
            <Wallet size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Invertido</p>
          <p className="text-slate-100 font-black text-xl font-display italic">${user.totalRecharge.toFixed(2)}</p>
        </div>
      </div>

      {/* Privilegios VIP */}
      <div className="glass rounded-[2rem] p-7 border border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
          <span>Estado Operativo</span>
        </h3>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-slate-500">Retiros Mensuales Disponibles</span>
              <span className="text-slate-100">{user.monthlyWithdrawalCount} / {currentVIP.withdrawalsPerMonth}</span>
            </div>
            <div className="w-full bg-slate-900/80 rounded-full h-3 overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-amber-600 to-amber-300 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(user.monthlyWithdrawalCount / (currentVIP.withdrawalsPerMonth || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-white/5 pt-5">
             <div className="space-y-1">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Comisión actual</p>
                <p className="text-xl font-black text-amber-500 italic">{currentVIP.commission}%</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] text-green-500 font-black uppercase bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Capital Disponible</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
