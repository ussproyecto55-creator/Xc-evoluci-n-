
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Transaction, TeamMember, ActiveBet, Sport } from './types';
import { VIP_LEVELS, REFERRAL_COMMISSION, TEAM_REBATES, FIRST_RECHARGE_BONUS, SATURDAY_SUPER_RECHARGE_BONUS, SPORT_TEMPLATES } from './constants';
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
  applyCompoundInterest: (amount: number, percent: number, sportId: string, market: string) => Promise<void>;
  processWeeklyCommissions: () => Promise<void>;
  adminUpdateTransaction: (id: string, status: 'completed' | 'rejected') => Promise<void>;
  adminUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
  showNotification: (message: string | undefined | null, type?: NotificationType) => void;
  getDRTime: () => Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Función para obtener la hora exacta en República Dominicana (UTC-4)
  const getDRTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santo_Domingo" }));
  };

  const dailySports = useMemo(() => {
    const drTime = getDRTime();
    // Ajuste de reset a las 11 AM RD: si es antes de las 11, usamos la semilla del día anterior
    const effectiveDate = drTime.getHours() < 11 ? new Date(drTime.getTime() - 24 * 60 * 60 * 1000) : drTime;
    
    const daySeed = effectiveDate.getFullYear() * 10000 + (effectiveDate.getMonth() + 1) * 100 + effectiveDate.getDate();
    const priorityIndex = daySeed % SPORT_TEMPLATES.length;
    
    return SPORT_TEMPLATES.map((tpl, idx) => {
      const mIdx = (daySeed + idx) % (tpl.markets?.length || 1);
      const market = tpl.markets ? tpl.markets[mIdx] : 'Marcador Inverso 3-3';
      const isPriority = idx === priorityIndex;

      return {
        id: tpl.id,
        name: tpl.name, 
        icon: tpl.icon,
        baseReturn: isPriority ? 0.025 : Math.max(0.011, Math.min(0.018, tpl.baseReturn + ((daySeed % 3) / 1000))),
        color: tpl.color,
        fakeVolume: `${(350 + (daySeed % 550))}K`,
        market: market
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

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user?.activeBet) return;
      const now = new Date();
      const endTime = new Date(user.activeBet.endTime);
      if (now >= endTime) {
        const profit = user.activeBet.potentialProfit;
        const totalToReturn = user.activeBet.amount + profit;
        const newBalance = user.balance + totalToReturn;
        
        setUser(prev => prev ? { ...prev, balance: newBalance, activeBet: null } : null);

        await addTransactionForUser(user.id, {
          type: 'earning',
          amount: profit,
          description: `ROI Auditado: ${user.activeBet.market}`
        });

        await supabase.from('users').update({ balance: newBalance, activeBet: null }).eq('id', user.id);
        showNotification(`¡Inversión Finalizada! +$${totalToReturn.toFixed(2)} USDT retornados.`, "success");
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const addTransactionForUser = async (userId: string, tx: any) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const newTx = { ...tx, id: crypto.randomUUID(), userId, username: target.username, date: new Date().toISOString(), status: 'completed' };
    await supabase.from('transactions').insert([newTx]);
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
      setUser(newUser);
      return { success: true, message: "Registro exitoso." };
    } else {
      const found = allUsers.find(u => u.username === usernameLower);
      if (!found || found.password !== password) return { success: false, message: "Error de credenciales." };
      if (found.isBlocked) return { success: false, message: "Cuenta bloqueada." };
      setUser(found);
      return { success: true, message: "Acceso autorizado." };
    }
  };

  const logout = () => setUser(null);

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'recharge', amount, status: 'pending', date: new Date().toISOString(), description: 'Depósito USDT', proofData };
    await supabase.from('transactions').insert([tx]);
    showNotification("Notificación de pago enviada.", "success");
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Error." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };
    const newBalance = user.balance - amount;
    setUser(prev => prev ? { ...prev, balance: newBalance, monthlyWithdrawalCount: (prev.monthlyWithdrawalCount || 0) + 1 } : null);
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), description: 'Retiro Nexus', walletAddress: user.withdrawalAddress };
    await supabase.from('transactions').insert([tx]);
    await supabase.from('users').update({ balance: newBalance, monthlyWithdrawalCount: (user.monthlyWithdrawalCount || 0) + 1 }).eq('id', user.id);
    return { success: true, message: "Solicitud de retiro enviada." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string, market: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet: ActiveBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit, market };
    const newBalance = user.balance - amount;
    setUser(prev => prev ? { ...prev, balance: newBalance, activeBet } : null);
    await supabase.from('users').update({ balance: newBalance, activeBet, lastBetDate: new Date().toISOString() }).eq('id', user.id);
    await addTransactionForUser(user.id, { type: 'bet', amount, description: `Inversión Inversa: ${market}` });
  };

  const adminUpdateTransaction = async (id: string, status: 'completed' | 'rejected') => {
    const tx = allTransactions.find(t => t.id === id);
    if (!tx) return;
    try {
      if (status === 'completed' && tx.type === 'recharge' && tx.status === 'pending') {
        const targetUser = allUsers.find(u => u.id === tx.userId);
        if (targetUser) {
          const isFirstRecharge = targetUser.totalRecharge === 0;
          const isSaturday = new Date(tx.date).getDay() === 6;
          
          let bonusAmount = isFirstRecharge ? tx.amount * FIRST_RECHARGE_BONUS : 0;
          let saturdayBonus = isSaturday ? tx.amount * SATURDAY_SUPER_RECHARGE_BONUS : 0;
          
          let newTotalRecharge = targetUser.totalRecharge + tx.amount;
          let newVIP = 0;
          const sortedVIPs = [...VIP_LEVELS].sort((a, b) => a.minRecharge - b.minRecharge);
          for (const v of sortedVIPs) { if (newTotalRecharge >= v.minRecharge) { newVIP = v.id; } }
          
          let ascensionBonus = 0;
          if (newVIP > targetUser.vipLevel) {
            for (let i = targetUser.vipLevel + 1; i <= newVIP; i++) ascensionBonus += VIP_LEVELS[i].bonus;
          }
          
          const finalAddedBalance = tx.amount + bonusAmount + ascensionBonus + saturdayBonus;
          await adminUpdateUser(targetUser.id, { 
            balance: targetUser.balance + finalAddedBalance, 
            totalRecharge: newTotalRecharge, 
            vipLevel: newVIP 
          });

          if (isSaturday) {
            await addTransactionForUser(targetUser.id, {
              type: 'bonus',
              amount: saturdayBonus,
              description: 'Bono Súper Recarga (Sábado)'
            });
          }
        }
      }
      await supabase.from('transactions').update({ status }).eq('id', id);
      showNotification("Operación actualizada.", "success");
    } catch (err) { console.error(err); }
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    if (user && user.id === userId) setUser(prev => prev ? { ...prev, ...data } : null);
    await supabase.from('users').update(data).eq('id', userId);
  };

  const processWeeklyCommissions = async () => {
    const eligible = allUsers.filter(u => u.pendingCommissions > 0);
    for (const u of eligible) {
      await adminUpdateUser(u.id, { balance: u.balance + u.pendingCommissions, pendingCommissions: 0 });
    }
  };

  const saveWithdrawalAddress = async (address: string) => { if (user) await adminUpdateUser(user.id, { withdrawalAddress: address }); };

  const addTransaction = async (tx: any) => {
    if (!user) return;
    await supabase.from('transactions').insert([{ ...tx, id: crypto.randomUUID(), userId: user.id, username: user.username, date: new Date().toISOString() }]);
  };

  return (
    <AppContext.Provider value={{ 
      user, allUsers, allTransactions, dailySports, isLoading, setUser, addTransaction,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest, processWeeklyCommissions,
      adminUpdateTransaction, adminUpdateUser, showNotification, getDRTime
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
