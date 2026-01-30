
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
  applyCompoundInterest: (amount: number, percent: number, sportId: string, market: string) => Promise<void>;
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

  const dailySports = useMemo(() => {
    const now = new Date();
    const effectiveDate = new Date(now.getTime() - (11 * 60 * 60 * 1000));
    const daySeed = effectiveDate.getFullYear() * 10000 + (effectiveDate.getMonth() + 1) * 100 + effectiveDate.getDate();
    const priorityIndex = daySeed % SPORT_TEMPLATES.length;
    
    return SPORT_TEMPLATES.map((tpl, idx) => {
      const teamSeed = daySeed + idx;
      const t1Idx = teamSeed % tpl.teams.length;
      const t2Idx = (teamSeed + 13) % tpl.teams.length;
      const mIdx = (daySeed + idx) % (tpl.markets?.length || 1);
      const market = tpl.markets ? tpl.markets[mIdx] : 'Marcador Inverso 3-3';
      const team1 = tpl.teams[t1Idx];
      const team2 = tpl.teams[t2Idx === t1Idx ? (t2Idx + 1) % tpl.teams.length : t2Idx] || tpl.teams[0];
      const isPriority = idx === priorityIndex;

      return {
        id: tpl.id,
        name: `${team1} vs ${team2}`,
        icon: tpl.icon,
        baseReturn: isPriority ? 0.025 : Math.max(0.011, Math.min(0.018, tpl.baseReturn + ((daySeed % 3) / 1000))),
        color: tpl.color,
        fakeVolume: `${(300 + (daySeed % 650))}K`,
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
      const { data: usersData, error: uError } = await supabase.from('users').select('*');
      if (usersData) setAllUsers(usersData);
      
      const { data: txData, error: tError } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (txData) setAllTransactions(txData);

      if (uError || tError) console.error("Supabase error:", uError || tError);
    } catch (err) {
      console.error("Critical fetch error:", err);
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
        
        // Sincronización inmediata de UI
        setUser(prev => prev ? { ...prev, balance: newBalance, activeBet: null } : null);

        await addTransactionForUser(user.id, {
          type: 'earning',
          amount: profit,
          description: `Arbitraje Exitoso [${user.activeBet.market}]`
        });

        await supabase.from('users').update({ balance: newBalance, activeBet: null }).eq('id', user.id);
        showNotification(`¡Ciclo Finalizado! +$${totalToReturn.toFixed(2)} USDT acreditados.`, "success");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) {
      const current = allUsers.find(u => u.id === user.id);
      if (current) {
        if (current.balance !== user.balance || JSON.stringify(current.activeBet) !== JSON.stringify(user.activeBet)) {
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
  };

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => {
    const usernameLower = username.toLowerCase().trim();
    try {
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
        return { success: true, message: "Cuenta Creada." };
      } else {
        const found = allUsers.find(u => u.username === usernameLower);
        if (!found || found.password !== password) return { success: false, message: "Credenciales erróneas." };
        if (found.isBlocked) return { success: false, message: "Cuenta bloqueada." };
        setUser(found);
        return { success: true, message: "Bienvenido." };
      }
    } catch (e) {
      return { success: false, message: "Error de conexión con el servidor." };
    }
  };

  const logout = () => setUser(null);

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'recharge', amount, status: 'pending', date: new Date().toISOString(), description: 'Depósito Nexus', proofData };
    await supabase.from('transactions').insert([tx]);
    showNotification("Notificación enviada.", "success");
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "No autenticado." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };
    
    const newBalance = user.balance - amount;
    
    // Sincronización inmediata total
    setUser(prev => prev ? { ...prev, balance: newBalance, monthlyWithdrawalCount: (prev.monthlyWithdrawalCount || 0) + 1 } : null);
    
    const tx = { id: crypto.randomUUID(), userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), description: 'Solicitud de Retiro', walletAddress: user.withdrawalAddress };
    
    await supabase.from('transactions').insert([tx]);
    await supabase.from('users').update({ balance: newBalance, monthlyWithdrawalCount: (user.monthlyWithdrawalCount || 0) + 1 }).eq('id', user.id);
    
    return { success: true, message: "Retiro en auditoría." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string, market: string) => {
    if (!user || user.activeBet) return;
    
    const profit = (amount * percent) / 100;
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet: ActiveBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit, market };
    const newBalance = user.balance - amount;
    
    // Sincronización inmediata total (Header + Main)
    setUser(prev => prev ? { ...prev, balance: newBalance, activeBet } : null);

    await supabase.from('users').update({ balance: newBalance, activeBet, lastBetDate: new Date().toISOString() }).eq('id', user.id);
    await addTransactionForUser(user.id, { type: 'bet', amount, description: `Arbitraje Inverso [${market}]` });
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
      showNotification("Transacción actualizada.", "success");
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
