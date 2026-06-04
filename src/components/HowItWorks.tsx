"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const stepKeys = [
  { number: "01", titleKey: "how.step1.title", descKey: "how.step1.desc" },
  { number: "02", titleKey: "how.step2.title", descKey: "how.step2.desc" },
  { number: "03", titleKey: "how.step3.title", descKey: "how.step3.desc" },
  { number: "04", titleKey: "how.step4.title", descKey: "how.step4.desc" },
  { number: "05", titleKey: "how.step5.title", descKey: "how.step5.desc" },
];

const stepIcons = [
  (
    <svg key="1" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  (
    <svg key="2" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  (
    <svg key="3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  (
    <svg key="4" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  (
    <svg key="5" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
];

function StepCard({
  step,
  index,
}: {
  step: (typeof stepKeys)[0];
  index: number;
}) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative flex gap-4 md:gap-8"
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-base md:text-xl shrink-0">
          {step.number}
        </div>
        {index < stepKeys.length - 1 && (
          <div className="w-px flex-1 bg-gradient-to-b from-primary-500/40 to-transparent mt-2" />
        )}
      </div>

      <div className="pb-8 md:pb-12 flex-1">
        <div className="glass rounded-2xl p-5 md:p-8 glow-card">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-300 mb-3 md:mb-4">
            {stepIcons[index]}
          </div>
          <h3 className="text-lg md:text-2xl font-semibold text-white mb-2 md:mb-3">{t(step.titleKey)}</h3>
          <p className="text-sm md:text-lg text-text-muted leading-relaxed">{t(step.descKey)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="absolute inset-0 gradient-bg-subtle" />
      <div className="container-custom relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-base font-semibold text-accent-400 uppercase tracking-widest">
            {t("how.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 md:mt-4 mb-3 md:mb-4">
            {t("how.title1")}{" "}
            <span className="gradient-text">{t("how.title2")}</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-lg">
            {t("how.desc")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {stepKeys.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
