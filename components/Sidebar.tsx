import React from 'react';
import { Page } from '../types';
import { ProfitPilotIcon } from './icons/ProfitPilotIcon';
import { DashboardIcon, TransactionsIcon, RecommendationsIcon, CompetitorIcon, InvoicesIcon, EmailIcon, BusinessIntelligenceIcon } from './icons/NavIcons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const navItems = [
    { id: Page.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: Page.Transactions, label: 'Transactions', icon: <TransactionsIcon /> },
    { id: Page.Invoices, label: 'Invoices', icon: <InvoicesIcon /> },
    { id: Page.Recommendations, label: 'AI Recommendations', icon: <RecommendationsIcon /> },
    { id: Page.CompetitorAnalysis, label: 'Competitor Analysis', icon: <CompetitorIcon /> },
    { id: Page.BusinessIntelligence, label: 'Business Intelligence', icon: <BusinessIntelligenceIcon /> },
    { id: Page.Reports, label: 'Email AI Reports', icon: <EmailIcon /> },
  ];

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <aside className={`w-64 bg-surface border-r border-slate-200 flex flex-col p-4 fixed md:static md:translate-x-0 inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <ProfitPilotIcon className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-on-surface">Profit Pilot</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activePage === item.id}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;