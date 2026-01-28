
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

export const SPORT_TEMPLATES = [
  { id: '1', name: 'Baseball', icon: '⚾', color: 'from-blue-600 to-blue-800', baseReturn: 0.015, teams: ['NY Yankees', 'LA Dodgers', 'Boston Red Sox', 'Houston Astros', 'Chicago Cubs', 'Atlanta Braves'] },
  { id: '2', name: 'Football', icon: '🏈', color: 'from-orange-600 to-orange-800', baseReturn: 0.012, teams: ['KC Chiefs', 'SF 49ers', 'Dallas Cowboys', 'Philly Eagles', 'Buffalo Bills', 'Miami Dolphins'] },
  { id: '3', name: 'Soccer', icon: '⚽', color: 'from-green-600 to-green-800', baseReturn: 0.018, teams: ['Real Madrid', 'Man City', 'PSG', 'FC Barcelona', 'Bayern Munich', 'Liverpool FC'] },
  { id: '4', name: 'Basketball', icon: '🏀', color: 'from-purple-600 to-purple-800', baseReturn: 0.014, teams: ['LA Lakers', 'GS Warriors', 'Boston Celtics', 'Miami Heat', 'Phoenix Suns', 'Milwaukee Bucks'] },
  { id: '5', name: 'Tennis', icon: '🎾', color: 'from-yellow-500 to-yellow-700', baseReturn: 0.011, teams: ['Novak Djokovic', 'Carlos Alcaraz', 'Jannik Sinner', 'Daniil Medvedev', 'Rafa Nadal', 'Alexander Zverev'] },
];

export const TEAM_REBATES = {
  LEVEL_1: 0.07,
  LEVEL_2: 0.03,
  LEVEL_3: 0.02,
};

export const REFERRAL_COMMISSION = {
  LEVEL_1: 0.08,
  LEVEL_2: 0.03,
  LEVEL_3: 0.01,
};

export const FIRST_RECHARGE_BONUS = 0.03;

export const BUSINESS_HOURS = {
  BET: { START: 11, END: 16 },
  RECHARGE: { START: 0, END: 24 },
  WITHDRAW: { START: 0, END: 24 }
};

export const ARRIVAL_TIMES = {
  RECHARGE: "máximo 1 hora",
  WITHDRAW: "máximo 24 horas"
};
