
export type VIPLevel = {
  id: number;
  name: string;
  minRecharge: number;
  withdrawalsPerMonth: number;
  commission: number;
  color: string;
  bonus: number;
};

export type Transaction = {
  id: string;
  userId: string;
  username: string;
  type: 'recharge' | 'withdraw' | 'earning' | 'bonus' | 'rebate' | 'bet';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  description: string;
  walletAddress?: string;
  proofData?: string;
};

export type ActiveBet = {
  amount: number;
  sportId: string;
  startTime: string;
  endTime: string;
  potentialProfit: number;
  market?: string; // Nuevo: El marcador inverso apostado
};

export type User = {
  id: string;
  username: string;
  password?: string;
  balance: number;
  totalRecharge: number;
  pendingCommissions: number;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  registrationDate: string;
  lastWithdrawalDate?: string;
  lastBetDate?: string;
  activeBet?: ActiveBet | null;
  monthlyWithdrawalCount: number;
  withdrawalAddress?: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
};

export type Sport = {
  id: string;
  name: string;
  icon: string;
  baseReturn: number;
  color: string;
  fakeVolume: string;
  market: string; // Nuevo: Marcador inverso sugerido
};

export type TeamMember = {
  username: string;
  level: 1 | 2 | 3;
  recharged: boolean;
  totalRecharge: number;
  registrationDate: string;
  hasBetToday: boolean;
};
