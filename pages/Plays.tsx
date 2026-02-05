
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  Clock, Activity, History, CheckCircle2, Timer, 
  ShieldCheck, Zap, Calendar, Award, Target, Landmark, ArrowRight, Fingerprint
} from 'lucide-react';

export const PlaysPage: React.FC = () => {
  const { user, allTransactions, dailySports } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const betHistory = useMemo(() => {
    return allTransactions.filter(tx => tx.userId === user?.id && tx.type === 'bet')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, user?.id]);

  const activePlayInfo = useMemo(() => {
    if (!user?.activeBet) return null;
    const sport = dailySports.find(s => s.id === user.activeBet?.sportId);
    
    const start = new Date(user.activeBet.startTime).getTime();
    const end = new Date(user.activeBet.endTime).getTime();
    const now = currentTime.getTime();
    
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    
    const remainingMs = Math.max(0, end - now);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    return { sport, progress, timeLeft: `${minutes}:${seconds.toString().padStart(2, '0')}` };
  }, [user?.activeBet, dailySports, currentTime]);

  return (
    <div className="px-4 py-6 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-black text-slate-100 font-display italic tracking-tight uppercase">Auditoría Nexus</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Validación de Transacciones en Red</p>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2">
              <Activity size={14} className="text-amber-500 animate-pulse" />
              <span>Ciclo de Arbitraje Activo</span>
           </h3>
        </div>
        
        {user?.activeBet && activePlayInfo ? (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-75"></div>
            <div className="relative glass rounded-[2.2rem] overflow-hidden border-2 border-amber-500/50 bg-slate-950 shadow-2xl">
              <div className="bg-amber-500 px-6 py-3 flex justify-between items-center">
                 <div className="flex items-center space-x-2">
                    <ShieldCheck size={16} className="text-slate-900" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Contrato Auditado</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                    <Fingerprint size={12} className="text-slate-900/50" />
                    <span className="text-[10px] font-black text-slate-900 font-mono">ID-{user.activeBet.sportId}</span>
                 </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activePlayInfo.sport?.color || 'from-slate-800 to-slate-950'} flex items-center justify-center text-3xl shadow-lg border border-white/10`}>
                        {activePlayInfo.sport?.icon || '🎮'}
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-white italic uppercase tracking-tighter leading-tight">{activePlayInfo.sport?.name || 'Arbitraje de Liquidez'}</h4>
                         <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mt-1">Marcador: {user.activeBet.market}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-amber-500 font-display italic tracking-tighter">{activePlayInfo.timeLeft}</p>
                      <p className="text-[8px] text-slate-500 font-black uppercase">Seg. Restantes</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Principal</p>
                      <p className="text-base font-black text-slate-100">${user.activeBet.amount.toFixed(2)}</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">ROI Neto</p>
                      <p className="text-base font-black text-green-400">+${user.activeBet.potentialProfit.toFixed(2)}</p>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all" style={{ width: `${activePlayInfo.progress}%` }} />
                   </div>
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{activePlayInfo.progress.toFixed(0)}% Sincronizado</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase">Protocolo Nexus V4</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4 border border-white/5 border-dashed opacity-50">
             <Activity size={32} className="text-slate-600" />
             <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">Sin ciclos activos de inversión</p>
                <p className="text-[8px] text-slate-700 font-bold uppercase">Inicia una operación en la pestaña 'Invertir'</p>
             </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2">
              <History size={14} className="text-blue-500" />
              <span>Historial de Operaciones</span>
           </h3>
        </div>

        <div className="space-y-3">
          {betHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-700 text-[9px] font-black uppercase italic tracking-widest">Archivo de transacciones vacío</div>
          ) : (
            betHistory.slice(0, 20).map((bet) => (
              <div key={bet.id} className="glass rounded-2xl border border-white/5 p-4 relative overflow-hidden group hover:bg-white/5 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/40"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 border border-white/5 shadow-inner">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-100 uppercase italic leading-none">{bet.description}</p>
                      <div className="mt-1.5 flex items-center space-x-2 text-[8px] text-slate-500 font-bold uppercase">
                        <Calendar size={10} /> <span>{new Date(bet.date).toLocaleDateString()}</span>
                        <div className="h-2 w-px bg-white/10 mx-1"></div>
                        <CheckCircle2 size={10} className="text-green-500" /> <span className="text-green-500">LIQUIDADO</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-100 tracking-tighter">${bet.amount.toFixed(2)}</p>
                    <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest">USDT ASIGNADO</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
