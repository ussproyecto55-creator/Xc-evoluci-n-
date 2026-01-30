
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { VIP_LEVELS, ARRIVAL_TIMES } from '../constants';
import { ArrowUpFromLine, Save, Landmark, Loader2, Clock, ShieldCheck, DollarSign } from 'lucide-react';

export const Withdraw: React.FC = () => {
  const { user, withdraw, saveWithdrawalAddress, showNotification } = useApp();
  const [amountInput, setAmountInput] = useState('');
  const [wallet, setWallet] = useState(user?.withdrawalAddress || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.withdrawalAddress) {
      setWallet(user.withdrawalAddress);
    }
  }, [user?.withdrawalAddress]);

  if (!user) return null;
  const currentVIP = VIP_LEVELS[user.vipLevel];

  // SEGURIDAD 24H NEXUS
  const hoursSinceReg = (new Date().getTime() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60);
  const isLockedBySecurity = hoursSinceReg < 24;
  const remainingHours = (24 - hoursSinceReg).toFixed(1);

  // CÁLCULO DE COMISIÓN EN TIEMPO REAL (REACTIVO)
  const stats = useMemo(() => {
    const amount = parseFloat(amountInput) || 0;
    const feePercent = currentVIP.commission;
    const feeAmount = (amount * feePercent) / 100;
    const netAmount = Math.max(0, amount - feeAmount);
    return { amount, feeAmount, netAmount, feePercent };
  }, [amountInput, currentVIP]);

  const handleSaveWallet = async () => {
    if (!wallet) return;
    setIsSaving(true);
    try {
      await saveWithdrawalAddress(wallet);
      showNotification("Billetera guardada.", "success");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedBySecurity) {
      showNotification(`Bloqueo Nexus: disponible en ${remainingHours} horas.`, "error");
      return;
    }
    if (stats.amount < 10) {
      showNotification("Retiro mínimo: 10 USDT", "error");
      return;
    }
    if (stats.amount > user.balance) {
      showNotification("Saldo insuficiente.", "error");
      return;
    }
    if (!wallet) {
      showNotification("Configure su billetera primero.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await withdraw(stats.amount);
      if (result.success) {
        showNotification(result.message, "success");
        setAmountInput('');
      } else {
        showNotification(result.message, "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Retiros Nexus</h2>
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-500">
           <Clock size={12} />
           <span>Auditoría: {ARRIVAL_TIMES.WITHDRAW}</span>
        </div>
      </div>

      {isLockedBySecurity && (
        <div className="bg-red-500/10 border-2 border-red-500/30 p-5 rounded-[2rem] flex flex-col items-center text-center space-y-3 shadow-lg">
           <ShieldCheck size={32} className="text-red-500" />
           <p className="text-[10px] text-slate-200 font-black uppercase italic">Protocolo Anti-Lavado Activo</p>
           <div className="bg-slate-900/50 px-4 py-1.5 rounded-full border border-red-500/20 text-[9px] font-black text-red-400">
              DISPONIBLE EN: {remainingHours} HORAS
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
         <div className="glass p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tasa VIP</p>
            <p className="text-lg font-black text-amber-500 font-display">{currentVIP.commission}%</p>
         </div>
         <div className="glass p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Disponibles</p>
            <p className="text-lg font-black text-slate-100 font-display">{currentVIP.withdrawalsPerMonth - (user.monthlyWithdrawalCount || 0)}</p>
         </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Billetera USDT (TRC20/BEP20)</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Dirección..."
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-slate-200 outline-none"
            />
            <button onClick={handleSaveWallet} disabled={isSaving} className="px-4 bg-slate-800 border border-white/10 rounded-xl text-amber-500 active:scale-95">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
            </button>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto a retirar</label>
            <div className="relative">
              <input 
                type="number" 
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold text-slate-100 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">USDT</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-3">
             <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-bold uppercase">Comisión de Red ({stats.feePercent}%)</span>
                <span className="text-red-400 font-black italic">-${stats.feeAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-xs text-slate-300 font-bold uppercase flex items-center space-x-2">
                   <Landmark size={14} className="text-amber-500" />
                   <span>Neto a Recibir</span>
                </span>
                <span className="text-xl font-black text-green-400 font-display italic">${stats.netAmount.toFixed(2)}</span>
             </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing || isLockedBySecurity || stats.amount > user.balance || stats.amount < 10}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-2 ${
              isProcessing || isLockedBySecurity || stats.amount > user.balance || stats.amount < 10
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'gradient-gold text-slate-900 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ArrowUpFromLine size={24} />}
            <span>Confirmar Retiro Nexus</span>
          </button>
        </form>
      </div>
    </div>
  );
};
