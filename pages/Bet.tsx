
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { SPORTS, BUSINESS_HOURS } from '../constants';
import { Sport, Transaction } from '../types';
import { CheckCircle2, Trophy, Clock, X, Plus, Minus, ShieldAlert, Timer, Activity, ArrowRight, ShieldCheck, BarChart3, AlertTriangle, History, ArrowDownToLine, TrendingUp } from 'lucide-react';

export const Bet: React.FC = () => {
  const { user, applyCompoundInterest, allTransactions, showNotification } = useApp();
  const [betting, setBetting] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [showSummary, setShowSummary] = useState(false);
  const [dailyBoostId, setDailyBoostId] = useState('1');

  // Lógica de mercado abierto: 11:00 AM a 4:00 PM (16:00)
  const isMarketOpen = useMemo(() => {
    const hours = new Date().getHours();
    return hours >= BUSINESS_HOURS.BET.START && hours < BUSINESS_HOURS.BET.END;
  }, []);

  // Lógica de restricción diaria: Solo una operación cada día
  const hasAlreadyBetToday = useMemo(() => {
    if (!user?.lastBetDate) return false;
    const today = new Date().toDateString();
    const lastBet = new Date(user.lastBetDate).toDateString();
    return today === lastBet;
  }, [user?.lastBetDate]);

  const dailyRate = useMemo(() => {
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const seed = (day * 17 + month * 7) % 5; 
    const variations = [0.0245, 0.0255, 0.0265, 0.0235, 0.027]; 
    return variations[seed];
  }, []);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * SPORTS.length);
    setDailyBoostId(SPORTS[randomIdx].id);
  }, []);

  const handleOpenModal = (sport: Sport) => {
    if (hasAlreadyBetToday || user?.activeBet) {
      showNotification("Ya has realizado tu operación diaria. Vuelve mañana para seguir invirtiendo.", "info");
      return;
    }
    setSelectedSport(sport);
    setBetAmount((user?.balance || 10).toFixed(2));
    setShowSummary(false);
  };

  const goToSummary = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 10) {
      showNotification("La inversión mínima es de 10 USDT.", "error");
      return;
    }
    if (amount > (user?.balance || 0)) {
      showNotification("Saldo insuficiente en balance principal.", "error");
      return;
    }
    setShowSummary(true);
  };

  const executeBet = async () => {
    if (!user || !selectedSport || betting) return;
    const amount = parseFloat(betAmount);
    
    if (!isMarketOpen) {
      showNotification("El mercado está actualmente cerrado. Horario: 11:00 - 16:00", "error");
      return;
    }

    setBetting(true);
    const isBoosted = selectedSport.id === dailyBoostId;
    const rate = isBoosted ? dailyRate : selectedSport.baseReturn;

    try {
      // Simular un pequeño retardo de procesamiento UI
      await new Promise(res => setTimeout(res, 1500));
      await applyCompoundInterest(amount, rate * 100, selectedSport.id);
      
      setBetting(false);
      setSelectedSport(null);
      setShowSummary(false);
      setDone(true);
      showNotification("Operación iniciada correctamente", "success");
      setTimeout(() => setDone(false), 5000);
    } catch (error) {
      console.error("Error al ejecutar la inversión:", error);
      showNotification("Error al procesar la inversión", "error");
      setBetting(false);
    }
  };

  const adjustAmount = (delta: number) => {
    setBetAmount(prev => {
      const current = parseFloat(prev) || 0;
      return Math.max(10, current + delta).toFixed(2);
    });
  };

  const betHistory = useMemo(() => {
    if (!user || !allTransactions) return [];
    return allTransactions
      .filter(tx => tx.userId === user.id && tx.type === 'bet')
      .slice(0, 10);
  }, [user, allTransactions]);

  const getSportById = (id: string) => SPORTS.find(s => s.id === id) || SPORTS[0];

  if (!user) return null;

  const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(Date.now() + 1000 * 60 * 40).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      {/* Indicador de Estado del Mercado */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${isMarketOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
        <div className="flex items-center space-x-2 font-bold text-[10px] uppercase tracking-widest">
          {isMarketOpen ? <Timer size={18} className="animate-pulse" /> : <ShieldAlert size={18} />}
          <span>{isMarketOpen ? 'Mercado Abierto (11:00 - 16:00)' : 'Mercado Cerrado (Abre 11:00 AM)'}</span>
        </div>
        <span className="text-[10px] font-bold italic">Max Hoy: {(dailyRate * 100).toFixed(2)}%</span>
      </div>

      {/* APUESTA ACTIVA / ESTADO */}
      {user.activeBet && (
        <div className="glass rounded-[2rem] p-6 border-2 border-amber-500/30 bg-amber-500/5 shadow-2xl animate-pulse">
           <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSportById(user.activeBet.sportId).color} flex items-center justify-center text-xl`}>
                    {getSportById(user.activeBet.sportId).icon}
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white italic uppercase leading-none">Operación en Curso</h4>
                    <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">Auditando arbitraje deportivo...</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase">Capital</p>
                 <p className="text-sm font-black text-white">${user.activeBet.amount.toFixed(2)}</p>
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest">
                 <span>Progreso Ciclo</span>
                 <span className="text-green-500">40 Minutos</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 animate-[progress_10s_linear_infinite]" />
              </div>
              <div className="flex justify-between items-center pt-2">
                 <div className="flex items-center space-x-1 text-[8px] font-bold text-slate-500 uppercase">
                    <Clock size={10} />
                    <span>Llegada aprox: {new Date(user.activeBet.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <div className="text-[10px] font-black text-green-400 italic">
                    Ganancia Est: +${user.activeBet.potentialProfit.toFixed(2)}
                 </div>
              </div>
           </div>
        </div>
      )}

      {hasAlreadyBetToday && !user.activeBet && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center space-x-3 text-green-500 shadow-lg">
           <CheckCircle2 size={20} className="shrink-0" />
           <p className="text-[11px] font-bold leading-tight">OPERACIÓN DIARIA FINALIZADA. <br/><span className="text-[9px] opacity-70">Tu capital ha sido liberado junto con tus ganancias. Vuelve mañana.</span></p>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <h2 className="text-2xl font-bold font-display text-slate-100 uppercase tracking-tight italic">Opciones de Mercado</h2>
        <p className="text-amber-500 text-[10px] px-8 italic uppercase font-black tracking-widest leading-relaxed">
          EL INTERÉS COMPUESTO ES MANUAL. <br/> SE ENTREGA 40 MINUTOS DESPUÉS DE LA OPERACIÓN.
        </p>
      </div>

      <div className="space-y-4">
        {SPORTS.map((sport) => {
          const isBoosted = sport.id === dailyBoostId;
          const currentRate = isBoosted ? dailyRate : sport.baseReturn;
          
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
                    <div className="flex items-center space-x-2">
                       <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                          <Activity size={10} className="text-green-500" />
                          <span>Activo</span>
                       </div>
                       <div className="flex items-center space-x-1 text-[9px] text-amber-500/60 font-bold uppercase tracking-tighter">
                          <BarChart3 size={10} />
                          <span>Vol: {sport.fakeVolume} USDT</span>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`block text-lg font-bold font-display ${isBoosted ? 'text-amber-400' : 'text-slate-300'}`}>
                    +{(currentRate * 100).toFixed(2)}%
                  </span>
                  <button 
                    disabled={!isMarketOpen || hasAlreadyBetToday || !!user.activeBet}
                    onClick={() => handleOpenModal(sport)}
                    className={`mt-2 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
                      (isMarketOpen && !hasAlreadyBetToday && !user.activeBet) 
                        ? (isBoosted ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-300')
                        : 'bg-slate-900 text-slate-600 grayscale'
                    }`}
                  >
                    {!isMarketOpen ? 'Cerrado' : (hasAlreadyBetToday || user.activeBet) ? 'Completado' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORIAL DE APUESTAS */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2 px-2">
           <History size={16} className="text-blue-500" />
           <span>Historial de Operaciones</span>
        </h3>
        
        <div className="space-y-3">
          {betHistory.length === 0 ? (
            <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-slate-500 space-y-2">
               <TrendingUp size={32} className="opacity-20" />
               <p className="text-[10px] font-bold uppercase tracking-widest italic">Aún no hay operaciones registradas</p>
            </div>
          ) : (
            betHistory.map((bet) => (
              <div key={bet.id} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                       <ArrowDownToLine size={18} className="text-blue-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-200 uppercase">Capital Bloqueado</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(bet.date).toLocaleDateString()} • {new Date(bet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-white">${bet.amount.toFixed(2)}</p>
                    <p className="text-[8px] text-green-500 font-black uppercase italic">Auditado</p>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedSport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setSelectedSport(null); setShowSummary(false); }}></div>
          <div className="relative glass w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-white/5">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedSport.color} flex items-center justify-center text-xl`}>
                  {selectedSport.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">
                    {showSummary ? 'REVISAR OPERACIÓN' : 'CONFIGURAR INVERSIÓN'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedSport.name}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedSport(null); setShowSummary(false); }} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            {!showSummary ? (
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center block">Capital a Operar (USDT)</label>
                  <div className="flex items-center space-x-3">
                     <button onClick={() => adjustAmount(-10)} className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5 active:scale-90 transition-all">
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
                     <button onClick={() => adjustAmount(10)} className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5 active:scale-90 transition-all">
                        <Plus size={20} />
                     </button>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-2 text-center">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entrega de Capital + Ganancia</p>
                   <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                         <p className="text-[8px] text-slate-500 uppercase">Inicio</p>
                         <p className="text-xs font-bold text-slate-200">{startTime}</p>
                      </div>
                      <ArrowRight size={12} className="text-amber-500" />
                      <div className="text-center">
                         <p className="text-[8px] text-slate-500 uppercase">Llegada (+40m)</p>
                         <p className="text-xs font-bold text-green-400">{endTime}</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={goToSummary}
                  className="w-full py-4 gradient-gold rounded-2xl text-slate-900 font-bold text-lg shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continuar</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-4">
                   <div className="bg-slate-800/80 p-5 rounded-[2rem] border border-white/10 space-y-4 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <ShieldCheck size={60} />
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Concepto</span>
                         <span className="text-xs font-bold text-white italic">Inversión {selectedSport.name}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Capital Bloqueado</span>
                         <span className="text-sm font-black text-white">${parseFloat(betAmount).toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Ciclo de Entrega</span>
                         <span className="text-sm font-black text-green-400">+40 Minutos</span>
                      </div>
                   </div>
                </div>

                <div className="flex space-x-3">
                   <button 
                    onClick={() => setShowSummary(false)}
                    className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold text-sm uppercase transition-all active:scale-95"
                   >
                     Atrás
                   </button>
                   <button 
                    onClick={executeBet}
                    disabled={betting}
                    className="flex-[2] py-4 gradient-gold rounded-2xl text-slate-900 font-bold text-sm uppercase shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {betting ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : "Confirmar Operación"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="fixed bottom-24 left-4 right-4 z-[120] glass rounded-2xl p-4 border border-green-500/30 flex items-center space-x-4 animate-in slide-in-from-bottom duration-300 shadow-xl">
          <div className="bg-green-500 rounded-full p-2 text-white shadow-lg"><CheckCircle2 size={24} /></div>
          <div className="flex-1">
            <h4 className="font-bold text-green-400 italic text-sm leading-tight">Ciclo de Inversión Iniciado</h4>
            <p className="text-slate-300 text-[10px]">Tu capital y ganancias estarán disponibles en tu balance en **40 minutos**.</p>
          </div>
        </div>
      )}
    </div>
  );
};
