
import { VIPLevel, Sport } from './types';

export const VIP_LEVELS: VIPLevel[] = [
  { id: 0, name: 'Sin VIP', minRecharge: 0, withdrawalsPerMonth: 0, commission: 10, color: 'bg-slate-500', bonus: 0 },
  { id: 1, name: 'VIP 1', minRecharge: 10, withdrawalsPerMonth: 3, commission: 10, color: 'bg-blue-500', bonus: 1 },
  { id: 2, name: 'VIP 2', minRecharge: 50, withdrawalsPerMonth: 4, commission: 9, color: 'bg-green-500', bonus: 2.5 },
  { id: 3, name: 'VIP 3', minRecharge: 200, withdrawalsPerMonth: 5, commission: 8, color: 'bg-purple-500', bonus: 5 },
  { id: 4, name: 'VIP 4', minRecharge: 500, withdrawalsPerMonth: 6, commission: 7, color: 'bg-pink-500', bonus: 13 },
  { id: 5, name: 'VIP 5', minRecharge: 1200, withdrawalsPerMonth: 7, commission: 6, color: 'bg-orange-500', bonus: 30 },
  { id: 6, name: 'VIP 6', minRecharge: 2500, withdrawalsPerMonth: 8, commission: 5, color: 'bg-red-500', bonus: 75 },
  { id: 7, name: 'VIP 7', minRecharge: 4500, withdrawalsPerMonth: 10, commission: 4, color: 'bg-yellow-500', bonus: 135 },
];

export const SPORT_TEMPLATES = [
  { 
    id: '1', 
    name: 'Champions League', 
    icon: '⚽', 
    color: 'from-blue-600 to-blue-900', 
    baseReturn: 0.015, 
    markets: ['Inverso 3-3', 'Inverso 4-4', 'Inverso 0-4']
  },
  { 
    id: '2', 
    name: 'MLB Baseball', 
    icon: '⚾', 
    color: 'from-blue-400 to-blue-700', 
    baseReturn: 0.025, 
    markets: ['Inverso 0-12', 'Inverso 15+ Runs', 'Inverso 1-11']
  },
  { 
    id: '3', 
    name: 'NBA Basketball', 
    icon: '🏀', 
    color: 'from-orange-500 to-red-700', 
    baseReturn: 0.018, 
    markets: ['Inverso 135-135', 'Inverso 90-140', 'Inverso 120-120']
  },
  { 
    id: '4', 
    name: 'NFL American', 
    icon: '🏈', 
    color: 'from-green-700 to-blue-900', 
    baseReturn: 0.012, 
    markets: ['Inverso 3-3', 'Inverso 50-50', 'Inverso 0-45']
  },
  { 
    id: '5', 
    name: 'ATP Tennis', 
    icon: '🎾', 
    color: 'from-yellow-400 to-green-600', 
    baseReturn: 0.011, 
    markets: ['Inverso 0-3 Sets', 'Inverso 6-0 6-0', 'Inverso Retiro']
  },
];

export const TEAM_REBATES = { LEVEL_1: 0.07, LEVEL_2: 0.03, LEVEL_3: 0.02 };
export const REFERRAL_COMMISSION = { LEVEL_1: 0.08, LEVEL_2: 0.03, LEVEL_3: 0.01 };
export const FIRST_RECHARGE_BONUS = 0.03;
export const WEDNESDAY_SUPER_RECHARGE_BONUS = 0.06;

export const BUSINESS_HOURS = {
  BET: { START: 11, END: 19 },
  RECHARGE: { START: 0, END: 24 },
  WITHDRAW: { START: 19, END: 21 } 
};

export const MIN_WITHDRAW_AMOUNT = 2.5;
export const ARRIVAL_TIMES = { RECHARGE: "máximo 1 hora", WITHDRAW: "máximo 24 horas" };
