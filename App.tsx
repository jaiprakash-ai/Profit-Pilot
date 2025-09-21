
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Correctly import types from the now-fixed types.ts file.
import { Page, Transaction, Invoice } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recommendations from './components/Recommendations';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import Invoices from './components/Invoices';
import Reports from './components/Reports';
// Fix: Add import for BusinessIntelligence component.
import BusinessIntelligence from './components/BusinessIntelligence';
import { MenuIcon } from './components/icons/NavIcons';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Fix: Update mock data to provide a richer default experience.
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'revenue', description: 'Website Design Project', amount: 2500, date: '2023-10-15' },
    { id: 2, type: 'expense', description: 'Software Subscription', amount: 50, date: '2023-10-20' },
    { id: 3, type: 'revenue', description: 'Consulting Services', amount: 1200, date: '2023-11-05' },
    { id: 4, type: 'expense', description: 'Office Supplies', amount: 150, date: '2023-11-10' },
    { id: 5, type: 'revenue', description: 'E-commerce Sales', amount: 3200, date: '2023-11-25' },
    { id: 6, type: 'expense', description: 'Marketing Campaign', amount: 500, date: '2023-12-01' },
    { id: 7, type: 'revenue', description: 'Website Design Project', amount: 2800, date: '2024-01-15' },
    { id: 8, type: 'expense', description: 'Software Subscription', amount: 50, date: '2024-01-20' },
    { id: 9, type: 'revenue', description: 'Consulting Services', amount: 1500, date: '2024-02-05' },
    { id: 10, type: 'expense', description: 'Office Supplies', amount: 120, date: '2024-02-10' },
    { id: 11, type: 'revenue', description: 'E-commerce Sales', amount: 3500, date: '2024-02-25' },
    { id: 12, type: 'expense', description: 'Marketing Campaign', amount: 550, date: '2024-03-01' },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now() }]);
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'number'>) => {
    setInvoices(prev => [...prev, { ...invoice, id: Date.now(), number: `INV-${1001 + prev.length}` }]);
  };

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard transactions={transactions} recommendations={recommendations} />;
      case Page.Transactions:
        return <Transactions transactions={transactions} addTransaction={addTransaction} />;
      case Page.Recommendations:
        return <Recommendations transactions={transactions} recommendations={recommendations} setRecommendations={setRecommendations} />;
      case Page.CompetitorAnalysis:
        return <CompetitorAnalysis analysis={competitorAnalysis} setAnalysis={setCompetitorAnalysis} />;
      case Page.Invoices:
        return <Invoices invoices={invoices} addInvoice={addInvoice} />;
      case Page.Reports:
        return <Reports transactions={transactions} />;
      // Fix: Add case for rendering the BusinessIntelligence page.
      case Page.BusinessIntelligence:
        return <BusinessIntelligence transactions={transactions} />;
      default:
        return <Dashboard transactions={transactions} recommendations={recommendations} />;
    }
  };
  
  const pageTitle = useMemo(() => {
    return activePage;
  }, [activePage]);

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

       {/* Backdrop for mobile */}
       {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-surface border-b border-slate-200 p-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                className="md:hidden text-slate-500 hover:text-primary"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation menu"
              >
                <MenuIcon />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-on-surface">{pageTitle}</h1>
           </div>
           <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-subtle">Jane Doe</span>
              <img src="https://picsum.photos/40" alt="User Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;