
import React, { useState } from 'react';
import { Transaction } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { getFinancialRecommendations } from '../services/geminiService';
import { RecommendationsIcon } from './icons/NavIcons';

interface RecommendationsProps {
  transactions: Transaction[];
  recommendations: string[];
  setRecommendations: (recommendations: string[]) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ transactions, recommendations, setRecommendations }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getFinancialRecommendations(transactions);
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI Financial Recommendations</h2>
        <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading}>
          Generate New Recommendations
        </Button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {recommendations.length > 0 ? (
        <ul className="space-y-4">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start p-4 bg-primary/5 rounded-lg">
              <div className="flex-shrink-0 text-primary pt-1">
                <RecommendationsIcon />
              </div>
              <p className="ml-4 text-on-surface">{rec}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <p className="text-subtle">Click the button to generate AI-powered recommendations based on your financial data.</p>
        </div>
      )}
    </Card>
  );
};

export default Recommendations;
