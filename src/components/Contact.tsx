"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { t } = useLanguage();

  return (
    <section id="contact" className="section-padding">
      <div className="container-custom" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-base font-semibold text-accent-400 uppercase tracking-widest">
            {t("contact.title1")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 md:mt-4 mb-3 md:mb-4">
            {t("contact.title1")}{" "}
            <span className="gradient-text">{t("contact.title2")}</span>
          </h2>
          <p className="text-text-muted max-w-3xl mx-auto text-base md:text-xl">
            {t("contact.desc")}
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.a
            href="https://wa.me/201019808766"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6 md:p-8 glow-card group text-center block hover:scale-[1.02] transition-transform"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400 mx-auto mb-3 md:mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">WhatsApp</h3>
            <p className="text-text-muted text-sm md:text-base">+20 101 980 8766</p>
            <div className="mt-3 md:mt-4 inline-flex items-center gap-2 text-xs md:text-sm text-green-400 font-medium">
              <span>{t("contact.cta.title")}</span>
              <svg className="w-4 h-4 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-5 md:p-10 mt-6 md:mt-8 text-center"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">
              {t("contact.cta.title")}
            </h3>
            <p className="text-text-muted text-sm md:text-base mb-4 md:mb-6 max-w-md mx-auto">
              {t("contact.cta.desc")}
            </p>
            <a href="/order" className="btn-primary w-full sm:w-auto">
              {t("contact.cta.btn")}
              <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
