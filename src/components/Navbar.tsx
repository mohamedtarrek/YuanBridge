"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const navLinkKeys = [
  { key: "nav.how", href: "#how-it-works" },
  { key: "nav.why", href: "#why-us" },
  { key: "nav.marketplaces", href: "#marketplaces" },
  { key: "nav.reviews", href: "#reviews" },
  { key: "nav.faq", href: "#faq" },
  { key: "nav.contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom flex items-center justify-between h-16 md:h-20 px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">
            YB
          </div>
          <span className="text-lg font-bold tracking-tight">
            Yuan<span className="gradient-text">Bridge</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinkKeys.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="text-sm text-text-muted hover:text-white transition-colors duration-300 relative group"
            >
              {t(link.key)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-bg rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border border-primary-500/30 text-primary-300 hover:bg-primary-500/10 transition-all"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          <Link
            href="/order"
            className="btn-primary text-sm py-2.5 px-5"
          >
            {t("nav.start")}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border border-primary-500/30 text-primary-300 hover:bg-primary-500/10 transition-all"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative w-6 h-5 flex flex-col justify-between"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-full bg-white rounded-full transition-colors"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-0.5 w-full bg-white rounded-full"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-full bg-white rounded-full"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinkKeys.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-text-muted hover:text-white transition-colors py-2"
                >
                  {t(link.key)}
                </a>
              ))}
              <Link
                href="/order"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm text-center mt-2"
              >
                {t("nav.start")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
