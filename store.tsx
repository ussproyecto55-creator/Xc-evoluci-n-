
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, TeamMember } from './types';
import { VIP_LEVELS } from './constants';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  team: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  login: (username: string, referredBy?: string) => void;
  logout: () => void;
  recharge: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  saveWithdrawalAddress: (address: string) => void;
  applyCompoundInterest: (amount: number, percent: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const login = (username: string, referredBy?: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      balance: 0,
      totalRecharge: 0,
      vipLevel: 0,
      referralCode: 'NEXUS-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      referredBy,
      registrationDate: new Date().toISOString(),
      monthlyWithdrawalCount: 0,
    };
    setUser(newUser);
  };

  const logout = () => setUser(null);

  const saveWithdrawalAddress = (address: string) => {
    setUser(prev => prev ? { ...prev, withdrawalAddress: address } : null);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'pending', // Por defecto todas empiezan en pendiente
    };
    
    // Auto-completar ganancias y bonos para la simulación
    if (tx.type === 'earning' || tx.type === 'rebate' || tx.type === 'bonus') {
      newTx.status = 'completed';
    }

    setTransactions(prev => [newTx, ...prev]);
  };

  const recharge = (amount: number) => {
    if (!user) return;
    
    if (amount < 10) {
      alert("La inversión mínima inicial es de 10 USDT.");
      return;
    }

    const isWednesday = new Date().getDay() === 3;
    const bonusMultiplier = isWednesday ? 0.06 : 0;
    const isFirstRecharge = user.totalRecharge === 0;
    const firstBonusMultiplier = isFirstRecharge ? 0.03 : 0;
    const totalBonus = amount * (bonusMultiplier + firstBonusMultiplier);
    
    // El balance se actualiza pero la transacción queda pendiente hasta que un "admin" la apruebe (simulado)
    // Para esta simulación, la aprobaremos a los 5 segundos
    addTransaction({
      type: 'recharge',
      amount,
      description: `Recarga USDT ${isWednesday ? '+6% Bono Miércoles' : ''} ${isFirstRecharge ? '+3% Bono Bienvenida' : ''}`
    });

    setTimeout(() => {
      setUser(prev => {
        if (!prev) return null;
        const newTotalRecharge = prev.totalRecharge + amount;
        let newVIP = 0;
        for (const v of [...VIP_LEVELS].reverse()) {
          if (newTotalRecharge >= v.minRecharge) {
            newVIP = v.id;
            break;
          }
        }
        return {
          ...prev,
          balance: prev.balance + amount + totalBonus,
          totalRecharge: newTotalRecharge,
          vipLevel: newVIP
        };
      });
      
      setTransactions(prev => prev.map(t => t.type === 'recharge' && t.status === 'pending' ? {...t, status: 'completed'} : t));

      if (totalBonus > 0) {
        addTransaction({
          type: 'bonus',
          amount: totalBonus,
          description: 'Bono de Recarga'
        });
      }
    }, 5000);
  };

  const withdraw = (amount: number): boolean => {
    if (!user) return false;
    const currentVIP = VIP_LEVELS[user.vipLevel];
    
    if (user.vipLevel === 0) {
      alert("Debes ser al menos VIP 1 para retirar.");
      return false;
    }

    if (amount < 10) {
      alert("El monto mínimo de retiro es de 10 USDT.");
      return false;
    }

    if (user.monthlyWithdrawalCount >= currentVIP.withdrawalsPerMonth) {
      alert(`Límite mensual alcanzado (${currentVIP.withdrawalsPerMonth}).`);
      return false;
    }

    const regDate = new Date(user.registrationDate);
    const now = new Date();
    if ((now.getTime() - regDate.getTime()) / (1000 * 60 * 60) < 24) {
      alert("Debes esperar 24 horas después del registro para retirar tu capital.");
      return false;
    }

    if (user.balance < amount) {
      alert("Saldo insuficiente.");
      return false;
    }

    setUser(prev => prev ? {
      ...prev,
      balance: prev.balance - amount,
      monthlyWithdrawalCount: prev.monthlyWithdrawalCount + 1,
    } : null);

    addTransaction({
      type: 'withdraw',
      amount: amount,
      description: `Retiro solicitado (Comisión ${currentVIP.commission}%)`
    });

    return true;
  };

  const applyCompoundInterest = (amount: number, percent: number) => {
    if (!user) return;
    const profit = (amount * percent) / 100;
    
    setUser(prev => prev ? {
      ...prev,
      balance: prev.balance + profit
    } : null);

    addTransaction({
      type: 'earning',
      amount: profit,
      description: `Ganancia deportiva (${percent}%)`
    });
  };

  const addTeamMember = (member: TeamMember) => {
    setTeam(prev => [...prev, member]);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, transactions, addTransaction, team, addTeamMember,
      login, logout, recharge, withdraw, saveWithdrawalAddress, applyCompoundInterest
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
