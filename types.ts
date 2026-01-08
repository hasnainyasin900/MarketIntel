
export interface ProductIdea {
  name: string;
  profitabilityReason: string;
  targetAudience: string;
  estimatedPriceRange: string;
  monthlyEarningPotential: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ProductReport {
  suggestions?: ProductIdea[];
  overview: {
    explanation: string;
    useCases: string[];
    buyerTypes: string[];
  };
  demand: {
    level: 'Low' | 'Medium' | 'High';
    trend: string;
    seasonalInsights: string;
    intentSignals: string[];
    confidence: string;
  };
  marketSize: {
    tamRange: string;
    estimatedMarketCapRange: string;
    annualRevenue: string;
    assumptions: string[];
    detailedTamBreakdown: string;
    disclaimer: string;
  };
  trends: {
    pastBehavior: string;
    threeMonth: string;
    sixMonth: string;
    status: 'Rising' | 'Stable' | 'Declining';
    reasoning: string;
    chartData: Array<{ month: string; interest: number }>;
  };
  pricing: {
    mvp: number;
    mvpROI: string;
    mvpValueNote: string;
    competitive: number;
    competitiveROI: string;
    competitiveValueNote: string;
    premium: number;
    premiumROI: string;
    premiumValueNote: string;
    notes: string;
    currency: string;
  };
  profitability: {
    profitPerUnit: number;
    margin: number;
    breakEven: number;
    scenarios: Array<{ name: string; units: number; profit: number }>;
    explanation: string;
  };
  competition: {
    level: 'Low' | 'Medium' | 'High';
    activeSellers: string;
    avgPricing: string;
    features: string[];
    differentiationDifficulty: string;
    competitorDifferentiationTactics: string[];
  };
  risk: {
    score: number;
    saturation: string;
    priceWar: string;
    volatility: string;
    explanation: string;
    mitigationAdvice: string;
    actionableMitigationSteps: string[];
  };
  metaAds: {
    bestTime: {
      peakTime: string;
      days: string[];
      slots: string[];
      reasoning: string;
    };
    budgetSplitStrategy: string;
    targeting: {
      interests: string[];
      specificAudienceInterests: string[];
      demographics: string;
      behavior: string[];
      lookalikeSuggestions: string;
      lookalikeStrategy: string;
    };
    creative: {
      format: string;
      hookIdeas: string[];
      angle: string;
      cta: string[];
    };
    budgetTips: string;
  };
  seoListing: {
    titles: Array<{ type: string; content: string }>;
    metaDescriptions: Array<{ type: string; content: string }>;
    headlines: {
      website: string[];
      marketplace: string[];
      social: string[];
    };
    pageStructure: string[];
    productPageStructure: string;
  };
  scalingStrategy: {
    reinvestmentTriggers: string;
    lineExpansionIdeas: string[];
    brandBuildingStrategy: string;
    actionableAdvice: string;
  };
  verdict: {
    decision: 'Go' | 'No-Go' | 'Conditional';
    launchTime: string;
    todayAction: string;
    successFactors: string[];
  };
}

export interface SearchParams {
  productName?: string;
  region?: string;
  budgetRange?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AspectRatio = '1:1' | '3:4' | '16:9' | '9:16';
