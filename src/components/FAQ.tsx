"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const faqIndices = Array.from({ length: 10 }, (_, i) => i);

function FAQItem({
  index,
  isOpen,
  onToggle,
}: {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden border border-border hover:border-primary-500/20 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
      >
        <span className="text-white font-medium text-sm md:text-base pr-4">
          {t(`faq.q${index}`)}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-6 h-6 shrink-0 flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 md:px-6 pb-5 md:pb-6 text-text-muted text-sm leading-relaxed">
              {t(`faq.a${index}`)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="faq" className="section-padding relative">
      <div className="absolute inset-0 gradient-bg-subtle" />
      <div className="container-custom relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-base font-semibold text-accent-400 uppercase tracking-widest">
            {t("faq.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
            {t("faq.title1")}{" "}
            <span className="gradient-text">{t("faq.title2")}</span>
          </h2>
          <p className="text-text-muted max-w-3xl mx-auto text-xl">
            {t("faq.desc")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqIndices.map((i) => (
            <FAQItem
              key={i}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
