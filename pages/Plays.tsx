
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  Clock, Activity, History, CheckCircle2, Timer, 
  TrendingUp, ShieldCheck, Zap, Hash, Calendar, 
  ExternalLink, Share2, Award
} from 'lucide-react';

export const PlaysPage: React.FC = () => {
  const { user, allTransactions, dailySports } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const betHistory = useMemo(() => {
    return allTransactions.filter(tx => tx.userId === user?.id && tx.type === 'bet');
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
        <h2 className="text-2xl font-bold text-slate-100 font-display italic tracking-tight uppercase">Centro de Operaciones</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Validación y Auditoría de Jugadas</p>
      </div>

      {/* TICKET EN CURSO (PRIORIDAD PARA CAPTURA) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2">
              <Activity size={14} className="text-amber-500 animate-pulse" />
              <span>Ticket Activo</span>
           </h3>
        </div>
        
        {user?.activeBet && activePlayInfo ? (
          <div className="relative group">
            {/* Aura de Escaneo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative glass rounded-[2.2rem] overflow-hidden border-2 border-amber-500/50 bg-slate-950 shadow-2xl">
              {/* Encabezado del Ticket */}
              <div className="bg-amber-500 px-6 py-2.5 flex justify-between items-center">
                 <div className="flex items-center space-x-2">
                    <ShieldCheck size={14} className="text-slate-900" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Auditoría Nexus Live</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-900 font-mono">ID: ES-{user.id.substring(0, 5).toUpperCase()}</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activePlayInfo.sport?.color || 'from-slate-800 to-slate-950'} flex items-center justify-center text-3xl shadow-lg border border-white/10`}>
                        {activePlayInfo.sport?.icon || '🎮'}
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">{activePlayInfo.sport?.name || 'Arbitraje'}</h4>
                         <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Mercado Internacional</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-amber-500 font-display italic">{activePlayInfo.timeLeft}</p>
                      <p className="text-[8px] text-slate-500 font-black uppercase">Liberación</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Inversión Bruta</p>
                      <p className="text-base font-black text-slate-100">${user.activeBet.amount.toFixed(2)} <span className="text-[8px]">USDT</span></p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Retorno Esperado</p>
                      <p className="text-base font-black text-green-400">+${user.activeBet.potentialProfit.toFixed(2)} <span className="text-[8px]">USDT</span></p>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-green-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        style={{ width: `${activePlayInfo.progress}%` }}
                      />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-600 font-black uppercase">Protocolo de seguridad activo</span>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{activePlayInfo.progress.toFixed(0)}% Auditado</span>
                   </div>
                </div>
              </div>

              {/* Pie del Ticket para Captura */}
              <div className="bg-slate-900/50 px-6 py-4 border-t border-white/5 flex justify-between items-center">
                 <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-bold">
                    <Calendar size={12} />
                    <span>{new Date(user.activeBet.startTime).toLocaleString()}</span>
                 </div>
                 <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Validado</span>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-4 border border-white/5 border-dashed bg-slate-800/10 grayscale opacity-60">
             <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
                <Activity size={32} />
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">No hay tickets activos en este momento</p>
          </div>
        )}
      </section>

      {/* HISTORIAL DE TICKETS (LISTA VERTICAL PARA CAPTURAS) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2">
              <History size={14} className="text-blue-500" />
              <span>Historial de Auditoría</span>
           </h3>
           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TICKETS: {betHistory.length}</span>
        </div>

        <div className="flex flex-col space-y-4">
          {betHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-[9px] font-black uppercase italic">Archivo de operaciones vacío</div>
          ) : (
            betHistory.slice(0, 20).map((bet) => (
              <div key={bet.id} className="relative group transition-all active:scale-98">
                <div className="glass rounded-[1.8rem] overflow-hidden border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                  {/* Banner Lateral de Estado */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[2px_0_10px_rgba(34,197,94,0.3)]"></div>
                  
                  <div className="p-4 pl-6">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 shadow-inner border border-white/5">
                             <Award size={20} />
                          </div>
                          <div>
                             <div className="flex items-center space-x-2">
                                <p className="text-xs font-black text-slate-100 uppercase italic tracking-tighter">{bet.description}</p>
                                <span className="text-[7px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full font-black uppercase">Exitosa</span>
                             </div>
                             <div className="flex items-center space-x-3 mt-1 text-[8px] text-slate-500 font-bold uppercase">
                                <span className="flex items-center space-x-1"><Calendar size={10} /> <span>{new Date(bet.date).toLocaleDateString()}</span></span>
                                <span className="flex items-center space-x-1"><Clock size={10} /> <span>{new Date(bet.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span></span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-100">${bet.amount.toFixed(2)}</p>
                          <p className="text-[7px] text-amber-500 font-black uppercase tracking-widest">TICKET: {bet.id.substring(0, 6).toUpperCase()}</p>
                       </div>
                    </div>
                  </div>

                  {/* Detalle de Auditoría al pie del ticket */}
                  <div className="bg-slate-950/40 px-6 py-2 border-t border-white/5 flex justify-between items-center">
                     <div className="flex items-center space-x-4">
                        <span className="text-[7px] text-slate-600 font-black uppercase">Protocolo: NEXUS_V4</span>
                        <span className="text-[7px] text-slate-600 font-black uppercase">Nodo: ELITE_MAINNET</span>
                     </div>
                     <CheckCircle2 size={12} className="text-green-500/50" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Info de Garantía */}
      <div className="glass p-6 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 space-y-3">
         <div className="flex items-center space-x-2 text-blue-400">
            <Zap size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Prueba de Operación</h4>
         </div>
         <p className="text-[9px] text-slate-400 leading-relaxed italic">
            Este registro sirve como prueba digital de tu operación en la plataforma Elite Sports. Cada ticket cuenta con un ID único verificado por el protocolo Nexus para transparencia en tu red.
         </p>
      </div>
    </div>
  );
};
