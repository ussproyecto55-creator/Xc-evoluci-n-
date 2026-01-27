
import React, { useState } from 'react';
import { useApp } from '../store';
import { 
  Users, Wallet, ArrowDownLeft, ArrowUpRight, ArrowRight,
  CheckCircle, XCircle, UserX, UserCheck, 
  Edit, Key, Search, BarChart3, Database, ImageIcon, X, Gift, Clock, Calendar,
  User as UserIcon
} from 'lucide-react';
import { User, Transaction } from '../types';

type AdminTab = 'stats' | 'users' | 'recharges' | 'withdrawals' | 'all-tx';

export const AdminPanel: React.FC = () => {
  const { allUsers, allTransactions, adminUpdateTransaction, adminUpdateUser, processWeeklyCommissions } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewProofTx, setViewProofTx] = useState<Transaction | null>(null);

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) && u.role !== 'admin'
  );

  const pendingRecharges = allTransactions.filter(t => t.type === 'recharge' && t.status === 'pending');
  const pendingWithdrawals = allTransactions.filter(t => t.type === 'withdraw' && t.status === 'pending');

  const totalInvestment = allUsers.reduce((acc, u) => acc + (u.totalRecharge || 0), 0);

  const handleEditUser = (u: User) => {
    setEditingUser({ ...u });
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;
    try {
      await adminUpdateUser(editingUser.id, editingUser);
      setEditingUser(null);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      console.error("Error al guardar cambios de usuario:", err);
    }
  };

  const forceWeeklyPayout = async () => {
    if (window.confirm("¿Seguro que deseas forzar la entrega de comisiones pendientes ahora?")) {
      try {
        await processWeeklyCommissions();
        alert("Comisiones entregadas.");
      } catch (err) {
        console.error("Error al forzar pago semanal:", err);
      }
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Consola de Control</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Administración de Red Elite</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'stats', label: 'Dashboard', icon: <BarChart3 size={14}/> },
          { id: 'recharges', label: 'Recargas', icon: <ArrowDownLeft size={14}/>, count: pendingRecharges.length },
          { id: 'withdrawals', label: 'Retiros', icon: <ArrowUpRight size={14}/>, count: pendingWithdrawals.length },
          { id: 'users', label: 'Usuarios', icon: <Users size={14}/> },
          { id: 'all-tx', label: 'Historial', icon: <Database size={14}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
              activeTab === tab.id 
              ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-lg' 
              : 'bg-slate-800/50 border-white/5 text-slate-400'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-4">
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

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-slate-100 flex items-center space-x-2">
                    <span>{u.username}</span>
                    {u.isBlocked && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase">Bloqueado</span>}
                  </p>
                  <p className="text-[10px] text-slate-500">VIP {u.vipLevel} • Bal: <span className="text-amber-500">${u.balance.toFixed(2)}</span></p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditUser(u)} className="p-2 bg-slate-800 rounded-lg text-blue-400 hover:bg-slate-700">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => adminUpdateUser(u.id, { isBlocked: !u.isBlocked })}
                    className={`p-2 rounded-lg ${u.isBlocked ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} hover:opacity-80`}
                  >
                    {u.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'recharges' || activeTab === 'withdrawals') && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Peticiones Pendientes</h3>
          {(activeTab === 'recharges' ? pendingRecharges : pendingWithdrawals).map((tx) => (
            <div key={tx.id} className="glass p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-100">{tx.username}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                     <Calendar size={12} />
                     <span>{new Date(tx.date).toLocaleDateString()}</span>
                     <Clock size={12} className="ml-2" />
                     <span>{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-amber-500">${tx.amount.toFixed(2)}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">USDT</p>
                </div>
              </div>

              {tx.type === 'recharge' && tx.proofData && (
                <button 
                  onClick={() => setViewProofTx(tx)}
                  className="w-full py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center space-x-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                >
                  <ImageIcon size={14} />
                  <span>Ver Comprobante con Metadata</span>
                </button>
              )}

              <div className="flex space-x-3">
                <button 
                  onClick={() => adminUpdateTransaction(tx.id, 'completed')}
                  className="flex-1 py-3 bg-green-500 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Aprobar</span>
                </button>
                <button 
                  onClick={() => adminUpdateTransaction(tx.id, 'rejected')}
                  className="flex-1 py-3 bg-red-500/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest border border-red-500/30 flex items-center justify-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Rechazar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'all-tx' && (
        <div className="space-y-3">
          {allTransactions.slice(0, 50).map(tx => (
            <div key={tx.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center text-[10px]">
              <div>
                <p className="font-bold text-slate-300 uppercase">{tx.type} - {tx.username}</p>
                <p className="text-slate-500 italic">{tx.description}</p>
                <p className="text-slate-600 mt-1">{new Date(tx.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                  {tx.status}
                </p>
                <p className="text-slate-100 font-bold">${tx.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/90" onClick={() => setEditingUser(null)}></div>
           <div className="relative glass w-full max-w-sm rounded-3xl p-6 border border-white/10 space-y-6 animate-in zoom-in">
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">Gestionar: {editingUser.username}</h3>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Balance Principal (USDT)</label>
                    <input 
                      type="number" 
                      value={editingUser.balance}
                      onChange={(e) => setEditingUser({...editingUser, balance: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-amber-500 font-bold"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                    <input 
                      type="text" 
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-slate-200"
                    />
                 </div>
              </div>

              <div className="flex space-x-3">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase text-[10px]">Cerrar</button>
                 <button onClick={saveUserChanges} className="flex-1 py-3 bg-amber-500 text-slate-900 rounded-xl font-bold uppercase text-[10px]">Guardar</button>
              </div>
           </div>
        </div>
      )}

      {viewProofTx && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-300">
           <button 
            onClick={() => setViewProofTx(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white"
           >
              <X size={24} />
           </button>
           <div className="relative max-w-full max-h-[90vh] flex flex-col items-center">
              <div className="bg-amber-500 text-slate-900 px-6 py-2 rounded-t-2xl font-black uppercase text-xs flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                    <UserIcon size={14} />
                    <span>{viewProofTx.username}</span>
                 </div>
                 <div className="flex items-center space-x-2 border-l border-slate-900/20 pl-4">
                    <Clock size={14} />
                    <span>RECIBIDO: {new Date(viewProofTx.date).toLocaleString()}</span>
                 </div>
              </div>
              <div className="overflow-hidden rounded-b-2xl border border-amber-500/30">
                 <img src={viewProofTx.proofData} alt="Comprobante" className="max-w-full max-h-[70vh] object-contain" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
