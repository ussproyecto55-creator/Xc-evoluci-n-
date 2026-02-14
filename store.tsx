
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Transaction, TeamMember, ActiveBet, Sport } from './types';
import { VIP_LEVELS, REFERRAL_COMMISSION, TEAM_REBATES, SPORT_TEMPLATES, WEDNESDAY_SUPER_RECHARGE_BONUS } from './constants';
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

const mapDbUser = (dbUser: any): User => ({
  id: dbUser.id,
  username: dbUser.username,
  password: dbUser.password,
  balance: dbUser.balance || 0,
  totalRecharge: dbUser.total_recharge || 0,
  pendingCommissions: dbUser.pending_commissions || 0,
  vipLevel: dbUser.vip_level || 0,
  referralCode: dbUser.referral_code,
  referredBy: dbUser.referred_by,
  registrationDate: dbUser.registration_date,
  activeBet: dbUser.active_bet,
  withdrawalAddress: dbUser.withdrawal_address,
  lastBetDate: dbUser.last_bet_date,
  monthlyWithdrawalCount: dbUser.monthly_withdrawal_count || 0,
  role: dbUser.role || 'user',
  isBlocked: dbUser.is_blocked || false,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchData = async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      
      if (usersData) {
        const mappedUsers = usersData.map(mapDbUser);
        setAllUsers(mappedUsers);
        
        const savedSession = localStorage.getItem('elite_session_id');
        if (savedSession) {
          const current = mappedUsers.find(u => u.id === savedSession);
          if (current) setUser(current);
        }

        const adminExists = usersData.some(u => u.username === 'admin');
        if (!adminExists) {
          const defaultAdmin = {
            username: 'admin',
            password: '@honduras12',
            balance: 1000000,
            total_recharge: 0,
            vip_level: 7,
            referral_code: 'MASTER-HND',
            registration_date: new Date().toISOString(),
            role: 'admin',
            is_blocked: false
          };
          await supabase.from('users').insert([defaultAdmin]);
          fetchData();
        }
      }
      if (txData) setAllTransactions(txData);
    } catch (error) {
      console.error("Error fetching Supabase data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDRTime = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Honduras UTC-6
    return new Date(utc - (3600000 * 6)); 
  };

  const dailySports = useMemo(() => {
    const drTime = getDRTime();
    const day = drTime.getDay();
    // 0 = Domingo, 6 = Sabado. No hay jugadas.
    if (day === 0 || day === 6) return [];

    const isWednesday = day === 3;
    const resetHour = 11;
    const effectiveDate = drTime.getHours() < resetHour 
      ? new Date(drTime.getTime() - (24 * 60 * 60 * 1000)) 
      : drTime;
    const daySeed = effectiveDate.getFullYear() * 10000 + (effectiveDate.getMonth() + 1) * 100 + effectiveDate.getDate();
    
    return SPORT_TEMPLATES.map((tpl, idx) => {
      const isPriority = tpl.id === '2'; 
      const mIdx = (daySeed + idx) % (tpl.markets?.length || 1);
      const market = tpl.markets ? tpl.markets[mIdx] : 'Inverso 3-3';
      
      let baseReturn = isPriority ? 0.025 : Math.max(0.011, Math.min(0.018, tpl.baseReturn + ((daySeed % 7) / 1000)));
      
      // Súper Miércoles: Jugada principal (ID 2) da 4%
      if (isWednesday && isPriority) {
        baseReturn = 0.04;
      }

      return {
        id: tpl.id,
        name: tpl.name, 
        icon: tpl.icon,
        baseReturn: baseReturn,
        color: tpl.color,
        fakeVolume: `${(400 + (daySeed % 500))}K`,
        market: market
      } as Sport;
    });
  }, []);

  const showNotification = (message: string | undefined | null, type: NotificationType = 'info') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message: message || 'Procesando...', type }]);
    setTimeout(() => removeNotification(id), 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string) => {
    const uClean = username.toLowerCase().trim();
    const pClean = password?.trim();

    if (isRegisterMode) {
      const { data: existing } = await supabase.from('users').select('id').eq('username', uClean).maybeSingle();
      if (existing) return { success: false, message: "Este usuario ya existe." };

      const newUser = {
        username: uClean,
        password: pClean || '123456',
        balance: 0,
        total_recharge: 0,
        pending_commissions: 0,
        vip_level: 0,
        referral_code: 'HND-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        referred_by: referredBy || '',
        registration_date: new Date().toISOString(),
        role: uClean === 'admin' ? 'admin' : 'user',
        is_blocked: false,
        active_bet: null
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select().single();
      if (error) return { success: false, message: "Error al registrar en la nube." };
      
      const mapped = mapDbUser(data);
      setUser(mapped);
      localStorage.setItem('elite_session_id', mapped.id);
      fetchData();
      return { success: true, message: "¡Registro exitoso en la nube!" };
    } else {
      const { data, error } = await supabase.from('users').select('*').eq('username', uClean).maybeSingle();
      if (!data) return { success: false, message: "Usuario no encontrado." };
      if (data.password !== pClean) return { success: false, message: "Contraseña incorrecta." };
      if (data.is_blocked) return { success: false, message: "Cuenta bloqueada por seguridad." };

      const mapped = mapDbUser(data);
      setUser(mapped);
      localStorage.setItem('elite_session_id', mapped.id);
      return { success: true, message: `Bienvenido de nuevo, ${mapped.username}.` };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elite_session_id');
  };

  const recharge = async (amount: number, proofData?: string) => {
    if (!user) return;
    const tx = {
      user_id: user.id,
      username: user.username,
      type: 'recharge',
      amount,
      status: 'pending',
      date: new Date().toISOString(),
      description: 'Recarga Capital',
      proof_data: proofData
    };
    await supabase.from('transactions').insert([tx]);
    showNotification("Depósito enviado. Revisión en curso.", "success");
    fetchData();
  };

  const withdraw = async (amount: number) => {
    if (!user) return { success: false, message: "Error de sesión." };
    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };

    const newBalance = user.balance - amount;
    const tx = {
      user_id: user.id,
      username: user.username,
      type: 'withdraw',
      amount,
      status: 'pending',
      date: new Date().toISOString(),
      description: 'Retiro Nexus',
      wallet_address: user.withdrawalAddress
    };

    await supabase.from('transactions').insert([tx]);
    await adminUpdateUser(user.id, { balance: newBalance });
    fetchData();
    return { success: true, message: "Retiro enviado a auditoría." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string, market: string) => {
    if (!user || user.activeBet) return;
    const profit = (amount * percent) / 100;
    const endTime = new Date(Date.now() + 2400000).toISOString();
    const activeBet = { amount, sportId, startTime: new Date().toISOString(), endTime, potentialProfit: profit, market };

    const newBalance = user.balance - amount;
    const tx = {
      user_id: user.id,
      username: user.username,
      type: 'bet',
      amount,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Ciclo: ${market}`
    };

    await supabase.from('transactions').insert([tx]);
    await adminUpdateUser(user.id, { balance: newBalance, activeBet });
    fetchData();
  };

  const adminUpdateTransaction = async (id: string, status: 'completed' | 'rejected') => {
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (tx && tx.status === 'pending') {
      await supabase.from('transactions').update({ status }).eq('id', id);
      
      if (status === 'completed' && tx.type === 'recharge') {
        const { data: targetUserDb } = await supabase.from('users').select('*').eq('id', tx.user_id).single();
        if (targetUserDb) {
          const targetUser = mapDbUser(targetUserDb);
          
          // Lógica de Bono Miércoles
          const rechargeDate = new Date(tx.date);
          const isWednesday = rechargeDate.getDay() === 3;
          const bonusFromWednesday = isWednesday ? (tx.amount * WEDNESDAY_SUPER_RECHARGE_BONUS) : 0;

          const newTotal = (targetUser.totalRecharge || 0) + tx.amount;
          let newVIP = 0;
          for (const v of [...VIP_LEVELS].sort((a,b) => a.minRecharge - b.minRecharge)) {
            if (newTotal >= v.minRecharge) newVIP = v.id;
          }
          
          let vipAscensionBonus = (newVIP > targetUser.vipLevel) ? VIP_LEVELS[newVIP].bonus : 0;
          
          await adminUpdateUser(targetUser.id, { 
            balance: targetUser.balance + tx.amount + vipAscensionBonus + bonusFromWednesday, 
            totalRecharge: newTotal,
            vipLevel: newVIP
          });
        }
      }
      fetchData();
    }
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    const dbData: any = {};
    if (data.username !== undefined) dbData.username = data.username;
    if (data.password !== undefined) dbData.password = data.password;
    if (data.balance !== undefined) dbData.balance = data.balance;
    if (data.totalRecharge !== undefined) dbData.total_recharge = data.totalRecharge;
    if (data.vipLevel !== undefined) dbData.vip_level = data.vipLevel;
    if (data.pendingCommissions !== undefined) dbData.pending_commissions = data.pendingCommissions;
    if (data.activeBet !== undefined) dbData.active_bet = data.activeBet;
    if (data.withdrawalAddress !== undefined) dbData.withdrawal_address = data.withdrawalAddress;
    if (data.isBlocked !== undefined) dbData.is_blocked = data.isBlocked;
    if (data.role !== undefined) dbData.role = data.role;

    await supabase.from('users').update(dbData).eq('id', userId);
    fetchData();
  };

  const processWeeklyCommissions = async () => {
    allUsers.forEach(async u => {
      if (u.pendingCommissions > 0) {
        await adminUpdateUser(u.id, { balance: u.balance + u.pendingCommissions, pendingCommissions: 0 });
      }
    });
    fetchData();
  };

  const saveWithdrawalAddress = async (address: string) => {
    if (user) await adminUpdateUser(user.id, { withdrawalAddress: address });
  };

  const addTransaction = async (tx: any) => {
    if (!user) return;
    await supabase.from('transactions').insert([{ ...tx, user_id: user.id, username: user.username, date: new Date().toISOString() }]);
    fetchData();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      allUsers.forEach(async u => {
        if (u.activeBet) {
          const endTime = new Date(u.activeBet.endTime).getTime();
          if (now >= endTime) {
            const profit = u.activeBet.potentialProfit;
            const total = u.activeBet.amount + profit;
            
            await adminUpdateUser(u.id, { balance: u.balance + total, activeBet: null });
            await supabase.from('transactions').insert([{
              user_id: u.id,
              username: u.username,
              type: 'earning',
              amount: profit,
              status: 'completed',
              date: new Date().toISOString(),
              description: `Auditado: ${u.activeBet.market}`
            }]);
          }
        }
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [allUsers]);

  return (
    <AppContext.Provider value={{ 
      user, allUsers, allTransactions, dailySports, isLoading, setUser, addTransaction,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest, processWeeklyCommissions,
      adminUpdateTransaction, adminUpdateUser, showNotification, getDRTime
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto backdrop-blur-md shadow-2xl rounded-2xl p-4 min-w-[260px] border-l-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 bg-slate-900/95 border-amber-500 text-slate-100">
            <div className="flex-1 text-[10px] font-black uppercase tracking-widest leading-tight">{n.message}</div>
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
