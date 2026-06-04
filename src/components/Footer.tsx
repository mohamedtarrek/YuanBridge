"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const footerLinks = [
  { key: "footer.how", href: "#how-it-works" },
  { key: "footer.why", href: "#why-us" },
  { key: "footer.marketplaces", href: "#marketplaces" },
  { key: "footer.reviews", href: "#reviews" },
  { key: "footer.faq", href: "#faq" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border">
      <div className="container-custom px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">
                YB
              </div>
              <span className="text-lg font-bold tracking-tight">
                Yuan<span className="gradient-text">Bridge</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-md">
              {t("footer.desc")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t("footer.quick")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    className="text-sm text-text-muted hover:text-white transition-colors"
                  >
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/order"
                  className="text-sm text-text-muted hover:text-white transition-colors"
                >
                  {t("footer.place")}
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-text-muted hover:text-white transition-colors"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} YuanBridge. {t("footer.copy")}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-text-muted">
              {t("footer.tagline")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
