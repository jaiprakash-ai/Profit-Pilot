import React, { useState, useMemo, FC } from 'react';
import { Transaction, Benchmark, Forecast, BreakEvenScenario } from '../types';
import { getMarketTrends, getIndustryBenchmarks, getAdvancedForecast, getBreakEvenScenarios } from '../services/geminiService';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BusinessIntelligenceProps {
    transactions: Transaction[];
}

const Section: FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <Card>
        <h2 className="text-2xl font-bold mb-4 text-on-surface">{title}</h2>
        {children}
    </Card>
);

const BusinessIntelligence: FC<BusinessIntelligenceProps> = ({ transactions }) => {
    // State for Market Trends
    const [marketIndustry, setMarketIndustry] = useState('');
    const [marketTrends, setMarketTrends] = useState<{text: string, sources: any[]}>({text: '', sources: []});
    const [isTrendsLoading, setIsTrendsLoading] = useState(false);
    const [trendsError, setTrendsError] = useState<string | null>(null);

    // State for Benchmarking
    const [benchmarkIndustry, setBenchmarkIndustry] = useState('');
    const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
    const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(false);
    const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

    // State for Forecasting
    const [forecast, setForecast] = useState<Forecast[] | null>(null);
    const [isForecastLoading, setIsForecastLoading] = useState(false);
    const [forecastError, setForecastError] = useState<string | null>(null);

    // State for Break-Even Analysis
    const [fixedCosts, setFixedCosts] = useState('');
    const [variableCost, setVariableCost] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [scenarios, setScenarios] = useState<BreakEvenScenario[]>([]);
    const [isScenarioLoading, setIsScenarioLoading] = useState(false);
    const [scenarioError, setScenarioError] = useState<string | null>(null);

    const handleGetTrends = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTrendsLoading(true);
        setTrendsError(null);
        try {
            const result = await getMarketTrends(marketIndustry);
            setMarketTrends(result);
        } catch (err) {
            setTrendsError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsTrendsLoading(false);
        }
    };

    const handleGetBenchmarks = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBenchmarkLoading(true);
        setBenchmarkError(null);
        try {
            const result = await getIndustryBenchmarks(transactions, benchmarkIndustry);
            setBenchmark(result);
        } catch (err) {
            setBenchmarkError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsBenchmarkLoading(false);
        }
    };

    const handleGetForecast = async () => {
        setIsForecastLoading(true);
        setForecastError(null);
        try {
            const result = await getAdvancedForecast(transactions);
            setForecast(result);
        } catch (err) {
            setForecastError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsForecastLoading(false);
        }
    };
    
    const handleGetScenarios = async () => {
        const fc = parseFloat(fixedCosts);
        const vc = parseFloat(variableCost);
        const sp = parseFloat(salePrice);
        if (isNaN(fc) || isNaN(vc) || isNaN(sp) || sp <= vc) {
            setScenarioError("Please enter valid costs and prices. Sale price must be greater than variable cost.");
            return;
        }
        setIsScenarioLoading(true);
        setScenarioError(null);
        try {
            const result = await getBreakEvenScenarios(fc, vc, sp);
            setScenarios(result);
        } catch (err) {
            setScenarioError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsScenarioLoading(false);
        }
    }

    const breakEvenPoint = useMemo(() => {
        const fc = parseFloat(fixedCosts);
        const vc = parseFloat(variableCost);
        const sp = parseFloat(salePrice);
        if (isNaN(fc) || isNaN(vc) || isNaN(sp) || sp <= vc || fc <= 0) {
            return null;
        }
        const units = Math.ceil(fc / (sp - vc));
        const revenue = units * sp;
        return { units, revenue };
    }, [fixedCosts, variableCost, salePrice]);

    return (
        <div className="space-y-8">
            {/* Market Trends */}
            <Section title="Real-time Market Trends">
                <form onSubmit={handleGetTrends} className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="w-full">
                        <Input label="Enter Your Industry" id="market-industry" type="text" value={marketIndustry} onChange={e => setMarketIndustry(e.target.value)} placeholder="e.g., Sustainable Fashion" />
                    </div>
                    <Button type="submit" isLoading={isTrendsLoading} disabled={isTrendsLoading || !marketIndustry} className="w-full sm:w-auto">Get Trends</Button>
                </form>
                {trendsError && <p className="text-red-500 mt-2">{trendsError}</p>}
                {marketTrends.text && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <p className="whitespace-pre-wrap">{marketTrends.text}</p>
                        {marketTrends.sources.length > 0 && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-sm">Sources:</h4>
                                <ul className="list-disc list-inside text-sm text-subtle">
                                    {marketTrends.sources.map((source: any, index: number) => (
                                        <li key={index}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{source.web.title}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Section>

            {/* Industry Benchmarking */}
            <Section title="Industry Performance Benchmarking">
                 <form onSubmit={handleGetBenchmarks} className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="w-full">
                        <Input label="Enter Your Industry" id="benchmark-industry" type="text" value={benchmarkIndustry} onChange={e => setBenchmarkIndustry(e.target.value)} placeholder="e.g., Local Coffee Shops" />
                    </div>
                    <Button type="submit" isLoading={isBenchmarkLoading} disabled={isBenchmarkLoading || !benchmarkIndustry} className="w-full sm:w-auto">Compare</Button>
                </form>
                 {benchmarkError && <p className="text-red-500 mt-2">{benchmarkError}</p>}
                 {benchmark && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-primary/10 rounded-lg">
                            <h4 className="text-sm font-semibold text-primary">Your Net Profit Margin</h4>
                            <p className="text-3xl font-bold text-primary">{benchmark.user_metric.split(' ')[0]}</p>
                        </div>
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <h4 className="text-sm font-semibold text-subtle">Industry Average</h4>
                            <p className="text-3xl font-bold text-on-surface">{benchmark.industry_average.split(' ')[0]}</p>
                        </div>
                        <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg text-left">
                            <h4 className="font-semibold mb-1">AI Analysis</h4>
                            <p className="text-subtle">{benchmark.analysis}</p>
                        </div>
                    </div>
                 )}
            </Section>

            {/* Cash Flow Forecasting */}
            <Section title="Advanced Cash Flow Forecasting">
                <div className="flex justify-center">
                    <Button onClick={handleGetForecast} isLoading={isForecastLoading} disabled={isForecastLoading}>Generate 6-Month Forecast</Button>
                </div>
                 {forecastError && <p className="text-red-500 mt-2 text-center">{forecastError}</p>}
                 {forecast && (
                    <div className="w-full h-72 mt-4">
                        <ResponsiveContainer>
                        <LineChart data={forecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value / 1000)}k`} />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" name="Forecasted Revenue" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
                            <Line type="monotone" name="Forecasted Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>
                 )}
            </Section>

            {/* Break-Even Analysis */}
            <Section title="Break-Even Analysis Calculator">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Total Monthly Fixed Costs ($)" id="fixed-costs" type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} placeholder="e.g., 5000" />
                    <Input label="Variable Cost Per Unit ($)" id="variable-cost" type="number" value={variableCost} onChange={e => setVariableCost(e.target.value)} placeholder="e.g., 15" />
                    <Input label="Sale Price Per Unit ($)" id="sale-price" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="e.g., 40" />
                </div>
                {breakEvenPoint && (
                     <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                         <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                             <h4 className="text-sm font-semibold text-emerald-800">Break-Even Point (Units)</h4>
                             <p className="text-3xl font-bold text-emerald-600">{breakEvenPoint.units.toLocaleString()}</p>
                             <p className="text-xs text-emerald-700">Units to sell per month to cover costs</p>
                         </div>
                         <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <h4 className="text-sm font-semibold text-emerald-800">Break-Even Point (Revenue)</h4>
                             <p className="text-3xl font-bold text-emerald-600">${breakEvenPoint.revenue.toLocaleString()}</p>
                             <p className="text-xs text-emerald-700">Revenue needed per month to cover costs</p>
                         </div>
                     </div>
                )}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-bold mb-2">AI-Powered Scenario Planning</h3>
                    <p className="text-subtle mb-4">Get actionable suggestions from AI to improve your break-even point.</p>
                     <Button onClick={handleGetScenarios} isLoading={isScenarioLoading} disabled={isScenarioLoading || !breakEvenPoint}>Get AI Suggestions</Button>
                     {scenarioError && <p className="text-red-500 mt-2">{scenarioError}</p>}
                     {scenarios.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {scenarios.map((scenario, index) => (
                                <div key={index} className="p-3 bg-primary/5 rounded-lg">
                                    <h4 className="font-semibold text-primary">{scenario.title}</h4>
                                    <p className="text-sm text-on-surface">{scenario.description}</p>
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            </Section>
        </div>
    );
};

export default BusinessIntelligence;