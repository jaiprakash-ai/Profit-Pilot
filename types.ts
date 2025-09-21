// Fix: This file was corrupted with component logic. Replaced with proper type definitions.
export enum Page {
  Dashboard = 'Dashboard',
  Transactions = 'Transactions',
  Invoices = 'Invoices',
  Recommendations = 'AI Recommendations',
  CompetitorAnalysis = 'Competitor Analysis',
  BusinessIntelligence = 'Business Intelligence',
  Reports = 'Email AI Reports',
}

export interface Transaction {
  id: number;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: number;
  number: string;
  clientName: string;
  clientAddress: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
}

export interface Competitor {
    name: string;
    pricing_strategy: string;
    marketing_strategy: string;
}

export interface CompetitorAnalysisResponse {
    competitors: Competitor[];
}

export interface Benchmark {
    user_metric: string;
    industry_average: string;
    analysis: string;
}

export interface Forecast {
    month: string;
    revenue: number;
    expenses: number;
}

export interface BreakEvenScenario {
    title: string;
    description: string;
}
