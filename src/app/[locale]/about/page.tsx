'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const teamMembers = [
  {
    initials: { en: 'AY', ar: 'أي' },
    name: { en: 'Ahmed Youssef', ar: 'أحمد يوسف' },
    role: { en: 'CEO & Founder', ar: 'الرئيس التنفيذي والمؤسس' },
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
  {
    initials: { en: 'SN', ar: 'سن' },
    name: { en: 'Sarah Al-Nasser', ar: 'سارة الناصر' },
    role: { en: 'Head of AI Research', ar: 'رئيسة أبحاث الذكاء الاصطناعي' },
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
  {
    initials: { en: 'MK', ar: 'مك' },
    name: { en: 'Mohammed Karim', ar: 'محمد كريم' },
    role: { en: 'Lead Software Engineer', ar: 'مهندس البرمجيات الرئيسي' },
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
  },
  {
    initials: { en: 'LR', ar: 'لر' },
    name: { en: 'Layla Rashid', ar: 'ليلى راشد' },
    role: { en: 'Financial Analyst', ar: 'محللة مالية' },
    socials: [
      { label: 'LinkedIn', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
];

const stats = [
  { key: 'years', label: { en: 'Years Active', ar: 'سنوات النشاط' }, value: '3+' },
  { key: 'members', label: { en: 'Team Members', ar: 'أعضاء الفريق' }, value: '24' },
  { key: 'countries', label: { en: 'Countries Served', ar: 'الدول المخدومة' }, value: '50+' },
  { key: 'strategies', label: { en: 'Strategies Generated', ar: 'الاستراتيجيات المولدة' }, value: '12K+' },
];

export default function AboutPage() {
  const { t, lang, dir } = useLanguage();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="section-padding pb-8">
          <motion.div
            className="container-custom text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6"
            >
              {t('about.title').split(' ').map((word, i) =>
                word === 'YuanBridge' || word === 'YuanBridge' ? (
                  <span key={i} className="gradient-text">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto mb-10"
            >
              {t('about.subtitle')}
            </motion.p>
          </motion.div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" dir={dir}>
              <motion.div
                initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-3xl p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">{t('about.mission')}</h3>
                <p className="text-text-muted leading-relaxed">{t('about.missionDesc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: lang === 'ar' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-3xl p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">{t('about.vision')}</h3>
                <p className="text-text-muted leading-relaxed">{t('about.visionDesc')}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-padding py-16">
          <div className="container-custom">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.key}
                  variants={statVariants}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-text-muted">{stat.label[lang as 'en' | 'ar']}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding py-16">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-text mb-4">{t('about.team')}</h2>
              <p className="text-text-muted max-w-3xl mx-auto text-base md:text-lg">{t('about.teamDesc')}</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.name.en}
                  variants={itemVariants}
                  className="glass-card rounded-3xl p-6 text-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent-500/30 transition-colors">
                    <span className="text-xl font-bold gradient-text">
                      {member.initials[lang as 'en' | 'ar']}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text mb-1">{member.name[lang as 'en' | 'ar']}</h3>
                  <p className="text-sm text-text-muted mb-5">{member.role[lang as 'en' | 'ar']}</p>
                  <div className="flex items-center justify-center gap-3">
                    {member.socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-9 h-9 rounded-full bg-surface-lighter flex items-center justify-center text-text-dim hover:bg-accent-500/20 hover:text-accent-500 transition-all duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="text-xs font-medium">{social.label[0]}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
