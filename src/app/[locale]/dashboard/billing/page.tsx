'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Payment } from '@/lib/types';

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
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    startedAt: string;
    endsAt: string;
    paymentMethod: string;
    price?: number;
    currency?: string;
  } | null>(null);
  const [payments, setPayments] = useState<(Payment & { invoiceUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then(res => res.json()),
      fetch('/api/payments/history').then(res => res.json()),
    ])
      .then(([profileData, paymentsData]) => {
        if (profileData.success && profileData.user?.subscription) {
          setSubscription(profileData.user.subscription);
        }
        if (paymentsData.success) {
          setPayments(paymentsData.payments || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-lg mx-auto mb-8" />
        <div className="glass rounded-2xl p-6 md:p-8 border border-border mb-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10" />
            <div className="flex-1">
              <div className="h-6 w-32 bg-white/10 rounded-lg mb-2" />
              <div className="h-8 w-24 bg-white/10 rounded-lg mb-2" />
              <div className="h-4 w-40 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 md:p-6 border border-border">
          <div className="h-6 w-36 bg-white/10 rounded-lg mb-5" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 py-3 border-b border-border/50">
              <div className="h-4 w-24 bg-white/10 rounded-lg" />
              <div className="h-4 w-16 bg-white/10 rounded-lg" />
              <div className="h-4 w-20 bg-white/10 rounded-lg" />
              <div className="h-4 w-16 bg-white/10 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isPremium = subscription?.plan === 'premium';
  const subscriptionPrice = subscription?.price ?? (isPremium ? 14.99 : 0);
  const subscriptionCurrency = subscription?.currency || 'USD';
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
                  {subscriptionCurrency === 'USD' ? '$' : subscriptionCurrency}{subscriptionPrice.toFixed(2)}
                  <span className="text-sm text-text-dim font-normal">{t('pricing.perMonth')}</span>
                </span>
                <StatusBadge status={subscription?.status || 'active'} />
              </div>
              {subscription?.endsAt && (
                <p className="text-text-dim text-sm mt-2">
                  {t('dashboard.expiresOn')}: {fmtDate(subscription.endsAt)}
                </p>
              )}
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
        {payments.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-12 h-12 text-text-dim mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-text-dim text-sm">{(t as any)('dashboard.noPayments') || 'No payments yet'}</p>
          </div>
        ) : (
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-text">
                      {new Date(payment.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-2 text-text font-medium">
                      {payment.currency === 'USD' ? '$' : payment.currency}{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-3 px-2 text-right">
                      {payment.invoiceUrl ? (
                        <a
                          href={payment.invoiceUrl}
                          className="text-accent-500 hover:text-accent-400 text-xs font-semibold transition-colors"
                        >
                          {t('dashboard.invoice') || 'Invoice'}
                        </a>
                      ) : (
                        <span className="text-text-dim text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
