'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const testimonials = [
  {
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الرشيد',
    role: 'Professional Trader',
    roleAr: 'متداول محترف',
    content: 'This AI platform has completely transformed my trading. The accuracy of the strategies is remarkable. I went from losing to consistently profitable within months.',
    contentAr: 'هذه المنصة غيرت تداولي تماماً. دقة الاستراتيجيات مذهلة. انتقلت من الخسارة إلى الربح المستمر في غضون أشهر.',
    rating: 5,
    initials: 'AR',
  },
  {
    name: 'Sarah Johnson',
    nameAr: 'سارة جونسون',
    role: 'Forex Analyst',
    roleAr: 'محللة فوركس',
    content: 'The AI analysis is incredibly detailed. It picks up on patterns I would never notice. Premium subscription is worth every penny.',
    contentAr: 'تحليل الذكاء الاصطناعي مفصل بشكل لا يصدق. يكتشف أنماطاً لم أكن لألاحظها أبداً. الاشتراك المميز يستحق كل قرش.',
    rating: 5,
    initials: 'SJ',
  },
  {
    name: 'Mohammed Al-Harbi',
    nameAr: 'محمد الحربي',
    role: 'Day Trader',
    roleAr: 'متداول يومي',
    content: 'I have tried many signal services, but nothing compares to this. The confidence scores help me choose the best setups. Highly recommended!',
    contentAr: 'لقد جربت العديد من خدمات الإشارات، لكن لا شيء يضاهي هذه المنصة. درجات الثقة تساعدني في اختيار أفضل الإعدادات. أوصي بها بشدة!',
    rating: 5,
    initials: 'MH',
  },
  {
    name: 'Elena Petrova',
    nameAr: 'إلينا بيتروفا',
    role: 'Swing Trader',
    roleAr: 'متداولة سوينغ',
    content: 'The risk management analysis is a game-changer. I feel much more confident taking trades knowing the AI has calculated optimal stop losses.',
    contentAr: 'تحليل إدارة المخاطر هو تغيير جذري. أشعر بثقة أكبر بكثير عند الدخول في الصفقات مع معرفة أن AI قد حسب مستويات وقف الخسارة المثلى.',
    rating: 4,
    initials: 'EP',
  },
];

export function Testimonials() {
  const { t, lang } = useLanguage();

  return (
    <section className="section-padding relative">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{t('testimonials.title')}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star < item.rating ? 'text-accent-500' : 'text-text-dim'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                &ldquo;{lang === 'ar' ? item.contentAr : item.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-surface-dark font-bold text-sm">
                  {item.initials}
                </div>
                <div>
                  <p className="text-text font-medium text-sm">{lang === 'ar' ? item.nameAr : item.name}</p>
                  <p className="text-text-muted text-xs">{lang === 'ar' ? item.roleAr : item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
