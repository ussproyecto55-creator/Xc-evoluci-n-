
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { SPORTS, BUSINESS_HOURS } from '../constants';
import { Sport } from '../types';
import { CheckCircle2, Clock, X, Plus, Minus, Timer, Activity, ArrowRight, ShieldCheck, History, ArrowDownToLine, TrendingUp, BarChart2 } from 'lucide-react';

export const Bet: React.FC = () => {
  const { user, applyCompoundInterest, allTransactions, showNotification } = useApp();
  const [betting, setBetting] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [showSummary, setShowSummary] = useState(false);

  const isMarketOpen = useMemo(() => {
    const hours = new Date().getHours();
    return hours >= BUSINESS_HOURS.BET.START && hours < BUSINESS_HOURS.BET.END;
  }, []);

  const hasAlreadyBetToday = useMemo(() => {
    if (!user?.lastBetDate) return false;
    return new Date(user.lastBetDate).toDateString() === new Date().toDateString();
  }, [user?.lastBetDate]);

  const executeBet = async () => {
    if (!user || !selectedSport || betting) return;
    if (!isMarketOpen) {
      showNotification("Mercado cerrado. Opera de 11:00 AM a 4:00 PM.", "error");
      return;
    }
    setBetting(true);
    try {
      await applyCompoundInterest(parseFloat(betAmount), selectedSport.baseReturn * 100, selectedSport.id);
      setSelectedSport(null);
      setShowSummary(false);
      showNotification("Ciclo de arbitraje iniciado (40 min).", "success");
    } catch (err) {
      showNotification("Error de red al procesar.", "error");
    } finally {
      setBetting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${isMarketOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
        <div className="flex items-center space-x-2 font-bold text-[10px] uppercase">
          {isMarketOpen ? <Timer size={18} className="animate-pulse" /> : <Clock size={18} />}
          <span>{isMarketOpen ? 'Mercado Abierto' : 'Abre 11:00 AM - 4:00 PM'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Compuesto Max</span>
          <span className="text-[10px] font-black text-amber-500">2.50% Diario</span>
        </div>
      </div>

      {user.activeBet && (
        <div className="glass rounded-[2rem] p-6 border-2 border-amber-500/30 bg-amber-500/5 shadow-xl">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-white italic uppercase">Auditoría Nexus en Curso</h4>
                <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">Auditando Capital: ${user.activeBet.amount} USDT</p>
              </div>
              <div className="flex flex-col items-end">
                <Activity size={24} className="text-amber-500 animate-pulse" />
                <span className="text-[8px] text-slate-500 uppercase font-black mt-1">Arbitrando...</span>
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                 <span>Progreso de Auditoría</span>
                 <span className="text-green-500">Ciclo 40 Minutos</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 animate-[progress_2400s_linear_forwards]" />
              </div>
              <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-xl border border-white/5">
                 <p className="text-[8px] text-slate-500 italic uppercase font-bold">Ganancia Proyectada</p>
                 <p className="text-[10px] text-green-400 font-black italic">+${user.activeBet.potentialProfit.toFixed(2)} USDT</p>
              </div>
           </div>
        </div>
      )}

      {!user.activeBet && hasAlreadyBetToday && (
        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl text-green-500 flex flex-col items-center space-y-2 shadow-inner">
          <CheckCircle2 size={24} />
          <p className="text-xs font-black uppercase tracking-widest">CICLO DIARIO FINALIZADO</p>
          <p className="text-[9px] opacity-70 italic">Tu capital y ganancias han sido liberados correctamente.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Mercados Disponibles</h3>
           <div className="flex items-center space-x-1 text-[9px] text-slate-600 font-bold uppercase">
              <BarChart2 size={12} />
              <span>Volumen 24h</span>
           </div>
        </div>
        {SPORTS.map((sport) => (
          <div key={sport.id} className={`glass rounded-2xl p-4 border transition-all ${sport.baseReturn === 0.025 ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 opacity-80'}`}>
            <div className="flex justify-between items-center">
               <div className="flex items-center space-x-4">
                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-xl shadow-lg`}>
                   {sport.icon}
                 </div>
                 <div>
                   <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-100 italic">{sport.name}</h3>
                      {sport.baseReturn === 0.025 && <span className="text-[7px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full font-black uppercase">Elite Choice</span>}
                   </div>
                   <div className="flex items-center space-x-1.5 mt-1">
                      <span className="text-green-400 text-[10px] font-black italic">+{(sport.baseReturn * 100).toFixed(2)}%</span>
                      <span className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Vol: ${sport.fakeVolume}</span>
                   </div>
                 </div>
               </div>
               <button 
                 disabled={!isMarketOpen || hasAlreadyBetToday || !!user.activeBet}
                 onClick={() => { setSelectedSport(sport); setShowSummary(false); }}
                 className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${(!isMarketOpen || hasAlreadyBetToday || user.activeBet) ? 'bg-slate-800 text-slate-600' : 'gradient-gold text-slate-900 shadow-xl active:scale-95'}`}
               >
                 Invertir
               </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" onClick={() => setSelectedSport(null)}></div>
          <div className="relative glass w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Arbitraje {selectedSport.name}</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocolo Nexus Elite</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Monto a Comprometer (USDT)</label>
                <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => setBetAmount(a => Math.max(10, parseFloat(a)-10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl active:scale-90 transition-all">-</button>
                  <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="flex-1 bg-transparent text-center text-amber-500 font-black text-2xl outline-none" />
                  <button onClick={() => setBetAmount(a => (parseFloat(a)+10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl active:scale-90 transition-all">+</button>
                </div>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Rendimiento ({(selectedSport.baseReturn*100).toFixed(2)}%)</span>
                    <span className="text-green-400 font-black italic">+${(parseFloat(betAmount)*selectedSport.baseReturn).toFixed(2)} USDT</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Tiempo Auditoría</span>
                    <span className="text-amber-500 font-black">40 Minutos</span>
                 </div>
                 <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-100 uppercase italic">Total a Retorno</span>
                    <span className="text-lg font-black text-white italic">${(parseFloat(betAmount)*(1 + selectedSport.baseReturn)).toFixed(2)}</span>
                 </div>
              </div>

              <button 
                onClick={executeBet} 
                disabled={betting}
                className="w-full py-5 gradient-gold rounded-[1.5rem] text-slate-900 font-black uppercase shadow-2xl shadow-amber-500/20 active:scale-95 transition-all text-sm tracking-widest"
              >
                {betting ? <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" /> : "Confirmar Inversión Nexus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
