
import { VIPLevel, Sport } from './types';

export const VIP_LEVELS: VIPLevel[] = [
  { id: 0, name: 'Sin VIP', minRecharge: 0, withdrawalsPerMonth: 0, commission: 10, color: 'bg-slate-500', bonus: 0 },
  { id: 1, name: 'VIP 1', minRecharge: 10, withdrawalsPerMonth: 1, commission: 10, color: 'bg-blue-500', bonus: 1 },
  { id: 2, name: 'VIP 2', minRecharge: 50, withdrawalsPerMonth: 2, commission: 9, color: 'bg-green-500', bonus: 2.5 },
  { id: 3, name: 'VIP 3', minRecharge: 200, withdrawalsPerMonth: 3, commission: 8, color: 'bg-purple-500', bonus: 5 },
  { id: 4, name: 'VIP 4', minRecharge: 500, withdrawalsPerMonth: 5, commission: 7, color: 'bg-pink-500', bonus: 13 },
  { id: 5, name: 'VIP 5', minRecharge: 1200, withdrawalsPerMonth: 7, commission: 6, color: 'bg-orange-500', bonus: 30 },
  { id: 6, name: 'VIP 6', minRecharge: 2500, withdrawalsPerMonth: 8, commission: 5, color: 'bg-red-500', bonus: 75 },
  { id: 7, name: 'VIP 7', minRecharge: 4500, withdrawalsPerMonth: 10, commission: 4, color: 'bg-yellow-500', bonus: 135 },
];

export const SPORTS: Sport[] = [
  { id: '1', name: 'Baseball', icon: '⚾', baseReturn: 0.025, color: 'from-blue-600 to-blue-800', fakeVolume: '1.42M' },
  { id: '2', name: 'Football', icon: '🏈', baseReturn: 0.025, color: 'from-orange-600 to-orange-800', fakeVolume: '940K' },
  { id: '3', name: 'Soccer', icon: '⚽', baseReturn: 0.025, color: 'from-green-600 to-green-800', fakeVolume: '2.15M' },
  { id: '4', name: 'Tennis', icon: '🎾', baseReturn: 0.025, color: 'from-yellow-500 to-yellow-700', fakeVolume: '620K' },
  { id: '5', name: 'Golf', icon: '⛳', baseReturn: 0.025, color: 'from-emerald-500 to-emerald-700', fakeVolume: '315K' },
];

export const TEAM_REBATES = {
  LEVEL_1: 0.07, // 7% de las ganancias del referido
  LEVEL_2: 0.03, // 3%
  LEVEL_3: 0.02, // 2%
};

export const REFERRAL_COMMISSION = {
  LEVEL_1: 0.08, // 8% de la recarga
  LEVEL_2: 0.03, // 3%
  LEVEL_3: 0.01, // 1%
};

export const FIRST_RECHARGE_BONUS = 0.03; // 3% bono primera recarga

// Horarios de Operación
export const BUSINESS_HOURS = {
  BET: { START: 11, END: 16 }, // 11 AM - 4 PM
  RECHARGE: { START: 0, END: 24 }, // 24/7
  WITHDRAW: { START: 0, END: 24 }  // 24/7
};

export const ARRIVAL_TIMES = {
  RECHARGE: "máximo 1 hora",
  WITHDRAW: "máximo 24 horas"
};
