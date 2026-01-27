
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Users, Copy, Gift, BarChart3, ChevronRight, UserCircle2, Clock, Zap, Target, Activity, Landmark } from 'lucide-react';
import { TeamMember, Transaction } from '../types';

export const Team: React.FC = () => {
  const { user, allUsers, allTransactions, showNotification } = useApp();
  const [viewDetail, setViewDetail] = useState(false);

  // Fecha de referencia para estadísticas diarias (24h)
  const last24h = useMemo(() => new Date(Date.now() - 24 * 60 * 60 * 1000), []);
  const todayDateStr = new Date().toDateString();

  const teamStats = useMemo(() => {
    if (!user || !allUsers) return { members: [], dailyNew: 0, dailyRecharge: 0, totalRecharge: 0, totalTeamUsers: 0 };

    const members: TeamMember[] = [];
    let dailyNew = 0;
    let dailyRechargeAmount = 0;
    let totalRechargeAmount = 0;

    const teamUserIds = new Set<string>();

    const level1Users = allUsers.filter(u => u.referredBy === user.referralCode);
    level1Users.forEach(u1 => {
      teamUserIds.add(u1.id);
      if (new Date(u1.registrationDate) > last24h) dailyNew++;
      members.push({
        username: u1.username,
        level: 1,
        recharged: u1.totalRecharge > 0,
        totalRecharge: u1.totalRecharge,
        registrationDate: new Date(u1.registrationDate).toLocaleDateString(),
        hasBetToday: u1.lastBetDate ? new Date(u1.lastBetDate).toDateString() === todayDateStr : false
      });

      const level2Users = allUsers.filter(u => u.referredBy === u1.referralCode);
      level2Users.forEach(u2 => {
        teamUserIds.add(u2.id);
        if (new Date(u2.registrationDate) > last24h) dailyNew++;
        members.push({
          username: u2.username,
          level: 2,
          recharged: u2.totalRecharge > 0,
          totalRecharge: u2.totalRecharge,
          registrationDate: new Date(u2.registrationDate).toLocaleDateString(),
          hasBetToday: u2.lastBetDate ? new Date(u2.lastBetDate).toDateString() === todayDateStr : false
        });

        const level3Users = allUsers.filter(u => u.referredBy === u2.referralCode);
        level3Users.forEach(u3 => {
          teamUserIds.add(u3.id);
          if (new Date(u3.registrationDate) > last24h) dailyNew++;
          members.push({
            username: u3.username,
            level: 3,
            recharged: u3.totalRecharge > 0,
            totalRecharge: u3.totalRecharge,
            registrationDate: new Date(u3.registrationDate).toLocaleDateString(),
            hasBetToday: u3.lastBetDate ? new Date(u3.lastBetDate).toDateString() === todayDateStr : false
          });
        });
      });
    });

    allTransactions.forEach(tx => {
      if (teamUserIds.has(tx.userId) && tx.type === 'recharge' && tx.status === 'completed') {
        totalRechargeAmount += tx.amount;
        if (new Date(tx.date) > last24h) {
          dailyRechargeAmount += tx.amount;
        }
      }
    });

    return { 
      members, 
      dailyNew, 
      dailyRecharge: dailyRechargeAmount, 
      totalRecharge: totalRechargeAmount,
      totalTeamUsers: teamUserIds.size
    };
  }, [user, allUsers, allTransactions, last24h, todayDateStr]);

  if (!user) return null;

  const copyRefLink = () => {
    const link = `${window.location.origin}/#register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    showNotification("¡Enlace de referido copiado correctamente!", "success");
  };

  const level1 = teamStats.members.filter(m => m.level === 1);
  const level2 = teamStats.members.filter(m => m.level === 2);
  const level3 = teamStats.members.filter(m => m.level === 3);

  if (viewDetail) {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
        <button onClick={() => setViewDetail(false)} className="text-amber-500 font-bold flex items-center space-x-1">
          <ChevronRight size={18} className="rotate-180" />
          <span>Volver a Estadísticas</span>
        </button>
        <div className="flex flex-col space-y-1">
          <h2 className="text-2xl font-bold text-slate-100 font-display italic uppercase tracking-tighter">Auditoría de Red</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Control de Actividad Diaria</p>
        </div>

        <div className="space-y-3">
          {teamStats.members.map((member, i) => (
            <div key={i} className="glass p-4 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center ${member.hasBetToday ? 'text-green-500' : 'text-slate-500'}`}>
                  <UserCircle2 size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-100 italic">{member.username}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Nivel {member.level} • {member.registrationDate}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-black text-amber-500">${member.totalRecharge.toFixed(2)}</p>
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${member.hasBetToday ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   <Target size={10} />
                   <span>{member.hasBetToday ? 'Operó Hoy' : 'Sin Operar'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic uppercase tracking-tighter">Panel de Equipo</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Gestión de Dividendos de Lunes</p>
      </div>

      <div className="glass rounded-[2rem] p-6 border-2 border-blue-500/20 bg-blue-500/5 flex items-center justify-between shadow-lg">
        <div className="space-y-1">
           <div className="flex items-center space-x-2 text-blue-400">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Acumulado Lunes 12PM</span>
           </div>
           <p className="text-2xl font-black text-white italic font-display">${user.pendingCommissions.toFixed(2)} USDT</p>
           <p className="text-[8px] text-slate-400 font-bold uppercase italic">7% L1 • 3% L2 • 2% L3 sobre ganancias de red</p>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-2xl">
           <Landmark size={32} className="text-blue-500" />
        </div>
      </div>

      <div className="glass rounded-[2rem] p-6 border border-amber-500/20 bg-amber-500/5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Código de Invitación</p>
             <h3 className="font-bold text-lg text-slate-100 italic">{user.referralCode}</h3>
          </div>
          <button 
            onClick={copyRefLink}
            className="p-4 bg-amber-500 text-slate-900 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-90 transition-all"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Estadísticas Diarias (24h)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[2.5rem] border border-amber-500/10 bg-slate-800/20 space-y-2">
             <div className="flex items-center space-x-2 text-amber-500">
                <Zap size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Recarga Equipo</span>
             </div>
             <p className="text-2xl font-black text-slate-100 font-display italic">${teamStats.dailyRecharge.toFixed(2)}</p>
             <p className="text-[8px] text-slate-500 font-bold uppercase italic">Solo hoy</p>
          </div>
          <div className="glass p-5 rounded-[2.5rem] border border-blue-500/10 bg-slate-800/20 space-y-2">
             <div className="flex items-center space-x-2 text-blue-400">
                <Users size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Nuevos Miembros</span>
             </div>
             <p className="text-2xl font-black text-slate-100 font-display italic">{teamStats.dailyNew}</p>
             <p className="text-[8px] text-slate-500 font-bold uppercase italic">Nuevos ingresos</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Métricas Globales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[2.5rem] border border-white/5 space-y-1">
             <p className="text-[9px] font-black text-slate-500 uppercase">Volumen Red Total</p>
             <p className="text-xl font-black text-amber-500 font-display">${teamStats.totalRecharge.toLocaleString()}</p>
          </div>
          <div className="glass p-5 rounded-[2.5rem] border border-white/5 space-y-1">
             <p className="text-[9px] font-black text-slate-500 uppercase">Red Total Usuarios</p>
             <p className="text-xl font-black text-slate-100 font-display">{teamStats.totalTeamUsers}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
           <h4 className="text-xs font-black text-slate-300 uppercase italic">Dividendos Lunes (Especiales)</h4>
           <Activity size={16} className="text-amber-500 animate-pulse" />
        </div>
        <div className="space-y-4">
           {[
             { label: 'Nivel 1', count: level1.length, rebate: '7%', color: 'bg-blue-500' },
             { label: 'Nivel 2', count: level2.length, rebate: '3%', color: 'bg-purple-500' },
             { label: 'Nivel 3', count: level3.length, rebate: '2%', color: 'bg-pink-500' }
           ].map((lvl, idx) => (
             <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-3">
                   <div className={`w-8 h-8 rounded-full ${lvl.color} flex items-center justify-center text-slate-900 font-black text-[10px]`}>{idx + 1}</div>
                   <div>
                      <p className="text-xs font-bold text-slate-200">{lvl.label}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{lvl.count} Miembros</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-amber-500">{lvl.rebate}</p>
                   <p className="text-[8px] text-slate-500 uppercase font-bold">Residual Lunes</p>
                </div>
             </div>
           ))}
        </div>
        <button 
          onClick={() => setViewDetail(true)}
          className="w-full py-4 gradient-gold rounded-2xl text-slate-900 font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <BarChart3 size={18} />
          <span>Ver Miembros y Actividad</span>
        </button>
      </div>
    </div>
  );
};
