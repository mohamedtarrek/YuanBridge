export interface LocaleParams {
  locale: string;
}

export interface Strategy {
  id: string;
  title: string;
  titleAr: string;
  currencyPair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  publishedAt: string;
  summary: string;
  summaryAr: string;
  isPremium: boolean;
  technicalAnalysis: string;
  technicalAnalysisAr: string;
  fundamentalAnalysis: string;
  fundamentalAnalysisAr: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support: number[];
  resistance: number[];
  indicators: {
    rsi: number;
    macd: string;
    ema: string;
    sma: string;
    atr: number;
    bollingerBands: { upper: number; middle: number; lower: number };
  };
  notes: string;
  notesAr: string;
  tradesAnalyzed: number;
  aiModel: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nameAr: string;
  subscription: 'free' | 'premium';
  subscriptionEndsAt: string | null;
  emailVerified: boolean;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'ar' | 'en';
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startedAt: string;
  endsAt: string;
  paymentMethod: 'stripe' | 'paypal' | null;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  provider: 'stripe' | 'paypal';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  content: string;
  contentAr: string;
  rating: number;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'strategy' | 'system' | 'billing' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface AIJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  model: 'openai' | 'claude' | 'gemini' | 'deepseek';
  startedAt: string | null;
  completedAt: string | null;
  result: string | null;
  error: string | null;
}

export interface DashboardStats {
  strategiesGenerated: number;
  tradesAnalyzed: number;
  aiAccuracy: number;
  premiumMembers: number;
  supportedCountries: number;
  activeUsers: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: { text: string; textAr: string; included: boolean }[];
  highlighted: boolean;
}

export type SupportedLocale = 'ar' | 'en';
