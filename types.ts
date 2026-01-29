
export type VIPLevel = {
  id: number;
  name: string;
  minRecharge: number;
  withdrawalsPerMonth: number;
  commission: number;
  color: string;
  bonus: number; // Bono por subir de nivel
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
  proofData?: string; // Base64 de la imagen del comprobante
};

export type ActiveBet = {
  amount: number;
  sportId: string;
  startTime: string;
  endTime: string;
  potentialProfit: number;
};

export type BetRecord = {
  id: string;
  userId: string;
  sportId: string;
  sportName: string;
  sportIcon: string;
  amount: number;
  profit: number;
  date: string;
  status: 'completed' | 'auditing';
};

export type User = {
  id: string;
  username: string;
  password?: string;
  balance: number;
  totalRecharge: number;
  pendingCommissions: number; // Comisiones de red acumuladas para el lunes
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  registrationDate: string;
  lastWithdrawalDate?: string;
  lastBetDate?: string; // Fecha de la última apuesta realizada
  activeBet?: ActiveBet | null; // Seguimiento de la apuesta en curso
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
  fakeVolume: string; // Volumen de liquidez simulado
};

export type TeamMember = {
  username: string;
  level: 1 | 2 | 3;
  recharged: boolean;
  totalRecharge: number;
  registrationDate: string;
  hasBetToday: boolean;
};
