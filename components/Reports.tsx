import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { Transaction } from '../types';
import { generateFinancialReport } from '../services/geminiService';

interface ReportsProps {
    transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSendReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // In a real app, this would call a backend to send an email.
            // Here, we'll just generate the report and show a success message.
            const reportContent = await generateFinancialReport(transactions);
            console.log("Generated Report:\n", reportContent);
            
            setSuccessMessage(`A new AI-powered weekly report has been sent to ${email}.`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold mb-2">Automated AI Reports</h2>
                <p className="text-subtle mb-6">
                    Get a weekly summary of your business's financial health, including key insights and risks, delivered directly to your inbox.
                </p>

                <form onSubmit={handleSendReport} className="space-y-4">
                    <Input 
                        label="Email Address"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <Button type="submit" isLoading={isLoading} disabled={isLoading || transactions.length === 0} className="w-full">
                        {transactions.length === 0 ? 'Add Transactions to Enable' : 'Send Weekly Report'}
                    </Button>
                </form>

                {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
                
                {successMessage && <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">{successMessage}</div>}

            </Card>
        </div>
    );
};

export default Reports;