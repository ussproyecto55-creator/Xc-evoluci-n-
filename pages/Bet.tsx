
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { BUSINESS_HOURS } from '../constants';
import { Sport } from '../types';
import { CheckCircle2, Clock, Timer, Activity, ArrowRight, BarChart2, ShieldCheck } from 'lucide-react';

export const Bet: React.FC = () => {
  const { user, applyCompoundInterest, dailySports, showNotification } = useApp();
  const [betting, setBetting] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');

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
      showNotification("Mercado cerrado. Abre de 11:00 AM a 4:00 PM.", "error");
      return;
    }
    if (parseFloat(betAmount) > user.balance) {
      showNotification("Saldo disponible insuficiente.", "error");
      return;
    }

    setBetting(true);
    try {
      await applyCompoundInterest(parseFloat(betAmount), selectedSport.baseReturn * 100, selectedSport.id);
      setSelectedSport(null);
      showNotification("Operación iniciada. Auditoría en curso (40 min).", "success");
    } catch (err) {
      showNotification("Error de red.", "error");
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
          <span>{isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado (11AM-4PM)'}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Interés Máximo</span>
          <span className="text-[10px] font-black text-amber-500">2.50% Diario</span>
        </div>
      </div>

      {user.activeBet && (
        <div className="glass rounded-[2rem] p-6 border-2 border-amber-500/30 bg-amber-500/5 shadow-xl animate-pulse">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-white italic uppercase">Capital en Auditoría</h4>
                <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">Auditando: ${user.activeBet.amount} USDT</p>
              </div>
              <Activity size={24} className="text-amber-500" />
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                 <span>Protocolo Nexus v4.2</span>
                 <span className="text-green-500">Ciclo Activo</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 animate-[progress_2400s_linear_forwards]" />
              </div>
              <p className="text-[8px] text-slate-500 italic text-center uppercase font-bold">Ganancia Proyectada: <span className="text-green-400">+${user.activeBet.potentialProfit.toFixed(2)} USDT</span></p>
           </div>
        </div>
      )}

      {!user.activeBet && hasAlreadyBetToday && (
        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl text-green-500 flex flex-col items-center space-y-2 shadow-inner">
          <CheckCircle2 size={24} />
          <p className="text-xs font-black uppercase tracking-widest">CICLO DIARIO COMPLETADO</p>
          <p className="text-[9px] opacity-70 italic text-center">Capital y ganancias liberadas. Vuelve mañana a las 11:00 AM.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Eventos en Vivo</h3>
           <div className="flex items-center space-x-1 text-[9px] text-slate-600 font-bold uppercase">
              <BarChart2 size={12} />
              <span>Rotación 24h</span>
           </div>
        </div>
        
        {dailySports.map((sport) => (
          <div key={sport.id} className={`glass rounded-2xl p-4 border transition-all ${sport.baseReturn >= 0.024 ? 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20 shadow-amber-500/5 shadow-lg' : 'border-white/5 opacity-80'}`}>
            <div className="flex justify-between items-center">
               <div className="flex items-center space-x-4">
                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-xl shadow-lg border border-white/10`}>
                   {sport.icon}
                 </div>
                 <div>
                   <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-100 italic text-sm">{sport.name}</h3>
                      {sport.baseReturn >= 0.024 && <span className="text-[7px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full font-black uppercase animate-pulse">Hot Pick</span>}
                   </div>
                   <div className="flex items-center space-x-1.5 mt-1">
                      <span className="text-green-400 text-[10px] font-black italic">+{(sport.baseReturn * 100).toFixed(2)}%</span>
                      <span className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Liq: ${sport.fakeVolume}</span>
                   </div>
                 </div>
               </div>
               <button 
                 disabled={!isMarketOpen || hasAlreadyBetToday || !!user.activeBet}
                 onClick={() => setSelectedSport(sport)}
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
               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSport.color} mx-auto flex items-center justify-center text-3xl shadow-xl`}>
                  {selectedSport.icon}
               </div>
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mt-4">{selectedSport.name}</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Contrato de Arbitraje Nexus</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Capital a Comprometer (USDT)</label>
                <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => setBetAmount(a => Math.max(10, parseFloat(a)-10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl">-</button>
                  <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="flex-1 bg-transparent text-center text-amber-500 font-black text-2xl outline-none" />
                  <button onClick={() => setBetAmount(a => (parseFloat(a)+10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl">+</button>
                </div>
                <div className="flex justify-between px-2">
                   <span className="text-[8px] text-slate-500 font-bold uppercase">Disponible: ${user.balance.toFixed(2)}</span>
                   <button onClick={() => setBetAmount(user.balance.toFixed(0))} className="text-[8px] text-amber-500 font-black uppercase underline">Máximo</button>
                </div>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase italic">Rendimiento</span>
                    <span className="text-green-400 font-black italic">+${(parseFloat(betAmount)*selectedSport.baseReturn).toFixed(2)} USDT</span>
                 </div>
                 <div className="flex justify-between text-xs border-t border-white/5 pt-3">
                    <span className="text-xs font-black text-slate-100 uppercase italic">Total Liberado</span>
                    <span className="text-lg font-black text-white italic">${(parseFloat(betAmount)*(1 + selectedSport.baseReturn)).toFixed(2)}</span>
                 </div>
              </div>

              <button 
                onClick={executeBet} 
                disabled={betting || parseFloat(betAmount) > user.balance}
                className="w-full py-5 gradient-gold rounded-[1.5rem] text-slate-900 font-black uppercase shadow-2xl shadow-amber-500/20 active:scale-95 transition-all text-sm tracking-widest"
              >
                {betting ? <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" /> : "Confirmar e Invertir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
