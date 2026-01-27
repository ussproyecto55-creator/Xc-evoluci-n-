
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { VIP_LEVELS, ARRIVAL_TIMES } from '../constants';
import { ArrowUpFromLine, Info, ShieldAlert, Save, Landmark, CheckCircle2, XCircle, Loader2, Clock, Percent, DollarSign } from 'lucide-react';

export const Withdraw: React.FC = () => {
  const { user, withdraw, saveWithdrawalAddress } = useApp();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(user?.withdrawalAddress || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user?.withdrawalAddress) {
      setWallet(user.withdrawalAddress);
    }
  }, [user?.withdrawalAddress]);

  if (!user) return null;
  const currentVIP = VIP_LEVELS[user.vipLevel];

  // Cálculo en vivo
  const withdrawalAmount = parseFloat(amount) || 0;
  const feePercent = currentVIP.commission;
  const feeAmount = (withdrawalAmount * feePercent) / 100;
  const netAmount = Math.max(0, withdrawalAmount - feeAmount);

  const handleSaveWallet = async () => {
    if (!wallet) return setFeedback({ type: 'error', message: "Ingrese una dirección válida" });
    setIsSaving(true);
    try {
      await saveWithdrawalAddress(wallet);
      setFeedback({ type: 'success', message: "Billetera guardada correctamente" });
    } catch (error) {
      console.error("Error al guardar billetera:", error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return setFeedback({ type: 'error', message: "Ingrese el monto a retirar" });
    if (parseFloat(amount) < 10) return setFeedback({ type: 'error', message: "El retiro mínimo es de 10 USDT" });
    if (!wallet) return setFeedback({ type: 'error', message: "Debe guardar una billetera antes de retirar" });

    setIsProcessing(true);
    try {
      const result = await withdraw(parseFloat(amount));
      if (result && result.success) {
        setFeedback({ type: 'success', message: result.message || "Operación realizada correctamente" });
        setAmount('');
      } else if (result) {
        setFeedback({ type: 'error', message: result.message || "Error al procesar el retiro" });
      }
    } catch (error) {
      console.error("Error crítico en el retiro:", error);
      setFeedback({ type: 'error', message: "Error de conexión con el servidor" });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 relative">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Gestionar Retiro</h2>
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-500">
           <Clock size={12} />
           <span>Retiros Abiertos 24/7 • Llegada en {ARRIVAL_TIMES.WITHDRAW}</span>
        </div>
      </div>

      {feedback && (
        <div className={`fixed top-20 left-4 right-4 z-[100] glass border-2 p-5 rounded-[2rem] flex items-center space-x-4 animate-in slide-in-from-top duration-500 shadow-2xl ${
          feedback.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
        }`}>
          <div className={`p-2 rounded-full text-white ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>
          <div className="flex-1">
            <h4 className={`font-black text-sm italic uppercase ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.type === 'success' ? 'Operación Exitosa' : 'Error de Operación'}
            </h4>
            <p className="text-[10px] text-slate-200">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Stats VIP del Retiro */}
      <div className="grid grid-cols-2 gap-3">
         <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Comisión VIP</p>
            <p className="text-lg font-black text-amber-500 font-display">{currentVIP.commission}%</p>
         </div>
         <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Retiros Mes</p>
            <p className="text-lg font-black text-slate-100 font-display">{user.monthlyWithdrawalCount} / {currentVIP.withdrawalsPerMonth}</p>
         </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Billetera de Retiro (USDT TRC20/BEP20)</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Dirección USDT..."
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 transition-colors"
            />
            <button 
              onClick={handleSaveWallet}
              disabled={isSaving}
              className="px-4 bg-slate-800 border border-white/10 rounded-xl text-amber-500 hover:bg-slate-700 active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Save size={18} />}
            </button>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Monto a retirar (Min. 10 USDT)</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-amber-500 outline-none text-slate-100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">USDT</span>
            </div>
          </div>

          {/* Recuadro de Cálculo Automático */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3">
             <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Comisión Automática ({currentVIP.commission}%)</span>
                <span className="text-red-400 font-black italic">-${feeAmount.toFixed(2)} USDT</span>
             </div>
             <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-widest flex items-center space-x-2">
                   <Landmark size={14} className="text-amber-500" />
                   <span>Recibirás en Billetera</span>
                </span>
                <span className="text-xl font-black text-green-400 font-display italic">${netAmount.toFixed(2)}</span>
             </div>
          </div>

          <button 
            disabled={!user.withdrawalAddress || isProcessing || (user.monthlyWithdrawalCount || 0) >= currentVIP.withdrawalsPerMonth}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
              !user.withdrawalAddress || isProcessing || (user.monthlyWithdrawalCount || 0) >= currentVIP.withdrawalsPerMonth
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
              : 'gradient-gold text-slate-900 shadow-xl shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={22} /> : <ArrowUpFromLine size={22} />}
            <span>{isProcessing ? 'Auditando...' : 'Confirmar Retiro'}</span>
          </button>
          
          {(user.monthlyWithdrawalCount || 0) >= currentVIP.withdrawalsPerMonth && (
             <p className="text-[9px] text-red-400 italic text-center animate-pulse">
                Límite de retiros mensuales alcanzado para tu VIP.
             </p>
          )}
        </form>
      </div>
    </div>
  );
};
