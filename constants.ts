
import { VIPLevel, Sport } from './types';

export const VIP_LEVELS: VIPLevel[] = [
  { id: 0, name: 'Sin VIP', minRecharge: 0, withdrawalsPerMonth: 0, commission: 10, color: 'bg-slate-500' },
  { id: 1, name: 'VIP 1', minRecharge: 10, withdrawalsPerMonth: 1, commission: 10, color: 'bg-blue-500' },
  { id: 2, name: 'VIP 2', minRecharge: 50, withdrawalsPerMonth: 2, commission: 9, color: 'bg-green-500' },
  { id: 3, name: 'VIP 3', minRecharge: 200, withdrawalsPerMonth: 3, commission: 8, color: 'bg-purple-500' },
  { id: 4, name: 'VIP 4', minRecharge: 500, withdrawalsPerMonth: 5, commission: 7, color: 'bg-pink-500' },
  { id: 5, name: 'VIP 5', minRecharge: 1200, withdrawalsPerMonth: 7, commission: 6, color: 'bg-orange-500' },
  { id: 6, name: 'VIP 6', minRecharge: 2500, withdrawalsPerMonth: 8, commission: 5, color: 'bg-red-500' },
  { id: 7, name: 'VIP 7', minRecharge: 4500, withdrawalsPerMonth: 10, commission: 4, color: 'bg-yellow-500' },
];

export const SPORTS: Sport[] = [
  { id: '1', name: 'Baseball', icon: '⚾', baseReturn: 0.025, color: 'from-blue-600 to-blue-800' },
  { id: '2', name: 'Football', icon: '🏈', baseReturn: 0.018, color: 'from-orange-600 to-orange-800' },
  { id: '3', name: 'Soccer', icon: '⚽', baseReturn: 0.021, color: 'from-green-600 to-green-800' },
  { id: '4', name: 'Tennis', icon: '🎾', baseReturn: 0.015, color: 'from-yellow-500 to-yellow-700' },
  { id: '5', name: 'Golf', icon: '⛳', baseReturn: 0.012, color: 'from-emerald-500 to-emerald-700' },
];

export const TEAM_REBATES = {
  LEVEL_1: 0.07, 
  LEVEL_2: 0.03,
  LEVEL_3: 0.01,
};

export const REFERRAL_COMMISSION = {
  LEVEL_1: 0.08, 
  LEVEL_2: 0.03,
  LEVEL_3: 0.01,
};
