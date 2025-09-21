
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import Card from './common/Card';
import { RecommendationsIcon } from './icons/NavIcons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DashboardProps {
  transactions: Transaction[];
  recommendations: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, recommendations }) => {
  const { totalRevenue, totalExpenses, netProfit, transactionCount } = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    
    transactions.forEach(t => {
      if (t.type === 'revenue') {
        totalRevenue += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (transactions.length < 2) return []; // Need at least some data for a line

    const monthlyData: { [key: string]: number } = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += t.type === 'revenue' ? t.amount : -t.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    if (sortedMonths.length === 0) return [];

    const historicalData: any[] = sortedMonths.map(monthYear => {
      const [year, month] = monthYear.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
      return {
        name: `${monthName} ${year}`,
        'Actual Profit': monthlyData[monthYear],
      };
    });

    // Prediction logic
    const lastDataPoint = historicalData[historicalData.length - 1];
    let lastProfit = lastDataPoint['Actual Profit'] > 0 ? lastDataPoint['Actual Profit'] : 100;
    const [lastYear, lastMonth] = sortedMonths[sortedMonths.length - 1].split('-').map(Number);
    let lastDate = new Date(lastYear, lastMonth - 1);
    
    // Connect prediction line to actual data
    lastDataPoint['Predicted Profit'] = lastDataPoint['Actual Profit'];

    const predictionData = [];
    for (let i = 1; i <= 3; i++) {
        lastDate.setMonth(lastDate.getMonth() + 1);
        lastProfit *= 1.05; // 5% growth
        
        const monthName = lastDate.toLocaleString('default', { month: 'short' });
        const year = lastDate.getFullYear();
        
        predictionData.push({
            name: `${monthName} ${year}`,
            'Predicted Profit': Math.round(lastProfit),
        });
    }

    return [...historicalData, ...predictionData];
  }, [transactions]);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-subtle">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-subtle">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-subtle">Net Profit</h3>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
            ${netProfit.toLocaleString()}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-subtle">Total Transactions</h3>
          <p className="text-3xl font-bold">{transactionCount}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Profit Modeling</h2>
        {chartData.length > 0 ? (
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="Actual Profit" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="Predicted Profit" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 6 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-subtle">Add more transactions to build your profit model.</p>
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <ul className="space-y-3">
              {recentTransactions.map(t => (
                <li key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-subtle">{t.date}</p>
                  </div>
                  <p className={`font-semibold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-subtle text-center py-4">No transactions yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Quick Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                 <li key={index} className="flex items-start p-2">
                    <div className="flex-shrink-0 text-primary pt-1">
                        <RecommendationsIcon />
                    </div>
                    <p className="ml-3 text-on-surface">{rec}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-subtle text-center py-4">Generate AI recommendations from the 'AI Recommendations' page.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;