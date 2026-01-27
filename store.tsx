
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, TeamMember, ActiveBet } from './types';
import { VIP_LEVELS, REFERRAL_COMMISSION, TEAM_REBATES, FIRST_RECHARGE_BONUS, SPORTS } from './constants';
import { supabase } from './lib/supabase';

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
  // Admin functions
  adminUpdateTransaction: (id: string, status: 'completed' | 'rejected') => Promise<void>;
  adminUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialización: Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (usersError) throw usersError;
        setAllUsers(usersData || []);

        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (txError) throw txError;
        setAllTransactions(txData || []);
      } catch (err) {
        console.error("Error al cargar datos de Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Suscripción en tiempo real
    const usersSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        setAllUsers(prev => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new as User];
          if (payload.eventType === 'UPDATE') return prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u);
          if (payload.eventType === 'DELETE') return prev.filter(u => u.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    const txSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        setAllTransactions(prev => {
          if (payload.eventType === 'INSERT') return [payload.new as Transaction, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t);
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(txSubscription);
    };
  }, []);

  // Sincronizar usuario actual si cambia en la lista global
  useEffect(() => {
    if (user) {
      const updatedUser = allUsers.find(u => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  }, [allUsers]);

  const processWeeklyCommissions = async () => {
    const updates = allUsers.filter(u => (u.pendingCommissions || 0) > 0).map(async (u) => {
      const amount = u.pendingCommissions;
      await addTransactionForUser(u.id, {
        type: 'rebate',
        amount,
        description: "Entrega semanal de dividendos de red (Lunes 12:00 PM)"
      });
      await adminUpdateUser(u.id, { balance: u.balance + amount, pendingCommissions: 0 });
    });
    await Promise.all(updates);
  };

  const login = async (username: string, password?: string, isRegisterMode?: boolean, referredBy?: string): Promise<{ success: boolean; message: string }> => {
    const usernameLower = username.toLowerCase().trim();
    const existingUser = allUsers.find(u => u.username === usernameLower);

    if (isRegisterMode) {
      if (existingUser) return { success: false, message: "El nombre de usuario ya existe." };
      
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

      const { error } = await supabase.from('users').insert([newUser]);
      if (error) return { success: false, message: "Error al registrar en la base de datos." };
      
      setUser(newUser);
      return { success: true, message: "Registro exitoso." };
    } else {
      if (!existingUser) return { success: false, message: "El usuario no existe. Regístrese primero." };
      if (existingUser.password !== password) return { success: false, message: "Contraseña incorrecta." };
      if (existingUser.isBlocked) return { success: false, message: "Cuenta bloqueada. Contacte a soporte." };
      
      setUser(existingUser);
      return { success: true, message: "Bienvenido." };
    }
  };

  const logout = () => setUser(null);

  const addTransactionForUser = async (userId: string, tx: Omit<Transaction, 'id' | 'date' | 'status' | 'userId' | 'username'>) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;
    
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      userId: targetUser.id,
      username: targetUser.username,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    await supabase.from('transactions').insert([newTx]);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status' | 'userId' | 'username'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.username,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    if (['earning', 'rebate', 'bonus', 'bet'].includes(tx.type)) {
      newTx.status = 'completed';
    }

    await supabase.from('transactions').insert([newTx]);
  };

  const payTeamCommissions = async (userId: string, rechargeAmount: number) => {
    const currentUser = allUsers.find(u => u.id === userId);
    if (!currentUser || !currentUser.referredBy) return;

    const upline1 = allUsers.find(u => u.referralCode === currentUser.referredBy);
    if (upline1) {
      const comm1 = rechargeAmount * REFERRAL_COMMISSION.LEVEL_1;
      await adminUpdateUser(upline1.id, { balance: upline1.balance + comm1 });
      await addTransactionForUser(upline1.id, {
        type: 'rebate',
        amount: comm1,
        description: `Comisión de recarga (Nivel 1): ${currentUser.username}`
      });

      if (upline1.referredBy) {
        const upline2 = allUsers.find(u => u.referralCode === upline1.referredBy);
        if (upline2) {
          const comm2 = rechargeAmount * REFERRAL_COMMISSION.LEVEL_2;
          await adminUpdateUser(upline2.id, { balance: upline2.balance + comm2 });
          await addTransactionForUser(upline2.id, {
            type: 'rebate',
            amount: comm2,
            description: `Comisión de recarga (Nivel 2): ${currentUser.username}`
          });

          if (upline2.referredBy) {
            const upline3 = allUsers.find(u => u.referralCode === upline2.referredBy);
            if (upline3) {
              const comm3 = rechargeAmount * REFERRAL_COMMISSION.LEVEL_3;
              await adminUpdateUser(upline3.id, { balance: upline3.balance + comm3 });
              await addTransactionForUser(upline3.id, {
                type: 'rebate',
                amount: comm3,
                description: `Comisión de recarga (Nivel 3): ${currentUser.username}`
              });
            }
          }
        }
      }
    }
  };

  const accumulateMondayRebates = async (userId: string, earningAmount: number) => {
    const currentUser = allUsers.find(u => u.id === userId);
    if (!currentUser || !currentUser.referredBy) return;

    const upline1 = allUsers.find(u => u.referralCode === currentUser.referredBy);
    if (upline1) {
      const rebate1 = earningAmount * TEAM_REBATES.LEVEL_1;
      await adminUpdateUser(upline1.id, { pendingCommissions: (upline1.pendingCommissions || 0) + rebate1 });

      if (upline1.referredBy) {
        const upline2 = allUsers.find(u => u.referralCode === upline1.referredBy);
        if (upline2) {
          const rebate2 = earningAmount * TEAM_REBATES.LEVEL_2;
          await adminUpdateUser(upline2.id, { pendingCommissions: (upline2.pendingCommissions || 0) + rebate2 });

          if (upline2.referredBy) {
            const upline3 = allUsers.find(u => u.referralCode === upline2.referredBy);
            if (upline3) {
              const rebate3 = earningAmount * TEAM_REBATES.LEVEL_3;
              await adminUpdateUser(upline3.id, { pendingCommissions: (upline3.pendingCommissions || 0) + rebate3 });
            }
          }
        }
      }
    }
  };

  const adminUpdateTransaction = async (id: string, status: 'completed' | 'rejected') => {
    const tx = allTransactions.find(t => t.id === id);
    if (!tx) return;

    if (status === 'completed' && tx.type === 'recharge' && tx.status === 'pending') {
      const targetUser = allUsers.find(u => u.id === tx.userId);
      if (targetUser) {
        const isFirstRecharge = targetUser.totalRecharge === 0;
        let bonusAmount = isFirstRecharge ? tx.amount * FIRST_RECHARGE_BONUS : 0;

        let newBalance = targetUser.balance + tx.amount + bonusAmount;
        let newTotalRecharge = targetUser.totalRecharge + tx.amount;
        
        let newVIP = 0;
        for (const v of [...VIP_LEVELS].reverse()) {
          if (newTotalRecharge >= v.minRecharge) {
            newVIP = v.id;
            break;
          }
        }

        let ascensionBonus = 0;
        if (newVIP > targetUser.vipLevel) {
          for (let i = targetUser.vipLevel + 1; i <= newVIP; i++) {
            ascensionBonus += VIP_LEVELS[i].bonus;
          }
          if (ascensionBonus > 0) {
            await addTransactionForUser(targetUser.id, {
              type: 'bonus',
              amount: ascensionBonus,
              description: `Bono por ascensión VIP (${targetUser.vipLevel} -> ${newVIP})`
            });
          }
        }

        await adminUpdateUser(targetUser.id, { 
          balance: newBalance + ascensionBonus, 
          totalRecharge: newTotalRecharge,
          vipLevel: newVIP
        });

        if (bonusAmount > 0) {
          await addTransactionForUser(targetUser.id, {
            type: 'bonus',
            amount: bonusAmount,
            description: `Bono bienvenida (3% Primera Recarga)`
          });
        }
        await payTeamCommissions(targetUser.id, tx.amount);
      }
    }
    
    if (status === 'rejected' && tx.type === 'withdraw' && tx.status === 'pending') {
      const targetUser = allUsers.find(u => u.id === tx.userId);
      if (targetUser) {
        await adminUpdateUser(targetUser.id, { balance: targetUser.balance + tx.amount });
      }
    }

    await supabase.from('transactions').update({ status }).eq('id', id);
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    const { error } = await supabase.from('users').update(data).eq('id', userId);
    if (error) console.error("Error al actualizar usuario:", error);
  };

  const recharge = async (amount: number, proofData?: string) => {
    await addTransaction({
      type: 'recharge',
      amount,
      description: `Solicitud de Recarga USDT`,
      proofData
    });
  };

  const withdraw = async (amount: number): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Sesión no válida" };
    
    const currentVIP = VIP_LEVELS[user.vipLevel];
    if (user.monthlyWithdrawalCount >= currentVIP.withdrawalsPerMonth) {
      return { 
        success: false, 
        message: `Límite de ${currentVIP.withdrawalsPerMonth} retiros mensuales alcanzado.` 
      };
    }

    if (user.balance < amount) return { success: false, message: "Saldo insuficiente." };

    const today = new Date().toDateString();
    const lastWithdrawal = user.lastWithdrawalDate ? new Date(user.lastWithdrawalDate).toDateString() : null;
    if (lastWithdrawal === today) return { success: false, message: "Solo 1 retiro cada 24 horas." };

    await adminUpdateUser(user.id, { 
      balance: user.balance - amount, 
      monthlyWithdrawalCount: (user.monthlyWithdrawalCount || 0) + 1,
      lastWithdrawalDate: new Date().toISOString()
    });

    await addTransaction({
      type: 'withdraw',
      amount,
      description: `Retiro solicitado`,
      walletAddress: user.withdrawalAddress
    });

    return { success: true, message: "Retiro solicitado correctamente." };
  };

  const applyCompoundInterest = async (amount: number, percent: number, sportId: string) => {
    if (!user) return;
    
    const profit = (amount * percent) / 100;
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 10000).toISOString();

    const activeBet: ActiveBet = {
      amount,
      sportId,
      startTime,
      endTime,
      potentialProfit: profit
    };

    await adminUpdateUser(user.id, { 
      balance: user.balance - amount,
      lastBetDate: startTime,
      activeBet
    });

    await addTransaction({
      type: 'bet',
      amount,
      description: `Inversión Deportiva`
    });

    setTimeout(async () => {
      const targetUser = allUsers.find(u => u.id === user.id);
      if (targetUser) {
        await adminUpdateUser(targetUser.id, { 
          balance: targetUser.balance + amount + profit,
          activeBet: null 
        });

        await addTransactionForUser(targetUser.id, {
          type: 'earning',
          amount: profit,
          description: `Ganancia Deportiva (+40 minutos)`
        });

        await accumulateMondayRebates(targetUser.id, profit);
      }
    }, 10000); 
  };

  const saveWithdrawalAddress = async (address: string) => {
    if (!user) return;
    await adminUpdateUser(user.id, { withdrawalAddress: address });
  };

  return (
    <AppContext.Provider value={{ 
      user, allUsers, allTransactions, isLoading, setUser, addTransaction,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest, processWeeklyCommissions,
      adminUpdateTransaction, adminUpdateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
