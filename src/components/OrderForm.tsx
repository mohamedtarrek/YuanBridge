"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderFormData, ApiResponse } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { currencyOptions, getPaymentMethods, countries, getCountryName } from "@/lib/i18n/translations";

interface OrderFormProps {
  initialUrl?: string;
}

const shippingMethods = [
  { key: "shipping.method.air", value: "Air Freight" },
  { key: "shipping.method.sea", value: "Sea Freight" },
  { key: "shipping.method.express", value: "Express Courier (DHL, FedEx, UPS)" },
  { key: "shipping.method.ems", value: "EMS / China Post" },
];

const shippingSpeeds = [
  { key: "shipping.speed.economy", value: "Economy (15-25 business days)" },
  { key: "shipping.speed.standard", value: "Standard (10-15 business days)" },
  { key: "shipping.speed.express", value: "Express (5-10 business days)" },
  { key: "shipping.speed.premium", value: "Premium (3-7 business days)" },
];

const defaultForm: OrderFormData = {
  customer: {
    fullName: "",
    mobileNumber: "",
    whatsappNumber: "",
    country: "",
  },
  product: {
    url: "",
  },
  shipping: {
    method: "",
    speed: "",
  },
  payment: {
    currency: "",
    method: "",
  },
  additional: {
    notes: "",
  },
};

type StepErrors = Record<string, boolean>;

