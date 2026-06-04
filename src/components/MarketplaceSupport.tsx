"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const marketplaces = [
  {
    name: "Taobao",
    chinese: "淘宝",
    descKey: "market.taobao",
    gradient: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/20",
  },
  {
    name: "1688",
    chinese: "阿里巴巴",
    descKey: "market.1688",
    gradient: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
  },
  {
    name: "Tmall",
    chinese: "天猫",
    descKey: "market.tmall",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
  },
  {
    name: "JD.com",
    chinese: "京东",
    descKey: "market.jd",
    gradient: "from-red-500/20 to-yellow-500/20",
    border: "border-red-500/20",
  },
  {
    name: "Alibaba",
    chinese: "阿里巴巴",
    descKey: "market.alibaba",
    gradient: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/20",
  },
];

export default function MarketplaceSupport() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="marketplaces" className="section-padding relative">
      <div className="absolute inset-0 gradient-bg-subtle" />
      <div className="container-custom relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-base font-semibold text-accent-400 uppercase tracking-widest">
            {t("market.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
            {t("market.title1")}{" "}
            <span className="gradient-text">{t("market.title2")}</span>
          </h2>
          <p className="text-text-muted max-w-3xl mx-auto text-xl">
            {t("market.desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaces.map((mp, index) => (
            <motion.div
              key={mp.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass rounded-2xl p-8 glow-card border ${mp.border} group cursor-default`}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mp.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-2xl font-bold text-white">
                  {mp.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{mp.name}</h3>
              <p className="text-sm text-text-muted mb-3 font-medium">
                {mp.chinese}
              </p>
              <p className="text-text-muted text-sm leading-relaxed">
                {t(mp.descKey)}
              </p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-8 glow-card flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-5">
              <span className="text-2xl font-bold gradient-text">+</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t("market.more")}</h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              {t("market.more.desc")}
            </p>
            <Link href="/order" className="btn-primary text-sm">
              {t("market.cta")}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
