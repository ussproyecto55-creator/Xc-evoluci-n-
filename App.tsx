
import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Bet } from './pages/Bet';
import { Team } from './pages/Team';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Recharge } from './pages/Recharge';
import { Withdraw } from './pages/Withdraw';
import { FinancialRecords } from './pages/FinancialRecords';
import { AdminPanel } from './pages/Admin';
import { VIPPage } from './pages/VIP';
import { PlaysPage } from './pages/Plays';

const MainApp: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />;
      case 'bet': return <Bet />;
      case 'plays': return <PlaysPage />;
      case 'team': return <Team />;
      case 'vip': return <VIPPage />;
      case 'profile': return <Profile />;
      case 'recharge': return <Recharge />;
      case 'withdraw': return <Withdraw />;
      case 'records': return <FinancialRecords />;
      case 'admin': return <AdminPanel />;
      default: return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      username={user.username} 
      balance={user.balance}
      isAdmin={user.role === 'admin'}
    >
      {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
