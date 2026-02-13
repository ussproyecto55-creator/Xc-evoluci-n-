
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { 
  Users, Wallet, ArrowDownLeft, ArrowUpRight, ArrowRight,
  CheckCircle, XCircle, UserX, UserCheck, 
  Edit, Search, BarChart3, Database, ImageIcon, X, Clock, Calendar,
  User as UserIcon, Zap, Activity, Filter, History, Crown
} from 'lucide-react';
import { User, Transaction } from '../types';
import { VIP_LEVELS } from '../constants';

type AdminTab = 'stats' | 'users' | 'recharges' | 'withdrawals' | 'history' | 'vips';

export const AdminPanel: React.FC = () => {
  const { allUsers, allTransactions, dailySports, adminUpdateTransaction, adminUpdateUser, processWeeklyCommissions, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'recharge' | 'withdraw'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewProofTx, setViewProofTx] = useState<Transaction | null>(null);

  const pendingRecharges = useMemo(() => 
    allTransactions.filter(t => t.type === 'recharge' && t.status === 'pending'),
    [allTransactions]
  );
  
  const pendingWithdrawals = useMemo(() => 
    allTransactions.filter(t => t.type === 'withdraw' && t.status === 'pending'),
    [allTransactions]
  );

  const auditHistory = useMemo(() => {
    return allTransactions.filter(t => {
      if (historyFilter === 'all') return t.type === 'recharge' || t.type === 'withdraw';
      return t.type === historyFilter;
    });
  }, [allTransactions, historyFilter]);

  const prioritySport = useMemo(() => 
    dailySports.find(s => s.baseReturn >= 0.024), 
    [dailySports]
  );

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) && u.role !== 'admin'
  );

  const totalInvestment = allUsers.reduce((acc, u) => acc + (u.totalRecharge || 0), 0);

  const handleEditUser = (u: User) => {
    setEditingUser({ ...u });
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;
    try {
      await adminUpdateUser(editingUser.id, editingUser);
      setEditingUser(null);
      showNotification("Usuario actualizado correctamente", "success");
    } catch (err) {
      showNotification("Error al guardar cambios", "error");
    }
  };

  const forceWeeklyPayout = async () => {
    if (window.confirm("¿Seguro que deseas forzar la entrega de comisiones pendientes ahora?")) {
      try {
        await processWeeklyCommissions();
        showNotification("Comisiones entregadas exitosamente.", "success");
      } catch (err) {
        showNotification("Error al procesar pago semanal.", "error");
      }
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex flex-col space-y-1 text-center">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Consola de Control</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Administración de Red Elite</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'stats', label: 'Dashboard', icon: <BarChart3 size={14}/> },
          { id: 'recharges', label: 'Depósitos', icon: <ArrowDownLeft size={14}/>, count: pendingRecharges.length },
          { id: 'withdrawals', label: 'Retiros', icon: <ArrowUpRight size={14}/>, count: pendingWithdrawals.length },
          { id: 'vips', label: 'VIPS', icon: <Crown size={14}/> },
          { id: 'users', label: 'Usuarios', icon: <Users size={14}/> },
          { id: 'history', label: 'Auditoría', icon: <History size={14}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center space-x-2 whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
              activeTab === tab.id 
              ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-lg' 
              : 'bg-slate-800/50 border-white/5 text-slate-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="glass p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
             <div className="flex items-center space-x-2 text-amber-500">
                <Activity size={16} className="animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Mercado Hoy (Béisbol 2.5%)</h3>
             </div>
             {prioritySport && (
               <div className="flex justify-between items-center">
                  <div>
                     <p className="text-xs font-bold text-white italic">{prioritySport.name}</p>
                     <p className="text-[9px] text-slate-500 uppercase font-black">{prioritySport.icon} Deporte Fijo 2.5%</p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-green-500">2.50%</p>
                     <p className="text-[8px] text-slate-600 font-bold uppercase">ROI Asignado</p>
                  </div>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inversión Total</p>
              <p className="text-2xl font-black text-amber-500 font-display">${totalInvestment.toLocaleString()}</p>
            </div>
            <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Usuarios Activos</p>
              <p className="text-2xl font-black text-slate-100 font-display">{allUsers.length - 1}</p>
            </div>
          </div>
          
          <button 
            onClick={forceWeeklyPayout}
            className="w-full glass p-5 rounded-2xl border border-blue-500/30 flex items-center justify-between hover:bg-blue-500/5 transition-all"
          >
            <div className="flex items-center space-x-3 text-blue-400">
               <Clock size={24} />
               <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Entrega de Comisiones</p>
                  <p className="text-[8px] text-slate-500">Manual Lunes / Forzar ahora</p>
               </div>
            </div>
            <ArrowRight size={20} className="text-blue-500" />
          </button>
        </div>
      )}

      {activeTab === 'vips' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verificación de VIPS</h3>
          </div>
          <div className="space-y-3">
            {allUsers.filter(u => u.role !== 'admin').sort((a,b) => b.vipLevel - a.vipLevel).map(u => (
              <div key={u.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${VIP_LEVELS[u.vipLevel].color} flex items-center justify-center text-slate-900 shadow-lg`}>
                    <Crown size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-xs">{u.username}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Nivel: {VIP_LEVELS[u.vipLevel].name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select 
                    value={u.vipLevel}
                    onChange={(e) => adminUpdateUser(u.id, { vipLevel: parseInt(e.target.value) })}
                    className="bg-slate-800 text-[9px] text-amber-500 border border-white/10 rounded-lg px-2 py-1 outline-none"
                  >
                    {VIP_LEVELS.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'recharges' || activeTab === 'withdrawals') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Solicitudes Pendientes</h3>
            <span className="text-[9px] bg-slate-800 text-amber-500 px-2 py-1 rounded-full font-bold">Total: {(activeTab === 'recharges' ? pendingRecharges : pendingWithdrawals).length}</span>
          </div>
          
          {(activeTab === 'recharges' ? pendingRecharges : pendingWithdrawals).length === 0 && (
            <div className="glass p-10 rounded-2xl text-center text-slate-500 text-xs italic border border-white/5">
              No hay solicitudes pendientes en este momento.
            </div>
          )}

          {(activeTab === 'recharges' ? pendingRecharges : pendingWithdrawals).map((tx) => (
            <div key={tx.id} className="glass p-5 rounded-2xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 uppercase text-xs">{tx.username}</p>
                    <div className="flex items-center space-x-2 text-[8px] text-slate-500 mt-0.5 font-bold">
                       <Calendar size={10} />
                       <span>{new Date(tx.date).toLocaleDateString()}</span>
                       <Clock size={10} className="ml-1" />
                       <span>{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-amber-500 tracking-tighter">${tx.amount.toFixed(2)}</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase">USDT</p>
                </div>
              </div>

              {tx.type === 'recharge' && tx.proofData && (
                <button 
                  onClick={() => setViewProofTx(tx)}
                  className="w-full py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center space-x-2 text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                >
                  <ImageIcon size={14} />
                  <span>Ver Comprobante de Pago</span>
                </button>
              )}

              {tx.type === 'withdraw' && tx.walletAddress && (
                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Billetera de Destino</p>
                   <code className="text-[9px] text-amber-500 break-all font-mono">{tx.walletAddress}</code>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => adminUpdateTransaction(tx.id, 'completed')}
                  className="flex-1 py-3.5 bg-green-500 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle size={16} />
                  <span>Aprobar</span>
                </button>
                <button 
                  onClick={() => adminUpdateTransaction(tx.id, 'rejected')}
                  className="flex-1 py-3.5 bg-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/30 flex items-center justify-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Rechazar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historial Maestro</h3>
              <div className="flex space-x-2">
                 {['all', 'recharge', 'withdraw'].map(f => (
                   <button 
                    key={f}
                    onClick={() => setHistoryFilter(f as any)}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${historyFilter === f ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-400 border-white/5'}`}
                   >
                     {f === 'all' ? 'Todo' : f === 'recharge' ? 'Depósitos' : 'Retiros'}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-3">
             {auditHistory.length === 0 && (
               <div className="glass p-10 rounded-2xl text-center text-slate-500 text-xs italic border border-white/5">
                 No hay registros en el historial.
               </div>
             )}
             {auditHistory.slice(0, 100).map(tx => (
               <div key={tx.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center animate-in fade-in slide-in-from-right-2">
                  <div className="flex items-center space-x-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'recharge' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                        {tx.type === 'recharge' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-100 uppercase italic leading-none">{tx.username}</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-1 uppercase">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-xs font-black italic ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                        {tx.status === 'completed' ? '+ ' : tx.status === 'rejected' ? 'X ' : ''}${tx.amount.toFixed(2)}
                     </p>
                     <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest">{tx.status}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-slate-100 flex items-center space-x-2">
                    <span className="text-xs">{u.username}</span>
                    {u.isBlocked && <span className="text-[7px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-black">Bloqueado</span>}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">VIP {u.vipLevel} • Bal: <span className="text-amber-500">${u.balance.toFixed(2)}</span></p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditUser(u)} className="p-2.5 bg-slate-800 rounded-lg text-blue-400 hover:bg-slate-700">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => adminUpdateUser(u.id, { isBlocked: !u.isBlocked })}
                    className={`p-2.5 rounded-lg ${u.isBlocked ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} hover:opacity-80`}
                  >
                    {u.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/95" onClick={() => setEditingUser(null)}></div>
           <div className="relative glass w-full max-w-sm rounded-3xl p-6 border border-white/10 space-y-6 animate-in zoom-in">
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Gestionar: {editingUser.username}</h3>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance (USDT)</label>
                    <input 
                      type="number" 
                      value={editingUser.balance}
                      onChange={(e) => setEditingUser({...editingUser, balance: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-amber-500 font-black text-xl"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contraseña</label>
                    <input 
                      type="text" 
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-slate-200"
                    />
                 </div>
              </div>

              <div className="flex space-x-3">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Cerrar</button>
                 <button onClick={saveUserChanges} className="flex-1 py-4 bg-amber-500 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20">Guardar</button>
              </div>
           </div>
        </div>
      )}

      {viewProofTx && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/98 animate-in fade-in">
           <button 
            onClick={() => setViewProofTx(null)}
            className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20"
           >
              <X size={28} />
           </button>
           <div className="relative max-w-full max-h-[90vh] flex flex-col items-center">
              <div className="bg-amber-500 text-slate-900 px-6 py-2.5 rounded-t-2xl font-black uppercase text-[10px] flex items-center space-x-6">
                 <span>USUARIO: {viewProofTx.username}</span>
                 <span className="opacity-50">|</span>
                 <span>DEPÓSITO: ${viewProofTx.amount.toFixed(2)} USDT</span>
              </div>
              <div className="overflow-hidden rounded-b-2xl border-4 border-amber-500/20 shadow-2xl">
                 <img src={viewProofTx.proofData} alt="Comprobante" className="max-w-full max-h-[75vh] object-contain" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
