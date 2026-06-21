'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Payment } from '@/lib/types';

const mockSubscription = {
  plan: 'premium' as const,
  status: 'active' as const,
  startedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  endsAt: new Date(Date.now() + 86400000 * 25).toISOString(),
  paymentMethod: 'stripe' as const,
  price: 14.99,
  currency: 'USD',
};

const mockPayments: (Payment & { invoiceUrl: string })[] = [
  { id: 'pay_1', userId: 'u1', subscriptionId: 'sub_1', amount: 14.99, currency: 'USD', status: 'succeeded', provider: 'stripe', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), invoiceUrl: '#' },
  { id: 'pay_2', userId: 'u1', subscriptionId: 'sub_1', amount: 14.99, currency: 'USD', status: 'succeeded', provider: 'stripe', createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), invoiceUrl: '#' },
  { id: 'pay_3', userId: 'u1', subscriptionId: 'sub_1', amount: 14.99, currency: 'USD', status: 'succeeded', provider: 'paypal', createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), invoiceUrl: '#' },
  { id: 'pay_4', userId: 'u1', subscriptionId: 'sub_1', amount: 9.99, currency: 'USD', status: 'succeeded', provider: 'stripe', createdAt: new Date(Date.now() - 86400000 * 120).toISOString(), invoiceUrl: '#' },
  { id: 'pay_5', userId: 'u1', subscriptionId: 'sub_1', amount: 9.99, currency: 'USD', status: 'failed', provider: 'stripe', createdAt: new Date(Date.now() - 86400000 * 150).toISOString(), invoiceUrl: '#' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
    expired: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
    cancelled: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
    succeeded: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
    failed: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
    pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {(t as any)(`common.${status}`) || status}
    </span>
  );
}

export default function BillingPage() {
  const { t, lang, isRTL } = useLanguage();
  const [showCancel, setShowCancel] = useState(false);

  const isPremium = mockSubscription.plan === 'premium';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(
    lang === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">{t('dashboard.billing')}</h2>
      </motion.div>

      {/* Current Plan Card */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 md:p-8 border border-border mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isPremium ? 'bg-accent-500/20' : 'bg-surface-lighter'
            }`}>
              {isPremium ? (
                <svg className="w-7 h-7 text-accent-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text mb-1">
                {isPremium ? t('pricing.premium') : t('pricing.free')}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-2xl font-bold ${isPremium ? 'gradient-text' : 'text-text-muted'}`}>
                  ${mockSubscription.price}
                  <span className="text-sm text-text-dim font-normal">{t('pricing.perMonth')}</span>
                </span>
                <StatusBadge status={mockSubscription.status} />
              </div>
              <p className="text-text-dim text-sm mt-2">
                {t('dashboard.expiresOn')}: {fmtDate(mockSubscription.endsAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="primary" className="w-full md:w-auto" href={`/${lang}/pricing`}>
              {isPremium ? t('dashboard.manageSubscription') : t('dashboard.upgrade')}
            </Button>
            {isPremium && (
              <Button
                variant="ghost"
                className="w-full md:w-auto text-danger border-danger/30 hover:bg-danger/10 hover:border-danger/50"
                onClick={() => setShowCancel(!showCancel)}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation */}
        {showCancel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-border"
          >
            <div className="glass-light rounded-xl p-4 border border-danger/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-text font-semibold text-sm mb-1">{t('dashboard.cancelWarning') || 'Are you sure you want to cancel?'}</p>
                  <p className="text-text-dim text-xs mb-3">{t('dashboard.cancelHint') || 'Your Premium benefits will remain active until the end of the billing period.'}</p>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setShowCancel(false)}>
                      {t('common.keepSubscription') || 'Keep Subscription'}
                    </Button>
                    <Button variant="ghost" className="text-danger border-danger/30 hover:bg-danger/10">
                      {t('common.confirmCancel') || 'Confirm Cancel'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Payment History */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-5 md:p-6 border border-border">
        <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.paymentHistory') || 'Payment History'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-text-dim font-medium">{t('common.date') || 'Date'}</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">{t('common.amount') || 'Amount'}</th>
                <th className="text-left py-3 px-2 text-text-dim font-medium">{t('common.status')}</th>
                <th className="text-right py-3 px-2 text-text-dim font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-text">
                    {new Date(payment.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2 text-text font-medium">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <a
                      href={payment.invoiceUrl}
                      className="text-accent-500 hover:text-accent-400 text-xs font-semibold transition-colors"
                    >
                      {t('dashboard.invoice') || 'Invoice'}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
