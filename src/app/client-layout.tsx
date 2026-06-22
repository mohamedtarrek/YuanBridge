'use client';

import { AuthProvider } from '@/lib/auth/client';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
