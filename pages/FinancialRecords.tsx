
import React, { useState } from 'react';
import { useApp } from '../store';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Gift, Wallet, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';

type FilterType = 'all' | 'recharge' | 'withdraw' | 'earning' | 'team';

export const FinancialRecords: React.FC = () => {
  const { transactions } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'team') return tx.type === 'rebate' || tx.type === 'bonus';
    return tx.type === activeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'recharge': return <ArrowDownLeft className="text-blue-400" size={18} />;
      case 'withdraw': return <ArrowUpRight className="text-red-400" size={18} />;
      case 'earning': return <TrendingUp className="text-green-400" size={18} />;
      case 'bonus': return <Gift className="text-amber-400" size={18} />;
      case 'rebate': return <Wallet className="text-purple-400" size={18} />;
      default: return <Wallet className="text-slate-400" size={18} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'Completado', color: 'text-green-500', icon: <CheckCircle2 size={10} /> };
      case 'pending': return { text: 'Pendiente', color: 'text-amber-500', icon: <Clock size={10} /> };
      case 'rejected': return { text: 'Rechazado', color: 'text-red-500', icon: <XCircle size={10} /> };
      default: return { text: status, color: 'text-slate-500', icon: null };
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-slate-100 font-display italic tracking-tight">Registro Financiero</h2>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Todo' },
          { id: 'recharge', label: 'Depósitos' },
          { id: 'withdraw', label: 'Retiros' },
          { id: 'earning', label: 'Ganancias' },
          { id: 'team', label: 'Red' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as FilterType)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              activeFilter === f.id 
              ? 'bg-amber-500 border-amber-500 text-slate-900' 
              : 'bg-slate-800/50 border-white/5 text-slate-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
            <Filter size={32} />
          </div>
          <p className="text-sm font-bold italic">No hay registros en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const status = getStatusLabel(tx.status);
            return (
              <div key={tx.id} className="glass p-5 rounded-2xl border border-white/5 flex justify-between items-center relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  tx.type === 'recharge' ? 'bg-blue-500' :
                  tx.type === 'withdraw' ? 'bg-red-500' :
                  tx.type === 'earning' ? 'bg-green-500' : 'bg-amber-500'
                }`} />
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center border border-white/5 shadow-inner">
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm capitalize">
                      {tx.type === 'earning' ? 'Ganancia Operativa' : 
                       tx.type === 'recharge' ? 'Depósito' : 
                       tx.type === 'withdraw' ? 'Retiro' : tx.type}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(tx.date).toLocaleString('es-ES')}</p>
                    <div className={`flex items-center space-x-1 mt-1 font-bold text-[9px] uppercase tracking-tighter ${status.color}`}>
                       {status.icon}
                       <span>{status.text}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold text-lg font-display ${tx.type === 'withdraw' ? 'text-slate-100' : 'text-amber-500'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest italic truncate max-w-[80px]">USDT</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