export default function OrderForm({ initialUrl = "" }: OrderFormProps) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState<OrderFormData>(() => ({
    ...defaultForm,
    product: { ...defaultForm.product, url: initialUrl },
  }));
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<StepErrors>({});
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) =>
    getCountryName(c.key, lang).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryName = form.customer.country
    ? getCountryName(
        countries.find((c) => c.code === form.customer.country)?.key || "",
        lang
      )
    : "";

  const selectedCountryFlag = form.customer.country
    ? countries.find((c) => c.code === form.customer.country)?.flag || ""
    : "";

  const updateField = <K extends keyof OrderFormData>(
    section: K,
    field: keyof OrderFormData[K],
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    const fieldKey = `${String(section)}.${String(field)}`;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
    if (section === "payment" && field === "currency") {
      setForm((prev) => ({
        ...prev,
        payment: { ...prev.payment, method: "" },
      }));
    }
  };

  const getValidationFields = (): string[] => {
    if (step === 1) {
      return [
        "customer.fullName",
        "customer.mobileNumber",
        "customer.whatsappNumber",
        "customer.country",
      ];
    }
    if (step === 2) {
      return ["product.url"];
    }
    if (step === 3) {
      return ["shipping.method", "shipping.speed", "payment.currency", "payment.method"];
    }
    return [];
  };

  const validateStep = (): boolean => {
    const fields = getValidationFields();
    const newErrors: StepErrors = {};
    let valid = true;

    for (const f of fields) {
      const [section, field] = f.split(".");
      const sectionData = form[section as keyof OrderFormData] as Record<string, unknown>;
      const value = sectionData?.[field] as string | number | undefined;
      if (!value || (typeof value === "number" && value < 1) || (typeof value === "string" && !value.trim())) {
        newErrors[f] = true;
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handlePrev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: ApiResponse = await res.json();
      setSubmitResult(data);
      if (data.success) {
        setForm(defaultForm);
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) => errors[key] || false;

  const inputClass = (fieldKey: string, base = "input-field") =>
    `${base} ${err(fieldKey) ? "!border-red-500 !ring-red-500/20" : ""}`;

  const paymentMethods = getPaymentMethods(form.payment.currency, lang);

  if (submitResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 md:p-14 max-w-lg w-full text-center"
        >
          {submitResult.success ? (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t("success.title")}
              </h2>
              <p className="text-text-muted mb-8">
                {t("success.desc")}
              </p>
              <a href="/" className="btn-secondary">
                {t("success.cta")}
              </a>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t("error.title")}
              </h2>
              <p className="text-text-muted mb-8">{submitResult.message}</p>
              <button onClick={() => setSubmitResult(null)} className="btn-secondary">
                {t("error.retry")}
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: t("form.step1") },
    { num: 2, label: t("form.step2") },
    { num: 3, label: t("form.step3") },
    { num: 4, label: t("form.step4") },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 md:pb-16 px-3 md:px-4">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-1 md:gap-4 mb-8 md:mb-10 flex-wrap">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`min-touch gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-all text-xs md:text-base ${
                   s.num === step
                     ? "gradient-bg text-white"
                     : s.num < step
                     ? "bg-primary-500/20 text-primary-300 cursor-pointer"
                     : "bg-surface-lighter/30 text-text-muted cursor-default"
                 }`}
               >
                 <span
                   className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                     s.num === step
                       ? "bg-white/20"
                       : s.num < step
                       ? "bg-primary-500/30"
                       : "bg-surface-lighter"
                   }`}
                 >
                   {s.num < step ? (
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                   ) : (
                     s.num
                   )}
                 </span>
                 <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                  <div
                    className={`w-3 md:w-10 h-px mx-0.5 md:mx-1 ${
                      s.num < step ? "bg-primary-500" : "bg-surface-lighter"
                    }`}
                  />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
                  {t("form.customer.title")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-1.5 md:mb-2">{t("form.customer.name")} *</label>
                    <input
                      className={inputClass("customer.fullName")}
                      placeholder={t("placeholder.name")}
                      value={form.customer.fullName}
                      onChange={(e) => updateField("customer", "fullName", e.target.value)}
                    />
                    {err("customer.fullName") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5 md:mb-2">{t("form.customer.mobile")} *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className={inputClass("customer.mobileNumber")}
                      placeholder={t("placeholder.mobile")}
                      value={form.customer.mobileNumber}
                      onChange={(e) => updateField("customer", "mobileNumber", e.target.value)}
                    />
                    {err("customer.mobileNumber") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5 md:mb-2">{t("form.customer.whatsapp")} *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className={inputClass("customer.whatsappNumber")}
                      placeholder={t("placeholder.whatsapp")}
                      value={form.customer.whatsappNumber}
                      onChange={(e) => updateField("customer", "whatsappNumber", e.target.value)}
                    />
                    {err("customer.whatsappNumber") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div ref={countryRef} className="relative">
                    <label className="block text-sm font-medium text-text-muted mb-1.5 md:mb-2">{t("form.customer.country")} *</label>
                    <button
                      type="button"
                      onClick={() => setCountryOpen(!countryOpen)}
                      className={`input-field w-full flex items-center gap-3 cursor-pointer ${err("customer.country") ? "!border-red-500 !ring-red-500/20" : ""}`}
                    >
                      {selectedCountryFlag ? (
                        <>
                          <span className="text-xl leading-none">{selectedCountryFlag}</span>
                          <span className="text-white">{selectedCountryName}</span>
                        </>
                      ) : (
                        <span className="text-text-muted">{t("placeholder.select")}</span>
                      )}
                      <svg
                        className={`w-4 h-4 ms-auto text-text-muted transition-transform ${countryOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {err("customer.country") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                    {countryOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-surface-lighter bg-[#0f1428] shadow-2xl overflow-hidden">
                        <div className="p-2 border-b border-surface-lighter">
                          <input
                            className="input-field w-full text-sm !py-2"
                            placeholder={t("placeholder.country")}
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-text-muted text-center">
                              {lang === "ar" ? "لا توجد نتائج" : "No results found"}
                            </div>
                          ) : (
                            filteredCountries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  updateField("customer", "country", c.code);
                                  setCountryOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-primary-500/10 ${
                                  form.customer.country === c.code ? "bg-primary-500/15 text-primary-300" : "text-white"
                                }`}
                              >
                                <span className="text-xl leading-none">{c.flag}</span>
                                <span>{getCountryName(c.key, lang)}</span>
                                {form.customer.country === c.code && (
                                  <svg className="w-4 h-4 ms-auto text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6 md:mt-8">
                  <button onClick={handleNext} className="btn-primary">
                    {t("form.next")}
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
                  {t("form.product.title")}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.product.url")} *</label>
                    <input
                      className={inputClass("product.url")}
                      placeholder={t("placeholder.url")}
                      value={form.product.url}
                      onChange={(e) => updateField("product", "url", e.target.value)}
                    />
                    {err("product.url") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                </div>
                <div className="flex justify-between mt-6 md:mt-8 gap-3">
                  <button onClick={handlePrev} className="btn-secondary">
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    {t("form.back")}
                  </button>
                  <button onClick={handleNext} className="btn-primary">
                    {t("form.next")}
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
                  {t("form.shipping.title")} &amp; {t("form.payment.title")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.shipping.method")} *</label>
                    <select
                      className={inputClass("shipping.method")}
                      value={form.shipping.method}
                      onChange={(e) => updateField("shipping", "method", e.target.value)}
                    >
                      <option value="">{t("placeholder.select")}</option>
                      {shippingMethods.map((m) => (
                        <option key={m.value} value={m.value}>{t(m.key)}</option>
                      ))}
                    </select>
                    {err("shipping.method") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.shipping.speed")} *</label>
                    <select
                      className={inputClass("shipping.speed")}
                      value={form.shipping.speed}
                      onChange={(e) => updateField("shipping", "speed", e.target.value)}
                    >
                      <option value="">{t("placeholder.select")}</option>
                      {shippingSpeeds.map((s) => (
                        <option key={s.value} value={s.value}>{t(s.key)}</option>
                      ))}
                    </select>
                    {err("shipping.speed") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.payment.currency")} *</label>
                    <select
                      className={inputClass("payment.currency")}
                      value={form.payment.currency}
                      onChange={(e) => updateField("payment", "currency", e.target.value)}
                    >
                      <option value="">{t("placeholder.select")}</option>
                      {currencyOptions.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.key)}</option>
                      ))}
                    </select>
                    {err("payment.currency") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.payment.method")} *</label>
                    <select
                      className={inputClass("payment.method")}
                      value={form.payment.method}
                      onChange={(e) => updateField("payment", "method", e.target.value)}
                      disabled={!form.payment.currency}
                    >
                      <option value="">{t("placeholder.select")}</option>
                      {paymentMethods.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {err("payment.method") && <p className="text-red-400 text-xs mt-1">{t("form.required")}</p>}
                    {!form.payment.currency && (
                      <p className="text-text-muted text-xs mt-1">{lang === "ar" ? "اختر العملة أولاً" : "Select currency first"}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-2">{t("form.additional.notes")}</label>
                    <textarea
                      className="input-field"
                      placeholder={t("placeholder.notes")}
                      value={form.additional.notes}
                      onChange={(e) => updateField("additional", "notes", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-6 md:mt-8 gap-3">
                  <button onClick={handlePrev} className="btn-secondary">
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    {t("form.back")}
                  </button>
                  <button onClick={handleNext} className="btn-primary">
                    {t("form.review")}
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
                  {t("form.step5")}
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">{t("review.customer")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                      <div><span className="text-text-muted">{t("form.customer.name")}:</span> <span className="text-white">{form.customer.fullName}</span></div>
                      <div><span className="text-text-muted">{t("form.customer.mobile")}:</span> <span className="text-white" dir="ltr">{form.customer.mobileNumber}</span></div>
                      <div><span className="text-text-muted">{t("form.customer.whatsapp")}:</span> <span className="text-white" dir="ltr">{form.customer.whatsappNumber}</span></div>
                      <div><span className="text-text-muted">{t("form.customer.country")}:</span> <span className="text-white">{selectedCountryFlag} {selectedCountryName}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">{t("review.product")}</h3>
                    <div className="grid grid-cols-1 gap-2 md:gap-3 text-sm">
                      <div><span className="text-text-muted">{t("form.product.url")}:</span> <span className="text-white break-all text-xs md:text-sm">{form.product.url}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">{t("review.shipping")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                      <div><span className="text-text-muted">{t("form.shipping.method")}:</span> <span className="text-white">{form.shipping.method}</span></div>
                      <div><span className="text-text-muted">{t("form.shipping.speed")}:</span> <span className="text-white">{form.shipping.speed}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">{t("review.payment")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                      <div><span className="text-text-muted">{t("form.payment.currency")}:</span> <span className="text-white">{form.payment.currency}</span></div>
                      <div><span className="text-text-muted">{t("form.payment.method")}:</span> <span className="text-white">{form.payment.method}</span></div>
                    </div>
                  </div>

                  {form.additional.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3">{t("review.additional")}</h3>
                      <p className="text-sm text-white whitespace-pre-wrap">{form.additional.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6 md:mt-10 gap-3">
                  <button onClick={handlePrev} className="btn-secondary">
                    <svg className="w-4 h-4 md:w-5 md:h-5 rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    {t("form.edit")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t("form.submitting")}
                      </span>
                    ) : (
                      <>
                        {t("form.submit")}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
