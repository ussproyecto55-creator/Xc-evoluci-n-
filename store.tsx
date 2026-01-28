
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Transaction, TeamMember, ActiveBet, Sport } from './types';
import { VIP_LEVELS, REFERRAL_COMMISSION, TEAM_REBATES, FIRST_RECHARGE_BONUS, SPORT_TEMPLATES } from './constants';
import { supabase } from './lib/supabase';
import { X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface AppContextType {
  user: User | null;
  allUsers: User[];
  allTransactions: Transaction[];
  dailySports: Sport[];
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status' | 'userId' | 'username'>) => Promise<void>;
  login: (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  recharge: (amount: number, proofData?: string) => Promise<void>;
  withdraw: (amount: number) => Promise<{ success: boolean; message: string }>;
  saveWithdrawalAddress: (address: string) => Promise<void>;
  applyCompoundInterest: (amount: number, percent: number, sportId: string) => Promise<void>;
  processWeeklyCommissions: () => Promise<void>;
  adminUpdateTransaction: (id: string, status: 'completed' | 'rejected') => Promise<void>;
  adminUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
  showNotification: (message: string | undefined | null, type?: NotificationType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Lógica de Rotación Diaria - Béisbol (ID '1') siempre al 2.5% hoy
  const dailySports = useMemo(() => {
    const today = new Date();
    const daySeed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
    
    return SPORT_TEMPLATES.map((tpl, idx) => {
      const teamSeed = daySeed + idx;
      const t1Idx = teamSeed % tpl.teams.length;
      const t2Idx = (teamSeed + 3) % tpl.teams.length;
      const team1 = tpl.teams[t1Idx];
      const team2 = tpl.teams[t2Idx === t1Idx ? (t2Idx + 1) : t2Idx] || tpl.teams[0];

      // Béisbol (ID: '1') al 2.5%
      const isPriority = tpl.id === '1';

      return {
        id: tpl.id,
        name: `${team1} vs ${team2}`,
        icon: tpl.icon,
        baseReturn: isPriority ? 0.025 : tpl.baseReturn + ((daySeed % 5) / 1000),
        color: tpl.color,
        fakeVolume: `${(100 + (daySeed % 900))}K`
      } as Sport;
    });
  }, []);

  const showNotification = (message: string | undefined | null, type: NotificationType = 'info') => {
    const safeMessage = message && message.trim() !== '' ? message : 'Operación exitosa.';
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message: safeMessage, type }]);
    setTimeout(() => removeNotification(id), 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchData = async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) setAllUsers(usersData);
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (txData) setAllTransactions(txData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const usersSub = supabase.channel('users-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData()).subscribe();
    const txSub = supabase.channel('tx-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(usersSub); supabase.removeChannel(txSub); };
  }, []);

  // Sincronización robusta del usuario activo
  useEffect(() => {
    if (user) {
      const current = allUsers.find(u => u.id === user.id);
      if (current) {
        // Solo actualizamos si hay cambios reales para evitar bucles, 
        // pero priorizamos la consistencia del balance
        if (current.balance !== user.balance || current.activeBet !== user.activeBet) {
          setUser(current);
        }
      }
    }
  }, [allUsers]);

  const addTransactionForUser = async (userId: string, tx: any) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const newTx = { ...tx, id: crypto.randomUUID(), userId, username: target.username, date: new Date().toISOString(), status: 'completed' };
    await supabase.from('transactions').insert([newTx]);
    setAllTransactions(prev => [newTx as Transaction, ...prev]);
  };

  const applyReferralCommissionsOnRecharge = async (targetUser: User, rechargeAmount: number) => {
    if (!targetUser.referredBy) return;
    const upline1 = allUsers.find(u => u.referralCode === targetUser.referredBy);
    if (upline1) {
      const comm1 = rechargeAmount * REFERRAL_COMMISSION.LEVEL_1;
      await adminUpdateUser(upline1.id, { balance: upline1.balance + comm1 });
      await addTransactionForUser(upline1.id, { type: 'bonus', amount: comm1, description: `Ref L1: ${targetUser.username}` });
    }
  };

  const adminUpdateTransaction = async (id: string, status: 'completed' | 'rejected') => {
    const tx = allTransactions.find(t => t.id === id);
    if (!tx) return;

    setAllTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    try {
      if (status === 'completed' && tx.type === 'recharge' && tx.status === 'pending') {
        const targetUser = allUsers.find(u => u.id === tx.userId);
        if (targetUser) {
          const isFirstRecharge = targetUser.totalRecharge === 0;
          let bonusAmount = isFirstRecharge ? tx.amount * FIRST_RECHARGE_BONUS : 0;
          let newTotalRecharge = targetUser.totalRecharge + tx.amount;
          
          let newVIP = 0;
          const sortedVIPs = [...VIP_LEVELS].sort((a, b) => a.minRecharge - b.minRecharge);
          for (const v of sortedVIPs) { if (newTotalRecharge >= v.minRecharge) { newVIP = v.id; } }
          
          let ascensionBonus = 0;
          if (newVIP > targetUser.vipLevel) {
            for (let i = targetUser.vipLevel + 1; i <= newVIP; i++) ascensionBonus += VIP_LEVELS[i].bonus;
          }

          await adminUpdateUser(targetUser.id, { 
            balance: targetUser.balance + tx.amount + bonusAmount + ascensionBonus, 
            totalRecharge: newTotalRecharge, 
            vipLevel: newVIP 
          });

          if (bonusAmount > 0) await addTransactionForUser(targetUser.id, { type: 'bonus', amount: bonusAmount, description: 'Bono 3% Recarga' });
          if (ascensionBonus > 0) await addTransactionForUser(targetUser.id, { type: 'bonus', amount: ascensionBonus, description: 'Bono VIP' });
          await applyReferralCommissionsOnRecharge(targetUser, tx.amount);
        }
      }

      if (status === 'rejected' && tx.type === 'withdraw' && tx.status === 'pending') {
        const targetUser = allUsers.find(u => u.id === tx.userId);
        if (targetUser) {
          await adminUpdateUser(targetUser.id, { 
            balance: targetUser.balance + tx.amount, 
            monthlyWithdrawalCount: Math.max(0, (targetUser.monthlyWithdrawalCount || 0) - 1) 
          });
        }
      }

      await supabase.from('transactions').update({ status }).eq('id', id);
      showNotification(`${status === 'completed' ? 'Aprobado' : 'Rechazado'} correctamente.`, "success");
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => {
    const usernameLower = username.toLowerCase().trim();
    if (isRegisterMode) {
      const existingUser = allUsers.find(u => u.username === usernameLower);
      if (existingUser) return { success: false, message: "Usuario existente." };
      const newUser: User = {
        id: crypto.randomUUID(), username: usernameLower, password, balance: 0, totalRecharge: 0,
        pendingCommissions: 0, vipLevel: 0, referralCode: 'ELITE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        referredBy, registrationDate: new Date().toISOString(), monthlyWithdrawalCount: 0,
        role: usernameLower === 'admin' ? 'admin' : 'user', isBlocked: false, activeBet: null
      };
      await supabase.from('users').insert([newUser]);
      fetchData(); setUser(newUser);
      return { success: true, message: "Bienvenido a la red." };
    } else {
      const found = allUsers.find(u => u.username === usernameLower);
      if (!found || found.password !== password) return { success: false, message: "Credenciales erróneas." };
      if (found.isBlocked) return { success: false, message: "Cuenta bloqueada." };
      setUser(found);
      return { success: true, message: "Acceso autorizado." };
    }
  };

  const logout = () => setUser(null);

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'recharge', amount, status: 'pending', date: new Date().toISOString(), description: 'Depósito Auditado', proofData };
    await supabase.from('transactions').insert([tx]);
    setAllTransactions(prev => [tx as Transaction, ...prev]);
    showNotification("Notificación enviada.", "success");
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Error sesión." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };
    
    // Sincronización optimista inmediata
    const newBalance = user.balance - amount;
    setUser(prev => prev ? { ...prev, balance: newBalance } : null);
    
    await adminUpdateUser(user.id, { balance: newBalance, monthlyWithdrawalCount: user.monthlyWithdrawalCount + 1 });
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), description: 'Retiro Solicitado', walletAddress: user.withdrawalAddress };
    await supabase.from('transactions').insert([tx]);
    setAllTransactions(prev => [tx as Transaction, ...prev]);
    return { success: true, message: "Solicitud enviada." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet: ActiveBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit };
    
    // ACTUALIZACIÓN OPTIMISTA: Restar saldo inmediatamente para el header y UI
    const newBalance = user.balance - amount;
    setUser(prev => prev ? { ...prev, balance: newBalance, activeBet } : null);
    
    await adminUpdateUser(user.id, { balance: newBalance, activeBet, lastBetDate: new Date().toISOString() });
    await addTransactionForUser(user.id, { type: 'bet', amount, description: `Inversión Deportiva (${percent}%)` });
  };

  const processWeeklyCommissions = async () => {
    const eligible = allUsers.filter(u => u.pendingCommissions > 0);
    for (const u of eligible) {
      await adminUpdateUser(u.id, { balance: u.balance + u.pendingCommissions, pendingCommissions: 0 });
    }
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    if (user && user.id === userId) setUser(prev => prev ? { ...prev, ...data } : null);
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    await supabase.from('users').update(data).eq('id', userId);
  };

  const saveWithdrawalAddress = async (address: string) => { if (user) await adminUpdateUser(user.id, { withdrawalAddress: address }); };

  const addTransaction = async (tx: any) => {
    if (!user) return;
    const newTx = { ...tx, id: crypto.randomUUID(), userId: user.id, username: user.username, date: new Date().toISOString() };
    await supabase.from('transactions').insert([newTx]);
    setAllTransactions(prev => [newTx, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      user, allUsers, allTransactions, dailySports, isLoading, setUser, addTransaction,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest, processWeeklyCommissions,
      adminUpdateTransaction, adminUpdateUser, showNotification
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto backdrop-blur-md shadow-2xl rounded-2xl p-4 min-w-[280px] border-l-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 bg-slate-900/90 border-amber-500 text-slate-100">
            <div className="flex-1 text-xs font-bold">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="text-slate-500"><X size={16} /></button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp context error');
  return context;
};
