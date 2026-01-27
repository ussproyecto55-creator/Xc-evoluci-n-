
export type VIPLevel = {
  id: number;
  name: string;
  minRecharge: number;
  withdrawalsPerMonth: number;
  commission: number;
  color: string;
};

export type Transaction = {
  id: string;
  type: 'recharge' | 'withdraw' | 'earning' | 'bonus' | 'rebate';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  description: string;
};

export type User = {
  id: string;
  username: string;
  balance: number;
  totalRecharge: number;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  registrationDate: string;
  lastWithdrawalDate?: string;
  monthlyWithdrawalCount: number;
  withdrawalAddress?: string; // Nueva propiedad
};

export type Sport = {
  id: string;
  name: string;
  icon: string;
  baseReturn: number;
  color: string;
};

export type TeamMember = {
  username: string;
  level: 1 | 2 | 3;
  recharged: boolean;
  totalRecharge: number;
  registrationDate: string;
};
