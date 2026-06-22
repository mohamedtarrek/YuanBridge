import type { SubscriptionPlan } from '@prisma/client'

export interface PlanDetails {
  id: SubscriptionPlan
  name: string
  nameAr: string
  price: number
  currency: string
  durationDays: number | null
  features: { text: string; textAr: string; included: boolean }[]
  highlighted: boolean
  isPremium: boolean
}

export const PLANS: PlanDetails[] = [
  {
    id: 'FREE',
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    currency: 'USD',
    durationDays: null,
    features: [
      { text: 'Basic strategy viewing', textAr: 'عرض الاستراتيجيات الأساسية', included: true },
      { text: '3 strategies per month', textAr: '3 استراتيجيات شهرياً', included: true },
      { text: 'Basic market data', textAr: 'بيانات السوق الأساسية', included: true },
      { text: 'Community access', textAr: 'الوصول للمجتمع', included: true },
      { text: 'Premium strategies', textAr: 'الاستراتيجيات المميزة', included: false },
      { text: 'Advanced technical analysis', textAr: 'التحليل الفني المتقدم', included: false },
      { text: 'AI-powered insights', textAr: 'التحليلات بالذكاء الاصطناعي', included: false },
      { text: 'Priority support', textAr: 'الدعم ذو الأولوية', included: false },
    ],
    highlighted: false,
    isPremium: false,
  },
  {
    id: 'MONTHLY',
    name: 'Monthly Premium',
    nameAr: 'شهري مميز',
    price: 12.99,
    currency: 'USD',
    durationDays: 30,
    features: [
      { text: 'Unlimited strategy viewing', textAr: 'عرض غير محدود للاستراتيجيات', included: true },
      { text: 'All premium strategies', textAr: 'جميع الاستراتيجيات المميزة', included: true },
      { text: 'Advanced market data', textAr: 'بيانات السوق المتقدمة', included: true },
      { text: 'Technical analysis tools', textAr: 'أدوات التحليل الفني', included: true },
      { text: 'AI-powered insights', textAr: 'التحليلات بالذكاء الاصطناعي', included: true },
      { text: 'Email support', textAr: 'الدعم عبر البريد الإلكتروني', included: true },
      { text: 'Cancel anytime', textAr: 'إلغاء في أي وقت', included: true },
      { text: 'Priority access to new features', textAr: 'وصول أولوي للميزات الجديدة', included: false },
    ],
    highlighted: false,
    isPremium: true,
  },
  {
    id: 'QUARTERLY',
    name: 'Quarterly Premium',
    nameAr: 'ربع سنوي مميز',
    price: 29.99,
    currency: 'USD',
    durationDays: 90,
    features: [
      { text: 'Everything in Monthly', textAr: 'كل ما في الخطة الشهرية', included: true },
      { text: 'Save 23% vs monthly', textAr: 'وفر 23% مقارنة بالشهري', included: true },
      { text: 'Priority email support', textAr: 'دعم ذو أولوية عبر البريد', included: true },
      { text: 'Early access to strategies', textAr: 'وصول مبكر للاستراتيجيات', included: true },
      { text: 'Monthly market reports', textAr: 'تقارير السوق الشهرية', included: true },
      { text: 'Priority access to new features', textAr: 'وصول أولوي للميزات الجديدة', included: true },
    ],
    highlighted: true,
    isPremium: true,
  },
  {
    id: 'YEARLY',
    name: 'Yearly Premium',
    nameAr: 'سنوي مميز',
    price: 79.99,
    currency: 'USD',
    durationDays: 365,
    features: [
      { text: 'Everything in Quarterly', textAr: 'كل ما في الخطة الربع سنوية', included: true },
      { text: 'Save 49% vs monthly', textAr: 'وفر 49% مقارنة بالشهري', included: true },
      { text: 'Priority support', textAr: 'الدعم ذو الأولوية', included: true },
      { text: 'Exclusive webinars', textAr: 'ندوات عبر الإنترنت حصرية', included: true },
      { text: 'Advanced AI analytics', textAr: 'تحليلات متقدمة بالذكاء الاصطناعي', included: true },
      { text: 'Custom strategy alerts', textAr: 'تنبيهات استراتيجية مخصصة', included: true },
      { text: 'API access', textAr: 'الوصول لواجهة API', included: true },
    ],
    highlighted: false,
    isPremium: true,
  },
  {
    id: 'LIFETIME',
    name: 'Lifetime Premium',
    nameAr: 'مدى الحياة',
    price: 199.99,
    currency: 'USD',
    durationDays: null,
    features: [
      { text: 'Everything in Yearly', textAr: 'كل ما في الخطة السنوية', included: true },
      { text: 'No recurring payments', textAr: 'لا دفعات متكررة', included: true },
      { text: 'VIP support', textAr: 'دعم VIP', included: true },
      { text: 'All future premium features', textAr: 'جميع الميزات المميزة المستقبلية', included: true },
      { text: 'Beta features access', textAr: 'الوصول للميزات التجريبية', included: true },
      { text: 'Personal strategy consultation', textAr: 'استشارة استراتيجية شخصية', included: true },
    ],
    highlighted: false,
    isPremium: true,
  },
]

export function getPlanDetails(plan: SubscriptionPlan | string): PlanDetails | undefined {
  return PLANS.find(p => p.id === plan || p.name.toLowerCase() === plan.toLowerCase())
}

export function isPremiumPlan(plan: SubscriptionPlan | string): boolean {
  return plan !== 'FREE'
}

export function getPlanDurationDays(plan: SubscriptionPlan | string): number | null {
  const details = getPlanDetails(plan)
  return details?.durationDays ?? null
}

export function calculateEndDate(plan: SubscriptionPlan | string, from?: Date): Date | null {
  if (plan === 'LIFETIME') return null
  const days = getPlanDurationDays(plan)
  if (!days) return null
  const start = from || new Date()
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
}

export function getSubscriptionPrice(plan: SubscriptionPlan | string): number {
  const details = getPlanDetails(plan)
  return details?.price ?? 0
}

export function getAvailablePlans(): PlanDetails[] {
  return PLANS.filter(p => p.id !== 'FREE')
}
