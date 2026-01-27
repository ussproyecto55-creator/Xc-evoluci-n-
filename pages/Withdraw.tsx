
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { VIP_LEVELS } from '../constants';
import { ArrowUpFromLine, Info, ShieldAlert, Save, Landmark } from 'lucide-react';

export const Withdraw: React.FC = () => {
  const { user, withdraw, saveWithdrawalAddress } = useApp();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(user?.withdrawalAddress || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.withdrawalAddress) {
      setWallet(user.withdrawalAddress);
    }
  }, [user?.withdrawalAddress]);

  if (!user) return null;
  const currentVIP = VIP_LEVELS[user.vipLevel];

  const handleSaveWallet = () => {
    if (!wallet) return alert("Ingrese una dirección válida");
    setIsSaving(true);
    setTimeout(() => {
      saveWithdrawalAddress(wallet);
      setIsSaving(false);
      alert("Billetera guardada correctamente");
    }, 1000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return alert("Ingrese el monto");
    if (!wallet) return alert("Debe guardar una billetera antes de retirar");
    withdraw(parseFloat(amount));
  };

  const commissionFee = (parseFloat(amount) || 0) * (currentVIP.commission / 100);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Gestionar Retiro</h2>
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center space-x-1">
          <Landmark size={12} />
          <span>Capital 100% Retirable en cualquier momento</span>
        </p>
      </div>

      <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start space-x-3">
          <Info className="text-amber-500 shrink-0 mt-1" size={18} />
          <p className="text-[11px] text-slate-300 italic leading-relaxed">
            Puedes retirar tanto tus ganancias como tu capital inicial cuando lo desees. Los retiros se procesan de 1 a 24 horas. Mínimo de retiro: <span className="text-amber-500 font-bold">10 USDT</span>.
          </p>
        </div>
      </div>

      {user.vipLevel === 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3 text-red-400">
          <ShieldAlert size={20} className="shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-sm">VIP Requerido</p>
            <p className="text-xs">Debes activar al menos el VIP 1 (Mín. $10) para habilitar retiros.</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
        {/* Wallet Saver */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Billetera de Retiro (TRC20 / BEP20)</label>
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
              {isSaving ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" /> : <Save size={18} />}
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

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Comisión VIP ({currentVIP.commission}%):</span>
              <span className="text-red-400 font-bold">-${commissionFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-white/5 pt-3">
              <span className="text-slate-300">Neto a Recibir:</span>
              <span className="text-green-400">${(Math.max(0, (parseFloat(amount) || 0) - commissionFee)).toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={user.vipLevel === 0 || !user.withdrawalAddress}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
              user.vipLevel === 0 || !user.withdrawalAddress 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
              : 'gradient-gold text-slate-900 shadow-xl shadow-amber-500/20 active:scale-95'
            }`}
          >
            <ArrowUpFromLine size={22} />
            <span>Confirmar Retiro</span>
          </button>
          
          {!user.withdrawalAddress && (
            <p className="text-[9px] text-center text-red-500 font-bold uppercase animate-pulse italic">¡Guarda tu dirección de billetera arriba para habilitar el retiro!</p>
          )}
        </form>
      </div>
    </div>
  );
};
