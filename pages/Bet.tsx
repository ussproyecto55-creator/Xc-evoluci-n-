
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { SPORTS } from '../constants';
import { Sport } from '../types';
import { CheckCircle2, Trophy, Clock, X, Plus, Minus, ShieldAlert, Timer, Activity } from 'lucide-react';

export const Bet: React.FC = () => {
  const { user, applyCompoundInterest } = useApp();
  const [betting, setBetting] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  
  const [dailyBoostId, setDailyBoostId] = useState('1');

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * SPORTS.length);
    setDailyBoostId(SPORTS[randomIdx].id);

    const checkMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsMarketOpen(hour >= 14 && hour < 17);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (sport: Sport) => {
    setSelectedSport(sport);
    setBetAmount(Math.max(10, user?.balance || 0).toFixed(2));
  };

  const executeBet = () => {
    if (!user || !selectedSport || betting) return;
    const amount = parseFloat(betAmount);
    
    if (!isMarketOpen) {
      alert("El mercado está cerrado. Horario de apuestas: 14:00 - 17:00.");
      return;
    }

    if (isNaN(amount) || amount < 10) {
      alert("La apuesta mínima es de 10 USDT.");
      return;
    }

    if (amount > user.balance) {
      alert("Saldo insuficiente.");
      return;
    }

    setBetting(true);
    const isBoosted = selectedSport.id === dailyBoostId;
    const rate = isBoosted ? 0.025 : selectedSport.baseReturn;

    setTimeout(() => {
      applyCompoundInterest(amount, rate * 100);
      setBetting(false);
      setSelectedSport(null);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 2500);
  };

  const adjustAmount = (delta: number) => {
    setBetAmount(prev => {
      const current = parseFloat(prev) || 0;
      return Math.max(10, current + delta).toFixed(2);
    });
  };

  if (!user) return null;

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${isMarketOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
        <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-widest">
          <Timer size={18} />
          <span>Mercado Global {isMarketOpen ? 'Operativo' : 'Inactivo'}</span>
        </div>
        <span className="text-[10px] font-bold italic">Cierre: 17:00</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <h2 className="text-2xl font-bold font-display text-slate-100 uppercase tracking-tight italic">Panel de Inversión Deportiva</h2>
        <p className="text-slate-400 text-[10px] px-8 italic uppercase font-bold tracking-widest">Rentabilidad Proyectada: +2.5% Diarios</p>
      </div>

      <div className="space-y-4">
        {SPORTS.map((sport) => {
          const isBoosted = sport.id === dailyBoostId;
          const currentRate = isBoosted ? 0.025 : sport.baseReturn;
          
          return (
            <div 
              key={sport.id}
              className={`glass rounded-2xl overflow-hidden border-2 transition-all ${isBoosted ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5 opacity-80'}`}
            >
              <div className={`h-1.5 bg-gradient-to-r ${sport.color}`} />
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-2xl shadow-xl`}>
                    {sport.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 italic">{sport.name}</h3>
                    <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                       <Activity size={10} className="text-green-500" />
                       <span>Mercado en Tiempo Real</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`block text-lg font-bold font-display ${isBoosted ? 'text-amber-400' : 'text-slate-300'}`}>
                    +{(currentRate * 100).toFixed(2)}%
                  </span>
                  <button 
                    disabled={!isMarketOpen}
                    onClick={() => handleOpenModal(sport)}
                    className={`mt-2 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
                      isMarketOpen 
                        ? (isBoosted ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300')
                        : 'bg-slate-900 text-slate-600 grayscale'
                    }`}
                  >
                    {isMarketOpen ? 'Apostar' : 'Cerrado'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedSport(null)}></div>
          <div className="relative glass w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-white/5">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedSport.color} flex items-center justify-center text-xl`}>
                  {selectedSport.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">COLOCAR APUESTA</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mínimo $10 USDT</p>
                </div>
              </div>
              <button onClick={() => setSelectedSport(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center block">Capital a Operar</label>
                <div className="flex items-center space-x-3">
                   <button onClick={() => adjustAmount(-10)} className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5">
                      <Minus size={20} />
                   </button>
                   <div className="flex-1 relative">
                      <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-center text-xl font-bold text-amber-500 outline-none"
                      />
                   </div>
                   <button onClick={() => adjustAmount(10)} className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5">
                      <Plus size={20} />
                   </button>
                </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-white/5 text-xs font-bold uppercase tracking-tight">
                    <span className="text-slate-400">Retorno Neto</span>
                    <span className="text-green-400">+${((parseFloat(betAmount) || 0) * (selectedSport.id === dailyBoostId ? 0.025 : selectedSport.baseReturn)).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-white/5 text-xs font-bold uppercase tracking-tight">
                    <span className="text-slate-400">Tiempo de Entrega</span>
                    <span className="text-amber-500 font-bold italic">Hoy 19:00</span>
                 </div>
              </div>

              <button 
                onClick={executeBet}
                disabled={betting}
                className="w-full py-4 gradient-gold rounded-2xl text-slate-900 font-bold text-lg shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {betting ? <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : "Confirmar Operación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="fixed bottom-24 left-4 right-4 z-[120] glass rounded-2xl p-4 border border-green-500/30 flex items-center space-x-4 animate-in slide-in-from-bottom duration-300 shadow-xl">
          <div className="bg-green-500 rounded-full p-2 text-white shadow-lg"><CheckCircle2 size={24} /></div>
          <div>
            <h4 className="font-bold text-green-400 italic text-sm">Operación Registrada</h4>
            <p className="text-slate-300 text-[10px]">Tus beneficios se acreditarán a las 19:00 automáticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};
