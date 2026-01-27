
import React, { useState } from 'react';
import { useApp } from '../store';
import { LogOut, Settings, HelpCircle, Shield, ChevronRight, UserCircle2, Calendar, Crown, Gem, Zap, CheckCircle } from 'lucide-react';
import { VIP_LEVELS } from '../constants';

export const Profile: React.FC = () => {
  const { user, logout } = useApp();
  const [showVIPCenter, setShowVIPCenter] = useState(false);

  if (!user) return null;

  const currentVIP = VIP_LEVELS[user.vipLevel];

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (showVIPCenter) {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
         <button onClick={() => setShowVIPCenter(false)} className="text-amber-500 font-bold flex items-center space-x-1">
            <ChevronRight size={18} className="rotate-180" />
            <span>Volver al perfil</span>
         </button>
         
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-100 italic font-display">Roadmap de Niveles VIP</h2>
            <p className="text-slate-500 text-xs px-4">Incrementa tu inversión para desbloquear más retiros y menores comisiones.</p>
         </div>

         <div className="space-y-6">
            {VIP_LEVELS.filter(v => v.id > 0).map((v) => {
              const isUnlocked = user.totalRecharge >= v.minRecharge;
              return (
                <div 
                  key={v.id} 
                  className={`glass rounded-[2rem] overflow-hidden border-2 transition-all relative ${
                    isUnlocked ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/5 grayscale opacity-50'
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
                        {isUnlocked && <CheckCircle className="text-amber-500" size={24} />}
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                           <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Inversión</p>
                           <p className="text-sm font-bold text-slate-100">${v.minRecharge} USDT</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                           <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Comisión</p>
                           <p className="text-sm font-bold text-amber-500">{v.commission}% por Retiro</p>
                        </div>
                     </div>

                     <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Retiros Mensuales Habilitados</span>
                        <span className="text-lg font-bold font-display text-slate-100">{v.withdrawalsPerMonth}</span>
                     </div>
                  </div>
                </div>
              );
            })}
         </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <UserCircle2 size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 italic">{user.username}</h2>
          <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={12} />
            <span>Desde {formatDate(user.registrationDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
         <div 
          onClick={() => setShowVIPCenter(true)}
          className="glass p-5 rounded-[2rem] border-2 border-amber-500/20 flex justify-between items-center group cursor-pointer active:scale-95 transition-all"
         >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl ${currentVIP.color} flex items-center justify-center text-slate-900 shadow-lg`}>
                <Crown size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nivel de Rango</p>
                <p className="text-lg font-bold text-slate-100 italic font-display">{currentVIP.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs uppercase">
               <span>Ver Beneficios</span>
               <ChevronRight size={16} />
            </div>
         </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-4">Ajustes de Cuenta</h3>
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5">
          <button className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors group">
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                <Settings size={18} />
              </div>
              <span className="text-sm font-bold">Seguridad de la Cuenta</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          <button className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors group">
            <div className="flex items-center space-x-4 text-slate-300">
               <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                <HelpCircle size={18} />
              </div>
              <span className="text-sm font-bold">Soporte Técnico 24/7</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          <button 
            onClick={logout}
            className="w-full p-5 flex justify-between items-center hover:bg-red-500/5 transition-colors text-red-400 group"
          >
            <div className="flex items-center space-x-4">
               <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Desconectar</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center py-8 space-y-2">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">NexusProfit Ecosystem v3.0</p>
        <p className="text-[8px] text-slate-700 uppercase tracking-widest px-14 leading-relaxed">Infraestructura financiera auditada bajo protocolos de liquidez descentralizada.</p>
      </div>
    </div>
  );
};
