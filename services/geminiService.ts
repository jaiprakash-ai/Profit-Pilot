import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CompetitorAnalysisResponse, Benchmark, Forecast, BreakEvenScenario } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialRecommendations = async (transactions: Transaction[]): Promise<string[]> => {
  const model = 'gemini-2.5-flash';
  
  const formattedTransactions = transactions.map(t => `${t.date}: ${t.type} - ${t.description} - $${t.amount}`).join('\n');
  
  const prompt = `
    Based on the following financial transactions, provide 3-5 actionable recommendations for a small business to improve profitability. 
    Focus on cost-saving opportunities, revenue growth ideas, and financial management improvements.
    Keep each recommendation concise and clear.

    Transactions:
    ${formattedTransactions}

    Recommendations:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    const text = response.text;

    // The model should return a list of recommendations. Let's split them by newline and filter empty ones.
    return text.split('\n').map(rec => rec.replace(/^[*-]\s*/, '').trim()).filter(rec => rec.length > 0);
  } catch (error) {
    console.error("Error getting financial recommendations:", error);
    throw new Error("Failed to generate financial recommendations from AI.");
  }
};

export const getCompetitorAnalysis = async (
  industry: string, 
  competitors: string[], 
  usp: string
): Promise<CompetitorAnalysisResponse> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    Analyze the competitive landscape for a small business.
    Industry: ${industry}
    Our Unique Selling Proposition (USP): ${usp}
    Competitors to analyze: ${competitors.join(', ')}

    For each competitor, provide a brief analysis of their likely pricing and marketing strategies.
    Return the analysis in JSON format.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      competitors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            pricing_strategy: { 
              type: Type.STRING,
              description: "A brief analysis of the competitor's pricing strategy."
            },
            marketing_strategy: {
              type: Type.STRING,
              description: "A brief analysis of the competitor's marketing strategy."
            },
          },
          required: ["name", "pricing_strategy", "marketing_strategy"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as CompetitorAnalysisResponse;
  } catch (error) {
    console.error("Error getting competitor analysis:", error);
    throw new Error("Failed to generate competitor analysis from AI.");
  }
};


export const generateFinancialReport = async (transactions: Transaction[]): Promise<string> => {
    const model = 'gemini-2.5-flash';

    const formattedTransactions = transactions.map(t => `${t.date}: ${t.type} - ${t.description} - $${t.amount}`).join('\n');

    const prompt = `
      You are a financial analyst AI. Based on the following transactions, generate a weekly email report.
      The report should include:
      1. A **Financial Summary** (total revenue, expenses, net profit).
      2. A **Key Insights** section identifying the largest revenue source and largest expense.
      3. An **Alerts & Opportunities** section with one key risk or opportunity you've identified from the data.
  
      Format it clearly with markdown-style headings (e.g., ### Financial Summary).
  
      Transactions:
      ${formattedTransactions}
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating financial report:", error);
        throw new Error("Failed to generate financial report from AI.");
    }
};

export const getMarketTrends = async (topic: string) => {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide a summary of the current market trends and social media sentiment for the "${topic}" industry. Include any recent news or significant events.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        
        return { text, sources };

    } catch(error) {
        console.error("Error getting market trends:", error);
        throw new Error("Failed to get market trends from AI.");
    }
}

export const getIndustryBenchmarks = async (transactions: Transaction[], industry: string): Promise<Benchmark> => {
    const model = 'gemini-2.5-flash';

    const { totalRevenue, totalExpenses } = transactions.reduce((acc, t) => {
        if (t.type === 'revenue') acc.totalRevenue += t.amount;
        else acc.totalExpenses += t.amount;
        return acc;
    }, { totalRevenue: 0, totalExpenses: 0 });

    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    const prompt = `
        A small business in the "${industry}" industry has a net profit margin of ${netProfitMargin.toFixed(2)}%.
        What is a typical net profit margin for this industry? 
        Provide a brief analysis comparing the business's performance to the industry average.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            user_metric: { type: Type.STRING, description: "The user's metric, e.g., '15.20% Net Profit Margin'" },
            industry_average: { type: Type.STRING, description: "The industry average metric, e.g., '10-12% Net Profit Margin'" },
            analysis: { type: Type.STRING, description: "A brief analysis comparing the two and providing context." }
        },
        required: ["user_metric", "industry_average", "analysis"]
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as Benchmark;
    } catch(error) {
        console.error("Error getting industry benchmarks:", error);
        throw new Error("Failed to get industry benchmarks from AI.");
    }
}

export const getAdvancedForecast = async (transactions: Transaction[]): Promise<Forecast[]> => {
    const model = 'gemini-2.5-flash';
    const formattedTransactions = transactions.map(t => `${t.date}: ${t.type} - $${t.amount}`).join('\n');
    const lastDate = transactions.length > 0 ? transactions[transactions.length - 1].date : new Date().toISOString().split('T')[0];

    const prompt = `
        Analyze the following financial transactions, looking for monthly patterns and potential seasonality.
        Then, provide a 6-month financial forecast starting from the month after ${lastDate}.
        For each month, predict the total revenue and total expenses.
        
        Transactions:
        ${formattedTransactions}
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                month: { type: Type.STRING, description: "The forecasted month, e.g., 'July 2024'" },
                revenue: { type: Type.NUMBER, description: "Predicted total revenue for the month" },
                expenses: { type: Type.NUMBER, description: "Predicted total expenses for the month" }
            },
            required: ["month", "revenue", "expenses"]
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as Forecast[];
    } catch(error) {
        console.error("Error getting advanced forecast:", error);
        throw new Error("Failed to get advanced forecast from AI.");
    }
}

export const getBreakEvenScenarios = async (fixedCosts: number, variableCost: number, salePrice: number): Promise<BreakEvenScenario[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        A business has the following financials:
        - Monthly Fixed Costs: $${fixedCosts}
        - Variable Cost per Unit: $${variableCost}
        - Sale Price per Unit: $${salePrice}

        Suggest 2-3 actionable scenarios to lower their break-even point. For each scenario, provide a title and a brief description of the strategy.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The title of the scenario, e.g., 'Reduce Material Costs'" },
                description: { type: Type.STRING, description: "A brief description of the strategy." }
            },
            required: ["title", "description"]
        }
    };
     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as BreakEvenScenario[];
    } catch(error) {
        console.error("Error getting break-even scenarios:", error);
        throw new Error("Failed to get break-even scenarios from AI.");
    }
};