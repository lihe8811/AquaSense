
export enum AppScreen {
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  SUMMARY = 'SUMMARY',
  TONGUE_ANALYSIS = 'TONGUE_ANALYSIS',
  URINE_ANALYSIS = 'URINE_ANALYSIS',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  HISTORY = 'HISTORY',
  REPORT = 'REPORT',
  PROFILE = 'PROFILE'
}

export interface HydrationMetrics {
  overallScore: number | null;
  targetScore: number;
  mineral: number;
  fluid: number;
  electrolytes: number;
  detox: number;
  balance: number;
  retention: number;
  intracellular: number;
  extracellular: number;
}

export interface ScanResult {
  status: string;
  description: string;
  markers: { label: string; value: string; }[];
  recommendation: string;
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  tags: string[];
  price: string;
  imageUrl: string;
  benefit: string;
  isBestMatch?: boolean;
}

export interface AuthSession {
  id?: number;
  token: string;
  email: string;
  name?: string;
}

export interface ReportItem {
  id: string;
  createdAt: string;
  status: 'generating' | 'ready';
  reportKey?: string;
}

export interface HydrationHistoryPoint {
  label: string;
  score: number;
  timestamp?: number;
}

export interface ReportData {
  testDate: string;
  userProfile?: {
    age: number | null;
    gender: string | null;
    height_cm: number | null;
    weight_kg: number | null;
  };
  hydrationSummary: {
    level: number | null;
    status: string;
    wellnessTip: string;
  };
  urineAnalysis: {
    status: string;
    colorLevel: string;
    insight: string;
    analysis?: string;
    metrics?: {
      L_star: number;
      a_star: number;
      b_star: number;
    };
    analysisData?: {
      hydration_status: string;
      risk_level: string;
      estimated_armstrong_grade: number;
    };
  };
  tongueAnalysis: {
    status: string;
    insight: string;
    metrics?: {
      body_redness_a: number;
      body_lightness_L: number;
      body_yellow_b: number;
      coating_percentage: number;
      moisture_score: number;
    };
    diagnosis?: string[];
  };
  recommendedDrinks: {
    id: string;
    name: string;
    desc: string;
    benefit: string;
    img: string;
    isBest: boolean;
    reason?: string;
  }[];
}
