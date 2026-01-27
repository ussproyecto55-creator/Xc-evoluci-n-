
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ShieldCheck, User, Lock, Key, ArrowRight, UserPlus, Eye, EyeOff, CheckCircle, Info, X } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref');
    if (!ref && window.location.hash.includes('ref=')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      ref = hashParams.get('ref');
    }
    if (ref) {
      setReferralCode(ref);
      setIsLogin(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert("Por favor complete todos los campos.");
    if (!isLogin && password !== confirmPassword) return alert("Las contraseñas no coinciden.");
    if (!isLogin && !acceptTerms) return alert("Debe aceptar los términos y condiciones.");
    
    const result = login(username, password, !isLogin, !isLogin ? referralCode : undefined);
    if (!result.success) {
      alert(result.message);
    }
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
          <h1 className="text-4xl font-bold font-display tracking-tight text-white">Elite Sports</h1>
          <p className="text-slate-400 text-sm max-w-[240px]">Tu portal seguro a la libertad financiera descentralizada.</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5 space-y-8 shadow-2xl">
          <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setUsername(''); setPassword(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setUsername(''); setPassword(''); }}
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
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
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
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-slate-200 focus:border-amber-500 outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type={showPassword ? "text" : "password"} 
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
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Ej: ELITE-12345"
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-400 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                   <button 
                    type="button"
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center shrink-0 ${acceptTerms ? 'bg-amber-500 border-amber-500' : 'bg-slate-800 border-white/10'}`}
                   >
                     {acceptTerms && <CheckCircle size={14} className="text-slate-900" />}
                   </button>
                   <p className="text-[10px] text-slate-500 leading-tight">
                     He leído y acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-amber-500 font-bold underline">Términos y Condiciones</button> de Elite Sports.
                   </p>
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

      {showTermsModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/95" onClick={() => setShowTermsModal(false)}></div>
           <div className="relative glass w-full max-w-sm rounded-3xl p-6 border border-white/10 max-h-[80vh] flex flex-col animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-amber-500 font-black italic uppercase text-sm">Términos del Servicio</h3>
                 <button onClick={() => setShowTermsModal(false)} className="text-slate-500"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar text-[10px] text-slate-400 leading-relaxed italic">
                 <p className="font-bold text-slate-300 uppercase underline">1. Naturaleza de la Plataforma</p>
                 <p>Elite Sports opera como una red de interés compuesto basada en el rendimiento de arbitraje deportivo simulado. No somos una entidad bancaria.</p>
                 
                 <p className="font-bold text-slate-300 uppercase underline">2. Política de Retiros</p>
                 <p>Los retiros están sujetos a los límites de su nivel VIP. Elite Sports se reserva el derecho de auditar cualquier transacción sospechosa hasta por 48 horas.</p>

                 <p className="font-bold text-slate-300 uppercase underline">3. Gestión de Riesgos</p>
                 <p>El capital invertido genera rendimientos variables. El usuario entiende que participa bajo su propia responsabilidad financiera.</p>

                 <p className="font-bold text-slate-300 uppercase underline">4. Sistema de Red</p>
                 <p>Las comisiones de referidos son un incentivo por expansión de marca. No se permite el auto-referido masivo.</p>
              </div>
              <button 
                onClick={() => { setAcceptTerms(true); setShowTermsModal(false); }}
                className="mt-6 w-full py-3 bg-amber-500 text-slate-900 font-bold rounded-xl uppercase text-[10px]"
              >
                Aceptar y Continuar
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
