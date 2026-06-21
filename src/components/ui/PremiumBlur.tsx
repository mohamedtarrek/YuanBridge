'use client';

import type { ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from './Button';

interface PremiumBlurProps {
  children: ReactNode;
}

export function PremiumBlur({ children }: PremiumBlurProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="premium-blur relative rounded-2xl">
      <div className="blur-sm opacity-40 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
        <div className="glass px-6 py-4 rounded-2xl text-center max-w-xs">
          <svg className="w-8 h-8 text-accent-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p className="text-text text-sm font-medium mb-3">
            {t('latest.premium')}
          </p>
          <Button
            variant="primary"
            size="sm"
            href={`/${lang}/pricing`}
          >
            {t('latest.subscribe')}
          </Button>
        </div>
      </div>
    </div>
  );
}
