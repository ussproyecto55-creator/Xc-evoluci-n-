
import React from 'react';
import { useApp } from '../store';
import { Crown, Gem, Zap, CheckCircle, ShieldCheck, TrendingUp, Info, Gift } from 'lucide-react';
import { VIP_LEVELS } from '../constants';

export const VIPPage: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  const currentVIP = VIP_LEVELS[user.vipLevel];

  return (
    <div className="px-4 py-6 space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-100 italic font-display uppercase tracking-tight">Estatus VIP Elite</h2>
        <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">Tu camino hacia la libertad financiera</p>
      </div>

      <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Crown size={120} className="text-amber-500" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className={`w-20 h-20 rounded-3xl ${currentVIP.color} flex items-center justify-center text-slate-900 shadow-2xl border-4 border-white/20`}>
            <Crown size={48} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Nivel Actual</p>
            <h3 className="text-4xl font-black text-white italic font-display tracking-tighter">{currentVIP.name}</h3>
          </div>
          <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 flex items-center space-x-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase text-slate-300">Inversión Total: ${user.totalRecharge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-2 px-2">
          <Zap size={14} className="text-amber-500" />
          <span>Beneficios por Nivel</span>
        </h3>
        
        <div className="space-y-6">
          {VIP_LEVELS.filter(v => v.id > 0).map((v) => {
            const isUnlocked = user.totalRecharge >= v.minRecharge;
            const isNext = !isUnlocked && (user.vipLevel === v.id - 1);
            
            return (
              <div 
                key={v.id} 
                className={`glass rounded-[2rem] overflow-hidden border-2 transition-all relative ${
                  isUnlocked 
                    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : isNext 
                      ? 'border-blue-500/30 bg-blue-500/5' 
                      : 'border-white/5 grayscale opacity-40'
                }`}
              >
                <div className={`h-2 w-full ${v.color}`} />
                <div className="p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                         <div className={`w-14 h-14 rounded-2xl ${v.color} flex items-center justify-center text-slate-900 shadow-xl`}>
                            {v.id >= 6 ? <Gem size={30} /> : v.id >= 3 ? <Crown size={30} /> : <Zap size={30} />}
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-slate-100 italic">{v.name}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Jerarquía de Inversión</p>
                         </div>
                      </div>
                      {isUnlocked && (
                        <div className="bg-amber-500 p-1.5 rounded-full text-slate-900 shadow-lg">
                           <CheckCircle size={20} />
                        </div>
                      )}
                      {isNext && (
                        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-blue-500/30">Próximo</div>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Inversión Requerida</p>
                         <p className="text-sm font-bold text-slate-100">${v.minRecharge} USDT</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Bono por Ascensión</p>
                         <p className="text-sm font-black text-green-500">+{v.bonus} USDT</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Comisión Retiro</p>
                         <p className="text-sm font-bold text-amber-500">{v.commission}% por Operación</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Retiros Mensuales</span>
                            <span className="text-sm font-bold text-slate-100">{v.withdrawalsPerMonth}</span>
                         </div>
                      </div>
                   </div>
                   
                   {!isUnlocked && isNext && (
                     <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                           <span className="text-slate-500">Progreso de Desbloqueo</span>
                           <span className="text-blue-400">{Math.round((user.totalRecharge / v.minRecharge) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                           <div className="bg-blue-500 h-full transition-all" style={{ width: `${(user.totalRecharge / v.minRecharge) * 100}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-2 italic text-center">Faltan ${(v.minRecharge - user.totalRecharge).toFixed(2)} USDT para bono de {v.bonus} USDT</p>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-800/20 space-y-4">
        <div className="flex items-center space-x-3 text-amber-500">
           <Gift size={20} />
           <h4 className="text-xs font-bold uppercase tracking-widest">Bonos Automáticos</h4>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Los bonos por subir de nivel se acreditan de forma instantánea al alcanzar el volumen de recarga requerido. Las comisiones de red se acumulan durante la semana y se entregan todos los lunes a las 12:00 PM.
        </p>
      </div>
    </div>
  );
};
