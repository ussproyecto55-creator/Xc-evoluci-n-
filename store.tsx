
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

  const getDRTime = () => {
    // Calculamos UTC-4 (República Dominicana) de forma manual para evitar discrepancias de servidor
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc - (3600000 * 4));
  };

  const dailySports = useMemo(() => {
    const drTime = getDRTime();
    const resetHour = 11;
    // Si la hora actual en RD es menor a 11 AM, el "día de negocio" sigue siendo el anterior
    const effectiveDate = drTime.getHours() < resetHour 
      ? new Date(drTime.getTime() - (24 * 60 * 60 * 1000)) 
      : drTime;
    
    const daySeed = effectiveDate.getFullYear() * 10000 + (effectiveDate.getMonth() + 1) * 100 + effectiveDate.getDate();
    
    return SPORT_TEMPLATES.map((tpl, idx) => {
      const isPriority = tpl.id === '2'; // MLB Baseball 2.5%
      const mIdx = (daySeed + idx) % (tpl.markets?.length || 1);
      const market = tpl.markets ? tpl.markets[mIdx] : 'Inverso 3-3';

      return {
        id: tpl.id,
        name: tpl.name, 
        icon: tpl.icon,
        baseReturn: isPriority ? 0.025 : Math.max(0.011, Math.min(0.018, tpl.baseReturn + ((daySeed % 7) / 1000))),
        color: tpl.color,
        fakeVolume: `${(500 + (daySeed % 300))}K`,
        market: market
      } as Sport;
    });
  }, []);

  const showNotification = (message: string | undefined | null, type: NotificationType = 'info') => {
    const safeMessage = message && message.trim() !== '' ? message : 'Confirmado';
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

        const newTx = { 
          id: crypto.randomUUID(), 
          userId: user.id, 
          username: user.username, 
          type: 'earning', 
          amount: profit, 
          date: new Date().toISOString(), 
          status: 'completed',
          description: `ROI Liberado: ${user.activeBet.market}`
        };
        
        await supabase.from('transactions').insert([newTx]);
        await supabase.from('users').update({ balance: newBalance, activeBet: null }).eq('id', user.id);
        showNotification(`Ciclo completado: +$${totalToReturn.toFixed(2)} USDT`, "success");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => {
    const usernameLower = username.toLowerCase().trim();
    if (isRegisterMode) {
      const existingUser = allUsers.find(u => u.username === usernameLower);
      if (existingUser) return { success: false, message: "ID ya registrado." };
      const newUser: User = {
        id: crypto.randomUUID(), username: usernameLower, password, balance: 0, totalRecharge: 0,
        pendingCommissions: 0, vipLevel: 0, referralCode: 'NX-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        referredBy, registrationDate: new Date().toISOString(), monthlyWithdrawalCount: 0,
        role: usernameLower === 'admin' ? 'admin' : 'user', isBlocked: false, activeBet: null
      };
      await supabase.from('users').insert([newUser]);
      setUser(newUser);
      return { success: true, message: "Infraestructura lista." };
    } else {
      const found = allUsers.find(u => u.username === usernameLower);
      if (!found || found.password !== password) return { success: false, message: "Error de acceso." };
      if (found.isBlocked) return { success: false, message: "Cuenta suspendida." };
      setUser(found);
      return { success: true, message: "Acceso concedido." };
    }
  };

  const logout = () => setUser(null);

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'recharge', amount, status: 'pending', date: new Date().toISOString(), description: 'Carga de Liquidez', proofData };
    await supabase.from('transactions').insert([tx]);
    showNotification("Transacción en auditoría.", "success");
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Error." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };
    const newBalance = user.balance - amount;
    setUser(prev => prev ? { ...prev, balance: newBalance, monthlyWithdrawalCount: (prev.monthlyWithdrawalCount || 0) + 1 } : null);
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), description: 'Extracción Nexus', walletAddress: user.withdrawalAddress };
    await supabase.from('transactions').insert([tx]);
    await supabase.from('users').update({ balance: newBalance, monthlyWithdrawalCount: (user.monthlyWithdrawalCount || 0) + 1 }).eq('id', user.id);
    return { success: true, message: "Solicitud enviada." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string, market: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet: ActiveBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit, market };
    const newBalance = user.balance - amount;
    
    setUser(prev => prev ? { ...prev, balance: newBalance, activeBet } : null);
    await supabase.from('users').update({ balance: newBalance, activeBet, lastBetDate: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('transactions').insert([{ id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'bet', amount, status: 'completed', date: new Date().toISOString(), description: `Ciclo: ${market}` }]);
  };

  const adminUpdateTransaction = async (id: string, status: 'completed' | 'rejected') => {
    const tx = allTransactions.find(t => t.id === id);
    if (!tx) return;
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
        }
      }
      await supabase.from('transactions').update({ status }).eq('id', id);
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
          <div key={n.id} className="pointer-events-auto backdrop-blur-md shadow-2xl rounded-2xl p-4 min-w-[280px] border-l-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 bg-slate-900/95 border-amber-500 text-slate-100">
            <div className="flex-1 text-xs font-bold leading-tight">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="text-slate-500 hover:text-white"><X size={16} /></button>
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
