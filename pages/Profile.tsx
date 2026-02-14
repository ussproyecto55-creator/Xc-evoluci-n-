
import React, { useState } from 'react';
import { useApp } from '../store';
import { 
  LogOut, Settings, ChevronRight, 
  UserCircle2, Calendar, Crown, Lock, Wallet, Save,
  History as HistoryIcon, Send
} from 'lucide-react';
import { VIP_LEVELS } from '../constants';

interface ProfileProps {
  onNavigate?: (tab: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, logout, adminUpdateUser, saveWithdrawalAddress, showNotification } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  
  // Local states for settings
  const [newPassword, setNewPassword] = useState('');
  const [newWallet, setNewWallet] = useState(user?.withdrawalAddress || '');

  if (!user) return null;

  const currentVIP = VIP_LEVELS[user.vipLevel || 0] || VIP_LEVELS[0];

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    try {
      await adminUpdateUser(user.id, { password: newPassword });
      setNewPassword('');
      showNotification("Contraseña actualizada con éxito.", "success");
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      showNotification("Error al actualizar contraseña.", "error");
    }
  };

  const handleUpdateWallet = async () => {
    if (!newWallet) return;
    try {
      await saveWithdrawalAddress(newWallet);
      showNotification("Billetera configurada con éxito.", "success");
    } catch (err) {
      console.error("Error al configurar billetera:", err);
      showNotification("Error al configurar billetera.", "error");
    }
  };

  if (showSettings) {
    return (
      <div className="px-4 py-6 space-y-6 pb-24">
         <button onClick={() => setShowSettings(false)} className="text-amber-500 font-bold flex items-center space-x-1">
            <ChevronRight size={18} className="rotate-180" />
            <span>Volver al perfil</span>
         </button>
         <h2 className="text-2xl font-bold text-slate-100 font-display italic">Ajustes de Cuenta</h2>

         <div className="space-y-6">
            <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex items-center space-x-3 text-amber-500">
                  <Lock size={20} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Cambiar Contraseña</h3>
               </div>
               <div className="relative">
                  <input 
                    type="password"
                    placeholder="Nueva contraseña..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-slate-200 outline-none focus:border-amber-500"
                  />
                  <button 
                    onClick={handleUpdatePassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-900 p-2 rounded-lg"
                  >
                    <Save size={16} />
                  </button>
               </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex items-center space-x-3 text-blue-400">
                  <Wallet size={20} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Configurar Billetera</h3>
               </div>
               <div className="relative">
                  <input 
                    type="text"
                    placeholder="Dirección USDT (TRC20/BEP20)..."
                    value={newWallet}
                    onChange={(e) => setNewWallet(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-slate-200 outline-none focus:border-amber-500"
                  />
                  <button 
                    onClick={handleUpdateWallet}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg"
                  >
                    <Save size={16} />
                  </button>
               </div>
               <p className="text-[9px] text-slate-500 italic">Esta billetera se usará para todos tus retiros automáticos.</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <UserCircle2 size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 italic">{user.username}</h2>
          <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={12} />
            <span>Miembro desde {formatDate(user.registrationDate)}</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-5 flex justify-between items-center bg-white/5">
           <div className="flex items-center space-x-4">
             <div className={`w-12 h-12 rounded-xl ${currentVIP?.color || 'bg-slate-500'} flex items-center justify-center text-slate-900 shadow-lg`}>
               <Crown size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tu Rango Elite</p>
               <p className="text-lg font-bold text-slate-100 italic font-display">{currentVIP?.name || 'Inversor'}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-4">Servicio al Cliente</h3>
        <a 
          href="https://t.me/+xb9nTH7qSvs0ZjFh" 
          target="_blank" 
          className="flex items-center justify-between p-5 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] group active:scale-[0.98] transition-all shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Send size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-white italic uppercase tracking-tighter">Grupo Telegram Oficial</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Soporte y Comunidad</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-4">Gestión de Perfil</h3>
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5">
          <button 
            onClick={() => onNavigate && onNavigate('records')}
            className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                <HistoryIcon size={18} />
              </div>
              <span className="text-sm font-bold">Historial Financiero</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                <Settings size={18} />
              </div>
              <span className="text-sm font-bold">Seguridad y Billetera</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          
          <button 
            onClick={logout}
            className="w-full p-5 flex justify-between items-center hover:bg-red-500/5 transition-colors text-red-400 group"
          >
            <div className="flex items-center space-x-4">
               <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center py-8 space-y-2">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Elite Sports Platform v4.2</p>
        <p className="text-[8px] text-slate-700 uppercase tracking-widest px-14 leading-relaxed">Infraestructura financiera regulada bajo estándares de liquidez digital Nexus.</p>
      </div>
    </div>
  );
};
