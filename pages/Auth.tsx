
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ShieldCheck, User, Lock, Key, ArrowRight, UserPlus } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    // Intentar capturar el código de referido de la URL
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref');
    
    // Si no está en search, probar en el hash (común en SPAs)
    if (!ref && window.location.hash.includes('ref=')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      ref = hashParams.get('ref');
    }

    if (ref) {
      setReferralCode(ref);
      setIsLogin(false); // Cambiar a registro si hay un link de referido
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert("Complete los campos");
    if (!isLogin && password !== confirmPassword) return alert("Las contraseñas no coinciden");
    
    login(username, !isLogin ? referralCode : undefined);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col px-6 py-12 justify-center max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -mt-20 -mr-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mb-20 -ml-20"></div>

      <div className="relative z-10 space-y-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center text-slate-900 shadow-2xl shadow-amber-500/20 mb-2">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-white">NexusProfit</h1>
          <p className="text-slate-400 text-sm max-w-[240px]">Tu portal seguro a la libertad financiera descentralizada.</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5 space-y-8 shadow-2xl">
          <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
            >
              Registro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Código de Referido (Opcional)</label>
                  <div className="relative">
                    <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type="text" 
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Ej: NEXUS-12345"
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-400 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                  {referralCode && (
                    <p className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter mt-1 animate-pulse">
                      ¡Código detectado automáticamente!
                    </p>
                  )}
                </div>
              </>
            )}

            <button className="w-full py-4 gradient-gold rounded-xl text-slate-900 font-bold text-lg shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2">
              <span>{isLogin ? 'Acceder al Sistema' : 'Comenzar Ahora'}</span>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
