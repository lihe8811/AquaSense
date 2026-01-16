
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
  overallScore: number;
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
