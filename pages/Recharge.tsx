
import React, { useState } from 'react';
import { useApp } from '../store';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Copy, FileText, Loader2, X, Clock } from 'lucide-react';
import { ARRIVAL_TIMES } from '../constants';

export const Recharge: React.FC = () => {
  const { recharge } = useApp();
  const [amount, setAmount] = useState('10');
  const [network, setNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [proof, setProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) return alert("La recarga mínima es de 10 USDT");
    if (!proof) return alert("Por favor suba el comprobante de pago");

    setIsSubmitting(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      recharge(parseFloat(amount), base64String);
      setIsSubmitting(false);
      setSuccess(true);
      setProof(null);
      setAmount('10');
      setTimeout(() => setSuccess(false), 6000);
    };
    reader.onerror = () => {
      alert("Error al procesar la imagen");
      setIsSubmitting(false);
    };
    reader.readAsDataURL(proof);
  };

  const address = network === 'BEP20' 
    ? '0x99180023cf210243c10706ac0c1f3da1352cf1c0' 
    : 'TJyFGWMW8nviChVTMBx4i4HZ9Te4pF3Hyf';

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    alert("¡Dirección copiada correctamente!");
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24 relative">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold text-slate-100 font-display italic">Depósitos Nexus</h2>
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-500">
           <Clock size={12} />
           <span>Recargas Abiertas 24/7 • Acreditación en {ARRIVAL_TIMES.RECHARGE}</span>
        </div>
      </div>

      {success && (
        <div className="fixed top-20 left-4 right-4 z-[100] glass border-2 border-green-500/50 bg-green-500/10 p-5 rounded-[2rem] flex items-center space-x-4 animate-in slide-in-from-top duration-500 shadow-2xl">
          <div className="bg-green-500 p-2 rounded-full text-white">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-green-400 text-sm italic uppercase">Solicitud Enviada</h4>
            <p className="text-[10px] text-slate-200">Tu depósito está siendo auditado. Se acreditará en {ARRIVAL_TIMES.RECHARGE}.</p>
          </div>
          <button onClick={() => setSuccess(false)} className="text-slate-400"><X size={20}/></button>
        </div>
      )}
      
      <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">1. Escoger Protocolo</label>
          <div className="flex space-x-2">
            <button 
              onClick={() => setNetwork('TRC20')}
              className={`flex-1 py-3 rounded-xl font-bold border transition-all ${network === 'TRC20' ? 'border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-white/5 text-slate-500'}`}
            >
              USDT (TRC20)
            </button>
            <button 
              onClick={() => setNetwork('BEP20')}
              className={`flex-1 py-3 rounded-xl font-bold border transition-all ${network === 'BEP20' ? 'border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-white/5 text-slate-500'}`}
            >
              USDT (BEP20)
            </button>
          </div>
        </div>

        <div className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <ShieldCheck size={60} className="text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dirección Oficial {network}</p>
          <div className="flex items-center space-x-2 relative z-10">
            <code className="bg-slate-800 px-3 py-3 rounded-xl text-amber-500 font-mono text-[10px] flex-1 break-all border border-white/5 leading-tight">
              {address}
            </code>
            <button 
              onClick={copyAddress}
              className="p-3 bg-amber-500 text-slate-900 rounded-xl shadow-lg active:scale-90 transition-all flex-shrink-0"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">2. Cantidad a Recargar</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-bold focus:ring-2 focus:ring-amber-500 outline-none text-slate-100"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-500">USDT</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">3. Adjuntar Comprobante</label>
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all bg-slate-800/20 group ${proof ? 'border-blue-500/50' : 'border-white/10 hover:border-amber-500/50'}`}>
              {proof ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="bg-blue-500/20 p-3 rounded-full mx-auto mb-2 text-blue-400">
                    <FileText size={40} />
                  </div>
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Imagen Seleccionada</span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="text-slate-500 mx-auto mb-2 group-hover:text-amber-500 transition-colors" size={40} />
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Subir Captura de Pago</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setProof(e.target.files?.[0] || null)} />
            </label>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !proof}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center space-x-2 ${
              isSubmitting || !proof
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'gradient-gold text-slate-900 shadow-amber-500/30 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <ShieldCheck size={24} />
            )}
            <span>{isSubmitting ? 'Procesando...' : 'Enviar Notificación de Pago'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
