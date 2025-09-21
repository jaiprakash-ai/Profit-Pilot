import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'revenue' | 'expense'>('expense');
  
  // State for filters
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description || !date || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please fill out all fields and enter a valid, positive amount.');
      return;
    }
    addTransaction({ description, amount: parsedAmount, date, type });
    setDescription('');
    setAmount('');
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
      })
      .filter(t => {
        if (!filterStartDate && !filterEndDate) return true;
        const transactionDate = new Date(t.date);
        
        if (filterStartDate && transactionDate < new Date(filterStartDate)) {
            return false;
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end day
            if(transactionDate > endDate) return false;
        }
        return true;
      });
  }, [transactions, filterType, filterStartDate, filterEndDate]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const hasActiveFilters = filterType !== 'all' || filterStartDate !== '' || filterEndDate !== '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Description" id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Input label="Amount" id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="any" placeholder="0.00" />
            <Input label="Date" id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'revenue' | 'expense')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <option value="expense">Expense</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Add Transaction</Button>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          
          {/* Filter Controls */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1">
              <label htmlFor="filterType" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <option value="all">All</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="w-full md:flex-1">
                <Input label="Start Date" id="startDate" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>
            <div className="w-full md:flex-1">
                <Input label="End Date" id="endDate" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
            <div className="w-full md:w-auto">
              <Button onClick={resetFilters} className="w-full bg-slate-600 hover:bg-slate-700 text-white !py-2">Reset</Button>
            </div>
          </div>

          {/* Mobile View: List of Cards */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.length > 0 ? [...filteredTransactions].reverse().map(t => (
              <div key={t.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate pr-2">{t.description}</p>
                  <p className={`font-semibold shrink-0 ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-subtle mt-1">{t.date}</p>
              </div>
            )) : <p className="text-subtle text-center py-4">{hasActiveFilters ? 'No transactions match your filters.' : 'No transactions yet.'}</p>}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block">
             {filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                        <th className="p-2">Date</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...filteredTransactions].reverse().map(t => (
                        <tr key={t.id} className="border-b hover:bg-slate-50">
                            <td className="p-2 text-subtle">{t.date}</td>
                            <td className="p-2">{t.description}</td>
                            <td className={`p-2 text-right font-medium ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             ) : <p className="text-subtle text-center py-4">{hasActiveFilters ? 'No transactions match your filters.' : 'No transactions yet.'}</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;