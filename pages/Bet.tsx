
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { SPORTS, BUSINESS_HOURS } from '../constants';
import { Sport } from '../types';
import { CheckCircle2, Clock, X, Plus, Minus, Timer, Activity, ArrowRight, ShieldCheck, History, ArrowDownToLine, TrendingUp } from 'lucide-react';

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
      showNotification("Mercado cerrado. Vuelve a las 11:00 AM.", "error");
      return;
    }
    setBetting(true);
    try {
      await applyCompoundInterest(parseFloat(betAmount), 2.5, selectedSport.id);
      setSelectedSport(null);
      setShowSummary(false);
      showNotification("Ciclo de 40 minutos iniciado.", "success");
    } catch (err) {
      showNotification("Error al procesar.", "error");
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
        <span className="text-[10px] font-bold">Interés: 2.5%</span>
      </div>

      {user.activeBet && (
        <div className="glass rounded-[2rem] p-6 border-2 border-amber-500/30 bg-amber-500/5">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-white italic uppercase">Auditoría en Curso</h4>
                <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">Capital Bloqueado: ${user.activeBet.amount}</p>
              </div>
              <Activity size={24} className="text-amber-500 animate-pulse" />
           </div>
           <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                 <span>Progreso Real</span>
                 <span className="text-green-500">40 Minutos</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 animate-[progress_2400s_linear_forwards]" />
              </div>
              <p className="text-[8px] text-slate-500 italic text-center">No cierres la sesión para ver el retorno en tiempo real.</p>
           </div>
        </div>
      )}

      {!user.activeBet && hasAlreadyBetToday && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-500 text-xs font-bold text-center">
          OPERACIÓN DIARIA FINALIZADA. VUELVE MAÑANA.
        </div>
      )}

      <div className="space-y-4">
        {SPORTS.map((sport) => (
          <div key={sport.id} className="glass rounded-2xl p-4 border border-white/5 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-xl shadow-lg`}>
                {sport.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-100">{sport.name}</h3>
                <span className="text-green-400 text-[10px] font-bold">+2.5%</span>
              </div>
            </div>
            <button 
              disabled={!isMarketOpen || hasAlreadyBetToday || !!user.activeBet}
              onClick={() => { setSelectedSport(sport); setShowSummary(false); }}
              className={`px-6 py-2 rounded-xl font-bold text-xs uppercase ${(!isMarketOpen || hasAlreadyBetToday || user.activeBet) ? 'bg-slate-800 text-slate-600' : 'gradient-gold text-slate-900 shadow-lg active:scale-95'}`}
            >
              Invertir
            </button>
          </div>
        ))}
      </div>

      {selectedSport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90" onClick={() => setSelectedSport(null)}></div>
          <div className="relative glass w-full max-w-sm rounded-[2rem] p-6 space-y-6">
            <h3 className="text-xl font-black text-white italic uppercase">Inversión {selectedSport.name}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <button onClick={() => setBetAmount(a => Math.max(10, parseFloat(a)-10).toString())} className="w-10 h-10 bg-slate-800 rounded-lg text-white font-bold">-</button>
                <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-lg py-2 text-center text-amber-500 font-bold" />
                <button onClick={() => setBetAmount(a => (parseFloat(a)+10).toString())} className="w-10 h-10 bg-slate-800 rounded-lg text-white font-bold">+</button>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-[10px] space-y-2">
                 <div className="flex justify-between"><span>Retorno Est:</span><span className="text-green-400 font-bold">+${(parseFloat(betAmount)*0.025).toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>Tiempo Auditoría:</span><span className="text-amber-500 font-bold">40 Minutos</span></div>
              </div>
              <button onClick={executeBet} className="w-full py-4 gradient-gold rounded-xl text-slate-900 font-black uppercase shadow-xl active:scale-95">Confirmar Operación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
