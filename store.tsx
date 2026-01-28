
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
      const team2 = tpl.teams[t2Idx === t1Idx ? (t2Idx + 1) % tpl.teams.length : t2Idx];

      // El Béisbol (tpl.id === '1') es el deporte con 2.5%
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

  // MOTOR DE LIQUIDACIÓN AUTOMÁTICA (Auto-Settlement)
  useEffect(() => {
    const settleInterval = setInterval(async () => {
      if (!user || !user.activeBet) return;

      const now = new Date();
      const endTime = new Date(user.activeBet.endTime);

      if (now >= endTime) {
        const profit = user.activeBet.potentialProfit;
        const investedAmount = user.activeBet.amount;
        const totalReturn = investedAmount + profit;

        // 1. Actualización local inmediata
        const updatedUser = { 
          ...user, 
          balance: user.balance + totalReturn, 
          activeBet: null 
        };
        setUser(updatedUser);

        // 2. Persistencia en base de datos
        try {
          // Actualizar balance y limpiar apuesta activa
          await adminUpdateUser(user.id, { 
            balance: user.balance + totalReturn, 
            activeBet: null 
          });

          // Registrar ganancia en el historial
          await addTransactionForUser(user.id, { 
            type: 'earning', 
            amount: profit, 
            description: `Rendimiento Arbitraje Finalizado (+${profit.toFixed(2)} USDT)` 
          });

          showNotification(`¡Ciclo Finalizado! +${totalReturn.toFixed(2)} USDT retornados al saldo.`, "success");
        } catch (err) {
          console.error("Error al liquidar apuesta:", err);
        }
      }
    }, 10000); // Verificar cada 10 segundos

    return () => clearInterval(settleInterval);
  }, [user]);

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

  useEffect(() => {
    if (user) {
      const current = allUsers.find(u => u.id === user.id);
      if (current) setUser(current);
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
      await addTransactionForUser(upline1.id, { type: 'bonus', amount: comm1, description: `Comisión Ref L1: ${targetUser.username}` });
      if (upline1.referredBy) {
        const upline2 = allUsers.find(u => u.referralCode === upline1.referredBy);
        if (upline2) {
          const comm2 = rechargeAmount * REFERRAL_COMMISSION.LEVEL_2;
          await adminUpdateUser(upline2.id, { balance: upline2.balance + comm2 });
          await addTransactionForUser(upline2.id, { type: 'bonus', amount: comm2, description: `Comisión Ref L2: ${targetUser.username}` });
        }
      }
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
            await addTransactionForUser(targetUser.id, { type: 'bonus', amount: ascensionBonus, description: `Bono Ascenso VIP ${targetUser.vipLevel}->${newVIP}` });
          }

          await adminUpdateUser(targetUser.id, { 
            balance: targetUser.balance + tx.amount + bonusAmount + ascensionBonus, 
            totalRecharge: newTotalRecharge, 
            vipLevel: newVIP 
          });

          if (bonusAmount > 0) await addTransactionForUser(targetUser.id, { type: 'bonus', amount: bonusAmount, description: 'Bono Bienvenida 3%' });
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
          await addTransactionForUser(targetUser.id, { type: 'earning', amount: tx.amount, description: 'Reembolso Retiro Rechazado' });
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
      return { success: true, message: "Registro exitoso." };
    } else {
      const found = allUsers.find(u => u.username === usernameLower);
      if (!found || found.password !== password) return { success: false, message: "Error de acceso." };
      if (found.isBlocked) return { success: false, message: "Cuenta bloqueada." };
      setUser(found);
      return { success: true, message: "Acceso concedido." };
    }
  };

  const logout = () => setUser(null);

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'recharge', amount, status: 'pending', date: new Date().toISOString(), description: 'Recarga USDT', proofData };
    await supabase.from('transactions').insert([tx]);
    setAllTransactions(prev => [tx as Transaction, ...prev]);
    showNotification("Notificación enviada al administrador.", "success");
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Error." };
    if ((new Date().getTime() - new Date(user.registrationDate).getTime()) / 3600000 < 24) return { success: false, message: "Seguridad 24h activa." };
    const currentVIP = VIP_LEVELS[user.vipLevel];
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };
    if (user.monthlyWithdrawalCount >= currentVIP.withdrawalsPerMonth) return { success: false, message: "Límite de retiros mensual alcanzado." };
    
    await adminUpdateUser(user.id, { balance: user.balance - amount, monthlyWithdrawalCount: user.monthlyWithdrawalCount + 1 });
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), description: 'Retiro USDT', walletAddress: user.withdrawalAddress };
    await supabase.from('transactions').insert([tx]);
    setAllTransactions(prev => [tx as Transaction, ...prev]);
    return { success: true, message: "Solicitud de retiro enviada." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    // Establecer tiempo final: 40 minutos (2,400,000 ms)
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet: ActiveBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit };
    
    // Sincronización optimista inmediata
    setUser(prev => prev ? { ...prev, balance: prev.balance - amount, activeBet } : null);
    
    await adminUpdateUser(user.id, { balance: user.balance - amount, activeBet, lastBetDate: new Date().toISOString() });
    await addTransactionForUser(user.id, { type: 'bet', amount, description: `Operación Arbitraje (${percent}%)` });
  };

  const processWeeklyCommissions = async () => {
    const eligible = allUsers.filter(u => u.pendingCommissions > 0);
    for (const u of eligible) {
      await adminUpdateUser(u.id, { balance: u.balance + u.pendingCommissions, pendingCommissions: 0 });
      await addTransactionForUser(u.id, { type: 'rebate', amount: u.pendingCommissions, description: 'Comisiones Semanales Red' });
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
          <div key={n.id} className={`pointer-events-auto backdrop-blur-md shadow-2xl rounded-2xl p-4 min-w-[280px] border-l-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 ${n.type === 'success' ? 'bg-slate-900/90 border-green-500 text-slate-100' : 'bg-slate-900/90 border-red-500 text-slate-100'}`}>
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
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
