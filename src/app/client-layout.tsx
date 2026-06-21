'use client';

import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
