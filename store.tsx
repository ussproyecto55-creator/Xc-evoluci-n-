
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, TeamMember, ActiveBet } from './types';
import { VIP_LEVELS, REFERRAL_COMMISSION, TEAM_REBATES, FIRST_RECHARGE_BONUS, SPORTS } from './constants';
import { supabase } from './lib/supabase';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

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

  const showNotification = (message: string | undefined | null, type: NotificationType = 'info') => {
    const safeMessage = message && message.trim() !== '' ? message : 'Error en la operación.';
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message: safeMessage, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: usersData } = await supabase.from('users').select('*');
        setAllUsers(usersData || []);
        const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        setAllTransactions(txData || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const usersSubscription = supabase.channel('public:users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      setAllUsers(prev => {
        if (payload.eventType === 'INSERT') return [...prev, payload.new as User];
        if (payload.eventType === 'UPDATE') return prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u);
        return prev;
      });
    }).subscribe();

    return () => { supabase.removeChannel(usersSubscription); };
  }, []);

  // Lógica para completar apuestas pendientes al cargar la app
  useEffect(() => {
    if (user && user.activeBet) {
      const now = new Date();
      const endTime = new Date(user.activeBet.endTime);
      if (now >= endTime) {
        completeBet(user.id, user.activeBet.amount, user.activeBet.potentialProfit);
      }
    }
  }, [user]);

  const completeBet = async (userId: string, capital: number, profit: number) => {
    const { data: freshUser } = await supabase.from('users').select('*').eq('id', userId).single();
    if (freshUser && freshUser.activeBet) {
      const totalReturn = capital + profit;
      await adminUpdateUser(freshUser.id, { 
        balance: freshUser.balance + totalReturn,
        activeBet: null 
      });
      await addTransactionForUser(freshUser.id, {
        type: 'earning',
        amount: profit,
        description: `Retorno de Capital + Interés 2.5% (+${totalReturn.toFixed(2)} USDT)`
      });
    }
  };

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => {
    const usernameLower = username.toLowerCase().trim();
    const existingUser = allUsers.find(u => u.username === usernameLower);
    if (isRegisterMode) {
      if (existingUser) return { success: false, message: "Usuario ya existe." };
      const newUser: User = {
        id: crypto.randomUUID(),
        username: usernameLower,
        password,
        balance: 0,
        totalRecharge: 0,
        pendingCommissions: 0,
        vipLevel: 0,
        referralCode: 'ELITE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        referredBy,
        registrationDate: new Date().toISOString(),
        monthlyWithdrawalCount: 0,
        role: usernameLower === 'admin' ? 'admin' : 'user',
        isBlocked: false,
        activeBet: null
      };
      await supabase.from('users').insert([newUser]);
      setUser(newUser);
      return { success: true, message: "Bienvenido." };
    } else {
      if (!existingUser || existingUser.password !== password) return { success: false, message: "Credenciales inválidas." };
      setUser(existingUser);
      return { success: true, message: "Acceso concedido." };
    }
  };

  const logout = () => setUser(null);

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    const startTime = new Date().toISOString();
    const SIMULATION_TIME = 2400000; // 40 MINUTOS REALES
    const endTime = new Date(Date.now() + SIMULATION_TIME).toISOString();

    const activeBet: ActiveBet = { amount, sportId, startTime, endTime, potentialProfit: profit };

    try {
      await adminUpdateUser(user.id, { balance: user.balance - amount, lastBetDate: startTime, activeBet });
      await addTransaction({ type: 'bet', amount, description: `Arbitraje Deportivo iniciado (40 min)` });
      
      setTimeout(() => completeBet(user.id, amount, profit), SIMULATION_TIME);
    } catch (err) {
      showNotification("Error de red.", "error");
    }
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Sesión expirada." };
    
    // REGLA: Solo puede retirar después de 24 horas de su registro/entrada
    const regDate = new Date(user.registrationDate).getTime();
    const now = new Date().getTime();
    const hoursSinceReg = (now - regDate) / (1000 * 60 * 60);

    if (hoursSinceReg < 24) {
      const remaining = (24 - hoursSinceReg).toFixed(1);
      return { success: false, message: `Seguridad: Primer retiro disponible en ${remaining} horas.` };
    }

    const currentVIP = VIP_LEVELS[user.vipLevel];
    if (user.monthlyWithdrawalCount >= currentVIP.withdrawalsPerMonth) return { success: false, message: "Límite de retiros alcanzado." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };

    await adminUpdateUser(user.id, { 
      balance: user.balance - amount, 
      monthlyWithdrawalCount: (user.monthlyWithdrawalCount || 0) + 1,
      lastWithdrawalDate: new Date().toISOString()
    });
    await addTransaction({ type: 'withdraw', amount, description: `Retiro solicitado`, walletAddress: user.withdrawalAddress });
    return { success: true, message: "Retiro en auditoría." };
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    await supabase.from('users').update(data).eq('id', userId);
  };

  const addTransactionForUser = async (userId: string, tx: any) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    await supabase.from('transactions').insert([{ ...tx, id: crypto.randomUUID(), userId, username: target.username, date: new Date().toISOString(), status: 'completed' }]);
  };

  const addTransaction = async (tx: any) => {
    if (!user) return;
    await supabase.from('transactions').insert([{ ...tx, id: crypto.randomUUID(), userId: user.id, username: user.username, date: new Date().toISOString(), status: tx.type === 'withdraw' ? 'pending' : 'completed' }]);
  };

  const saveWithdrawalAddress = async (address: string) => { if (user) await adminUpdateUser(user.id, { withdrawalAddress: address }); };
  const processWeeklyCommissions = async () => {};
  const adminUpdateTransaction = async (id: string, status: any) => { await supabase.from('transactions').update({ status }).eq('id', id); };
  const recharge = async (amount: number, proofData?: string) => { await addTransaction({ type: 'recharge', amount, description: 'Recarga USDT', proofData }); };

  return (
    <AppContext.Provider value={{ 
      user, allUsers, allTransactions, isLoading, setUser, addTransaction,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest, processWeeklyCommissions,
      adminUpdateTransaction, adminUpdateUser, showNotification
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className={`pointer-events-auto backdrop-blur-md shadow-2xl rounded-2xl p-4 min-w-[300px] border-l-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 ${n.type === 'success' ? 'bg-slate-900/90 border-green-500 text-slate-100' : 'bg-slate-900/90 border-red-500 text-slate-100'}`}>
            <div className="flex-1">
              <p className="text-xs font-bold">{n.message}</p>
            </div>
            <button onClick={() => removeNotification(n.id)}><X size={16} /></button>
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
