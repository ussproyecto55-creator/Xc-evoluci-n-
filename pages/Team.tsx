
import React, { useState } from 'react';
import { useApp } from '../store';
import { Users, Copy, Gift, BarChart3, ChevronRight, UserCircle2 } from 'lucide-react';
import { TEAM_REBATES } from '../constants';

export const Team: React.FC = () => {
  const { user, team } = useApp();
  const [viewDetail, setViewDetail] = useState(false);

  if (!user) return null;

  const copyRefLink = () => {
    const link = `${window.location.origin}/#register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    alert("¡Enlace de referido copiado!");
  };

  const level1 = team.filter(m => m.level === 1);
  const level2 = team.filter(m => m.level === 2);
  const level3 = team.filter(m => m.level === 3);

  const totalRecharge = team.reduce((acc, curr) => acc + curr.totalRecharge, 0);
  const rechargedCount = team.filter(m => m.recharged).length;

  if (viewDetail) {
    return (
      <div className="px-4 py-6 space-y-6">
        <button onClick={() => setViewDetail(false)} className="text-amber-500 font-bold flex items-center space-x-1">
          <ChevronRight size={18} className="rotate-180" />
          <span>Volver al equipo</span>
        </button>
        <h2 className="text-xl font-bold text-slate-100 italic">Lista de Miembros</h2>
        <div className="space-y-3">
          {team.map((member, i) => (
            <div key={i} className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-100">{member.username}</p>
                  <p className="text-xs text-slate-500">Nivel {member.level} • {member.registrationDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-500">${member.totalRecharge.toFixed(2)}</p>
                <p className={`text-[10px] uppercase font-bold ${member.recharged ? 'text-green-500' : 'text-slate-600'}`}>
                  {member.recharged ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <p className="text-center text-slate-500 italic text-sm py-10">Aún no tienes miembros en tu equipo.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      {/* Referral Link Box */}
      <div className="glass rounded-2xl p-6 border-2 border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Invitación Personal</h3>
          <span className="text-amber-500 font-bold font-display tracking-widest">{user.referralCode}</span>
        </div>
        <button 
          onClick={copyRefLink}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold border border-white/10 active:scale-95 transition-all"
        >
          <Copy size={18} />
          <span>Copiar Enlace para Compartir</span>
        </button>
      </div>

      {/* Rebate Info - FIXED PERCENTAGE DISPLAY */}
      <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center space-x-2 text-amber-500">
          <Gift size={20} />
          <h3 className="font-bold text-sm uppercase">Comisión por Rendimiento</h3>
        </div>
        <p className="text-xs text-slate-400 italic">Cada lunes recibirás un porcentaje de las ganancias totales generadas por tu equipo.</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="block text-[10px] uppercase font-bold text-blue-400 mb-1">Nivel 1</span>
            <span className="text-lg font-bold text-slate-100">{(TEAM_REBATES.LEVEL_1 * 100).toFixed(0)}%</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="block text-[10px] uppercase font-bold text-purple-400 mb-1">Nivel 2</span>
            <span className="text-lg font-bold text-slate-100">{(TEAM_REBATES.LEVEL_2 * 100).toFixed(0)}%</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <span className="block text-[10px] uppercase font-bold text-pink-400 mb-1">Nivel 3</span>
            <span className="text-lg font-bold text-slate-100">{(TEAM_REBATES.LEVEL_3 * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4 rounded-xl space-y-1">
          <BarChart3 size={16} className="text-blue-500 mb-2" />
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Volumen Equipo</p>
          <p className="text-lg font-bold text-slate-100">${totalRecharge.toLocaleString()}</p>
        </div>
        <div className="glass p-4 rounded-xl space-y-1">
          <Users size={16} className="text-green-500 mb-2" />
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Activos Reales</p>
          <p className="text-lg font-bold text-slate-100">{rechargedCount}</p>
        </div>
      </div>

      {/* Detailed Counts */}
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h4 className="font-bold text-slate-200">Estructura Global</h4>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{team.length}</span>
        </div>
        <div className="divide-y divide-white/5">
          <div className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold">Jerarquía Nivel 1</p>
              <p className="text-lg font-bold text-slate-100">{level1.length} <span className="text-xs font-normal text-slate-500 italic">Usuarios</span></p>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold">Jerarquía Nivel 2</p>
              <p className="text-lg font-bold text-slate-100">{level2.length} <span className="text-xs font-normal text-slate-500 italic">Usuarios</span></p>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold">Jerarquía Nivel 3</p>
              <p className="text-lg font-bold text-slate-100">{level3.length} <span className="text-xs font-normal text-slate-500 italic">Usuarios</span></p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setViewDetail(true)}
          className="w-full py-4 text-amber-500 font-bold text-sm bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center justify-center space-x-1"
        >
          <span>Auditar Detalle del Equipo</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
