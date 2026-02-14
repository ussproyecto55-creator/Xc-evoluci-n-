
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { BUSINESS_HOURS } from '../constants';
import { Sport } from '../types';
import { CheckCircle2, Clock, Timer, Activity, BarChart2, ShieldCheck, Zap, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

export const Bet: React.FC = () => {
  const { user, applyCompoundInterest, dailySports, showNotification, getDRTime } = useApp();
  const [betting, setBetting] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [drCurrentTime, setDrCurrentTime] = useState(getDRTime());

  useEffect(() => {
    const timer = setInterval(() => setDrCurrentTime(getDRTime()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isWeekend = useMemo(() => {
    const day = drCurrentTime.getDay();
    return day === 0 || day === 6;
  }, [drCurrentTime]);

  const isMarketOpen = useMemo(() => {
    if (isWeekend) return false;
    const hoursRD = drCurrentTime.getHours();
    return hoursRD >= BUSINESS_HOURS.BET.START && hoursRD < BUSINESS_HOURS.BET.END;
  }, [drCurrentTime, isWeekend]);

  const isWednesday = drCurrentTime.getDay() === 3;

  const hasAlreadyBetToday = useMemo(() => {
    if (!user?.lastBetDate) return false;
    const lastBetDate = new Date(user.lastBetDate);
    const lastBetRD = new Date(lastBetDate.toLocaleString("en-US", { timeZone: "America/Santo_Domingo" }));
    const currentRD = drCurrentTime;
    return lastBetRD.toDateString() === currentRD.toDateString();
  }, [user?.lastBetDate, drCurrentTime]);

  const previewProfit = useMemo(() => {
    if (!selectedSport) return 0;
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return amount * selectedSport.baseReturn;
  }, [selectedSport, betAmount]);

  const executeBet = async () => {
    if (!user || !selectedSport || betting) return;
    
    if (!isMarketOpen) {
      showNotification("Mercado cerrado por horario o fin de semana.", "error");
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount > user.balance) {
      showNotification("Saldo disponible insuficiente.", "error");
      return;
    }
    if (amount < 10) {
      showNotification("Inversión mínima requerida: 10 USDT.", "error");
      return;
    }

    setBetting(true);
    try {
      await applyCompoundInterest(amount, selectedSport.baseReturn * 100, selectedSport.id, selectedSport.market);
      setSelectedSport(null);
      showNotification("Operación de Liquidez Iniciada.", "success");
    } catch (err) {
      showNotification("Error de red.", "error");
    } finally {
      setBetting(false);
    }
  };

  if (!user) return null;

  if (isWeekend) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
         <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl animate-pulse">
            <AlertTriangle size={48} />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mercado en Pausa</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-10">Los servidores de arbitraje entran en mantenimiento los Sábados y Domingos. Vuelve el Lunes a las 11:00 AM.</p>
         </div>
         <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 text-[9px] text-amber-500 font-black uppercase italic">
            Próxima apertura: Lunes 11:00 AM HN
         </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${isMarketOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
        <div className="flex items-center space-x-2 font-bold text-[10px] uppercase">
          {isMarketOpen ? <Timer size={18} className="animate-pulse" /> : <Clock size={18} />}
          <span>{isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado (Abre 11:00 AM)'}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Potencial ROI</span>
          <span className="text-[10px] font-black text-amber-500">Hasta {isWednesday ? '4.00%' : '2.50%'}</span>
        </div>
      </div>

      {isWednesday && (
         <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <Zap className="text-amber-500" size={20} />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">¡Súper Miércoles! Jugada Principal al 4% ROI</span>
            </div>
         </div>
      )}

      {user.activeBet && (
        <div className="glass rounded-[2rem] p-6 border-2 border-amber-500/30 bg-amber-500/5 shadow-xl">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-white italic uppercase leading-none tracking-tighter">Arbitraje en Curso</h4>
                <div className="mt-2 flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Contrato Inverso: {user.activeBet.market}</p>
                </div>
              </div>
              <Activity size={24} className="text-amber-500 animate-bounce" />
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-widest">
                 <span>Protocolo Nexus V4.2</span>
                 <span className="text-green-500">Auditoría en Tiempo Real</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 animate-[progress_2400s_linear_forwards]" />
              </div>
              <div className="flex justify-between items-center text-[9px]">
                 <p className="text-slate-400 font-bold uppercase italic">Beneficio Estimado:</p>
                 <p className="text-green-400 font-black">+${user.activeBet.potentialProfit.toFixed(2)} USDT</p>
              </div>
           </div>
        </div>
      )}

      {!user.activeBet && hasAlreadyBetToday && (
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-green-500 flex flex-col items-center space-y-2 shadow-inner">
          <CheckCircle2 size={32} />
          <p className="text-xs font-black uppercase tracking-widest">CICLO DIARIO COMPLETADO</p>
          <p className="text-[9px] opacity-70 italic text-center">Capital y utilidades liberadas. Vuelve en el próximo periodo de reset.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2">
              <BarChart2 size={14} className="text-amber-500" />
              <span>Mercados de Liquidez Activa</span>
           </h3>
           <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Reset 11 AM</span>
        </div>
        
        {dailySports.map((sport) => (
          <div key={sport.id} className={`glass rounded-2xl p-4 border transition-all ${sport.baseReturn >= 0.024 ? 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20 shadow-amber-500/5 shadow-lg' : 'border-white/5 opacity-80'}`}>
            <div className="flex justify-between items-center">
               <div className="flex items-center space-x-4 flex-1 min-w-0">
                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-xl shadow-lg border border-white/10 shrink-0`}>
                   {sport.icon}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-100 italic text-sm truncate uppercase tracking-tighter">{sport.name}</h3>
                      {sport.baseReturn >= 0.039 && <span className="text-[7px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full font-black uppercase animate-pulse shrink-0">SUPER WEDNESDAY</span>}
                   </div>
                   <div className="flex flex-col mt-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 text-[10px] font-black italic leading-none">+{(sport.baseReturn * 100).toFixed(2)}%</span>
                        <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">ROI Diario</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-1.5">
                         <ShieldCheck size={10} className="text-amber-500/50" />
                         <span className="text-slate-200 text-[8px] font-bold uppercase tracking-widest truncate">Anti-Score: {sport.market}</span>
                      </div>
                   </div>
                 </div>
               </div>
               <button 
                 disabled={!isMarketOpen || hasAlreadyBetToday || !!user.activeBet}
                 onClick={() => setSelectedSport(sport)}
                 className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${(!isMarketOpen || hasAlreadyBetToday || user.activeBet) ? 'bg-slate-800 text-slate-600' : 'gradient-gold text-slate-900 shadow-xl active:scale-95'}`}
               >
                 Invertir
               </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md" onClick={() => setSelectedSport(null)}></div>
          <div className="relative glass w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSport.color} mx-auto flex items-center justify-center text-3xl shadow-xl border border-white/10`}>
                  {selectedSport.icon}
               </div>
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mt-4 leading-none">{selectedSport.name}</h3>
               <div className="bg-amber-500/10 px-4 py-2 rounded-full inline-flex items-center space-x-2 border border-amber-500/30">
                  <TrendingUp size={12} className="text-amber-500" />
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Anti-Score: {selectedSport.market}</p>
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inversión (USDT)</label>
                   <span className="text-[9px] text-slate-400 font-bold">Balance: ${user.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-2xl border border-white/10">
                  <button onClick={() => setBetAmount(a => Math.max(10, (parseFloat(a) || 0)-10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl hover:bg-slate-700">-</button>
                  <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="flex-1 bg-transparent text-center text-amber-500 font-black text-2xl outline-none placeholder-amber-500/20" placeholder="0.00" />
                  <button onClick={() => setBetAmount(a => ((parseFloat(a) || 0)+10).toString())} className="w-12 h-12 bg-slate-800 rounded-xl text-white font-black text-xl hover:bg-slate-700">+</button>
                </div>
              </div>

              <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/10 space-y-4 text-center">
                 <div className="flex flex-col space-y-1">
                    <span className="text-slate-500 font-black uppercase text-[8px] tracking-[0.2em]">Retorno Neto Proyectado</span>
                    <span className="text-green-400 font-black italic text-2xl tracking-tighter shadow-green-500/10">+${previewProfit.toFixed(2)} USDT</span>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex flex-col items-center space-y-2 text-center">
                    <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight italic">Operación auditada por protocolo Nexus. Tu capital está protegido contra el marcador inverso.</p>
                 </div>
              </div>

              <button 
                onClick={executeBet} 
                disabled={betting || (parseFloat(betAmount) || 0) > user.balance || (parseFloat(betAmount) || 0) < 10}
                className={`w-full py-5 rounded-[1.5rem] font-black uppercase shadow-2xl transition-all text-sm tracking-widest flex items-center justify-center space-x-2 ${
                  betting || (parseFloat(betAmount) || 0) > user.balance || (parseFloat(betAmount) || 0) < 10
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'gradient-gold text-slate-900 shadow-amber-500/20 active:scale-95'
                }`}
              >
                {betting ? <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : (
                  <>
                    <Zap size={18} />
                    <span>Confirmar Ciclo</span>
                  </>
                )}
              </button>
              
              {(parseFloat(betAmount) || 0) > user.balance && (
                <p className="text-[9px] text-red-500 text-center font-black uppercase tracking-widest animate-pulse">Fondos Insuficientes</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
