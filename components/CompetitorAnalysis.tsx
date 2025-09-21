
import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { getCompetitorAnalysis } from '../services/geminiService';
import { CompetitorAnalysisResponse, Competitor } from '../types';

interface CompetitorAnalysisProps {
  analysis: CompetitorAnalysisResponse | null;
  setAnalysis: (analysis: CompetitorAnalysisResponse | null) => void;
}

const CompetitorCard: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <Card className="bg-slate-50">
        <h3 className="text-xl font-bold text-primary mb-2">{competitor.name}</h3>
        <div className="space-y-3">
            <div>
                <h4 className="font-semibold text-on-surface">Pricing Strategy</h4>
                <p className="text-subtle">{competitor.pricing_strategy}</p>
            </div>
            <div>
                <h4 className="font-semibold text-on-surface">Marketing Strategy</h4>
                <p className="text-subtle">{competitor.marketing_strategy}</p>
            </div>
        </div>
    </Card>
);

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ analysis, setAnalysis }) => {
  const [industry, setIndustry] = useState('');
  const [usp, setUsp] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    const validCompetitors = competitors.filter(c => c.trim() !== '');
    if (!industry || !usp || validCompetitors.length === 0) {
        setError("Please provide an industry, your unique selling proposition, and at least one competitor.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await getCompetitorAnalysis(industry, validCompetitors, usp);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Competitor Analysis Setup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Your Industry" id="industry" type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., E-commerce, SaaS, Cafe" required />
            <Input label="Your Unique Selling Proposition (USP)" id="usp" type="text" value={usp} onChange={(e) => setUsp(e.target.value)} placeholder="e.g., Eco-friendly materials, 24/7 support" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competitors.map((c, i) => (
              <Input key={i} label={`Competitor ${i + 1}`} id={`competitor-${i}`} type="text" value={c} onChange={(e) => handleCompetitorChange(i, e.target.value)} placeholder="Enter competitor name" />
            ))}
          </div>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>Analyze Competitors</Button>
        </form>
      </Card>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

      {isLoading && <div className="text-center p-8"><p>Analyzing... this may take a moment.</p></div>}

      {analysis && analysis.competitors && (
         <Card>
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.competitors.map((comp, index) => (
                    <CompetitorCard key={index} competitor={comp} />
                ))}
            </div>
         </Card>
      )}
    </div>
  );
};

export default CompetitorAnalysis;
