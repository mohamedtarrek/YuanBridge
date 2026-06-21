'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export default function NewStrategyPage() {
  const { lang, isRTL } = useLanguage();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    currencyPair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: '',
    stopLoss: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    risk: 'MEDIUM',
    riskPercent: '',
    riskReward: '',
    confidence: '75',
    status: 'DRAFT',
    isPremium: false,
    image: '',
    tags: '',
    categoryId: '',
    summary: '',
    summaryAr: '',
    trend: 'NEUTRAL',
    support1: '', support2: '', support3: '',
    resistance1: '', resistance2: '', resistance3: '',
    technicalAnalysis: '',
    technicalAnalysisAr: '',
    fundamentalAnalysis: '',
    fundamentalAnalysisAr: '',
    rsi: '', macdValue: '', macdSignal: '', macdHistogram: '',
    emaFast: '', emaSlow: '',
    smaPeriod: '', smaValue: '',
    atr: '', bbUpper: '', bbMiddle: '', bbLower: '',
    adx: '', cci: '',
    notes: '', notesAr: '',
    winRate: '',
    analysis: '',
    tradingRules: '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => { if (data.success) setCategories(data.categories); })
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !form.slug) {
      setForm(prev => ({ ...prev, slug: (value as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body: Record<string, unknown> = {
      ...form,
      entryPrice: parseFloat(form.entryPrice),
      stopLoss: parseFloat(form.stopLoss),
      takeProfit1: parseFloat(form.takeProfit1),
      takeProfit2: form.takeProfit2 ? parseFloat(form.takeProfit2) : null,
      takeProfit3: form.takeProfit3 ? parseFloat(form.takeProfit3) : null,
      riskPercent: form.riskPercent ? parseFloat(form.riskPercent) : null,
      riskReward: form.riskReward ? parseFloat(form.riskReward) : null,
      confidence: parseFloat(form.confidence),
      winRate: form.winRate ? parseFloat(form.winRate) : null,
      rsi: form.rsi ? parseFloat(form.rsi) : null,
      macdValue: form.macdValue ? parseFloat(form.macdValue) : null,
      macdSignal: form.macdSignal ? parseFloat(form.macdSignal) : null,
      macdHistogram: form.macdHistogram ? parseFloat(form.macdHistogram) : null,
      emaFast: form.emaFast ? parseFloat(form.emaFast) : null,
      emaSlow: form.emaSlow ? parseFloat(form.emaSlow) : null,
      smaPeriod: form.smaPeriod ? parseInt(form.smaPeriod) : null,
      smaValue: form.smaValue ? parseFloat(form.smaValue) : null,
      atr: form.atr ? parseFloat(form.atr) : null,
      bbUpper: form.bbUpper ? parseFloat(form.bbUpper) : null,
      bbMiddle: form.bbMiddle ? parseFloat(form.bbMiddle) : null,
      bbLower: form.bbLower ? parseFloat(form.bbLower) : null,
      adx: form.adx ? parseFloat(form.adx) : null,
      cci: form.cci ? parseFloat(form.cci) : null,
      support1: form.support1 ? parseFloat(form.support1) : null,
      support2: form.support2 ? parseFloat(form.support2) : null,
      support3: form.support3 ? parseFloat(form.support3) : null,
      resistance1: form.resistance1 ? parseFloat(form.resistance1) : null,
      resistance2: form.resistance2 ? parseFloat(form.resistance2) : null,
      resistance3: form.resistance3 ? parseFloat(form.resistance3) : null,
      categoryId: form.categoryId || null,
    };

    try {
      const res = await fetch('/api/admin/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === 'ar' ? 'تم إنشاء الاستراتيجية' : 'Strategy created');
        router.push(`/${lang}/admin/strategies`);
      } else {
        toast.error(data.errors ? Object.values(data.errors).flat().join(', ') : data.message);
      }
    } catch {
      toast.error('Failed to create strategy');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50 transition-colors';
  const labelClass = 'block text-text-dim text-xs font-medium mb-1.5';
  const sectionClass = 'glass rounded-2xl p-5 border border-border';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">
          {lang === 'ar' ? 'إنشاء استراتيجية جديدة' : 'Create New Strategy'}
        </h1>
        <p className="text-text-dim text-sm">
          {lang === 'ar' ? 'املأ جميع الحقول المطلوبة لإنشاء استراتيجية' : 'Fill in all required fields to create a strategy'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'العنوان' : 'Title'} *</label>
              <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
              <input type="text" value={form.titleAr} onChange={e => updateField('titleAr', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input type="text" value={form.slug} onChange={e => updateField('slug', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'زوج العملات' : 'Currency Pair'} *</label>
              <input type="text" value={form.currencyPair} onChange={e => updateField('currencyPair', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الاتجاه' : 'Direction'} *</label>
              <select value={form.direction} onChange={e => updateField('direction', e.target.value)} className={inputClass}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
              <select value={form.status} onChange={e => updateField('status', e.target.value)} className={inputClass}>
                <option value="DRAFT">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
                <option value="PUBLISHED">{lang === 'ar' ? 'منشور' : 'Published'}</option>
                <option value="FEATURED">{lang === 'ar' ? 'مميز' : 'Featured'}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
              <select value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)} className={inputClass}>
                <option value="">{lang === 'ar' ? 'بدون تصنيف' : 'No category'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="isPremium" checked={form.isPremium} onChange={e => updateField('isPremium', e.target.checked)} className="w-4 h-4 rounded border-border" />
              <label htmlFor="isPremium" className="text-text text-sm">{lang === 'ar' ? 'محتوى مميز' : 'Premium Content'}</label>
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'مستويات السعر' : 'Price Levels'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'سعر الدخول' : 'Entry Price'} *</label>
              <input type="number" step="0.00001" value={form.entryPrice} onChange={e => updateField('entryPrice', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'وقف الخسارة' : 'Stop Loss'} *</label>
              <input type="number" step="0.00001" value={form.stopLoss} onChange={e => updateField('stopLoss', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>TP 1 *</label>
              <input type="number" step="0.00001" value={form.takeProfit1} onChange={e => updateField('takeProfit1', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>TP 2</label>
              <input type="number" step="0.00001" value={form.takeProfit2} onChange={e => updateField('takeProfit2', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>TP 3</label>
              <input type="number" step="0.00001" value={form.takeProfit3} onChange={e => updateField('takeProfit3', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Risk & Confidence */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'المخاطرة والثقة' : 'Risk & Confidence'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'المخاطرة' : 'Risk'}</label>
              <select value={form.risk} onChange={e => updateField('risk', e.target.value)} className={inputClass}>
                <option value="LOW">{lang === 'ar' ? 'منخفضة' : 'Low'}</option>
                <option value="MEDIUM">{lang === 'ar' ? 'متوسطة' : 'Medium'}</option>
                <option value="HIGH">{lang === 'ar' ? 'عالية' : 'High'}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'نسبة المخاطرة %' : 'Risk %'}</label>
              <input type="number" step="0.1" value={form.riskPercent} onChange={e => updateField('riskPercent', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Risk/Reward</label>
              <input type="number" step="0.1" value={form.riskReward} onChange={e => updateField('riskReward', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الثقة %' : 'Confidence %'}</label>
              <input type="number" min="0" max="100" value={form.confidence} onChange={e => updateField('confidence', e.target.value)} className={inputClass} required />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'الوصف والتحليل' : 'Description & Analysis'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الوصف' : 'Description'}</label>
              <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
              <textarea value={form.descriptionAr} onChange={e => updateField('descriptionAr', e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الملخص' : 'Summary'}</label>
              <textarea value={form.summary} onChange={e => updateField('summary', e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الملخص (عربي)' : 'Summary (Arabic)'}</label>
              <textarea value={form.summaryAr} onChange={e => updateField('summaryAr', e.target.value)} rows={3} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{lang === 'ar' ? 'التحليل' : 'Analysis'}</label>
              <textarea value={form.analysis} onChange={e => updateField('analysis', e.target.value)} rows={5} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{lang === 'ar' ? 'قواعد التداول' : 'Trading Rules'}</label>
              <textarea value={form.tradingRules} onChange={e => updateField('tradingRules', e.target.value)} rows={5} className={`${inputClass} font-mono text-xs`} />
            </div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'التحليل الفني' : 'Technical Analysis'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التحليل الفني' : 'Technical Analysis'}</label>
              <textarea value={form.technicalAnalysis} onChange={e => updateField('technicalAnalysis', e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التحليل الفني (عربي)' : 'Technical Analysis (Arabic)'}</label>
              <textarea value={form.technicalAnalysisAr} onChange={e => updateField('technicalAnalysisAr', e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التحليل الأساسي' : 'Fundamental Analysis'}</label>
              <textarea value={form.fundamentalAnalysis} onChange={e => updateField('fundamentalAnalysis', e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التحليل الأساسي (عربي)' : 'Fundamental Analysis (Arabic)'}</label>
              <textarea value={form.fundamentalAnalysisAr} onChange={e => updateField('fundamentalAnalysisAr', e.target.value)} rows={4} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Support/Resistance & Indicators */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'المؤشرات الفنية' : 'Technical Indicators'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'rsi', label: 'RSI' },
              { key: 'macdValue', label: 'MACD Value' },
              { key: 'macdSignal', label: 'MACD Signal' },
              { key: 'macdHistogram', label: 'MACD Histogram' },
              { key: 'emaFast', label: 'EMA Fast' },
              { key: 'emaSlow', label: 'EMA Slow' },
              { key: 'smaPeriod', label: 'SMA Period' },
              { key: 'smaValue', label: 'SMA Value' },
              { key: 'atr', label: 'ATR' },
              { key: 'bbUpper', label: 'BB Upper' },
              { key: 'bbMiddle', label: 'BB Middle' },
              { key: 'bbLower', label: 'BB Lower' },
              { key: 'adx', label: 'ADX' },
              { key: 'cci', label: 'CCI' },
              { key: 'winRate', label: lang === 'ar' ? 'نسبة الربح' : 'Win Rate %' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input type="number" step="any" value={(form as any)[f.key]} onChange={e => updateField(f.key, e.target.value)} className={inputClass} />
              </div>
            ))}
          </div>
        </div>

        {/* Support/Resistance */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'الدعم والمقاومة' : 'Support & Resistance'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الاتجاه' : 'Trend'}</label>
              <select value={form.trend} onChange={e => updateField('trend', e.target.value)} className={inputClass}>
                <option value="BULLISH">Bullish</option>
                <option value="BEARISH">Bearish</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>
            <div></div>
            {['support1', 'support2', 'support3'].map(f => (
              <div key={f}>
                <label className={labelClass}>{lang === 'ar' ? `دعم ${f.slice(-1)}` : `Support ${f.slice(-1)}`}</label>
                <input type="number" step="0.00001" value={(form as any)[f]} onChange={e => updateField(f, e.target.value)} className={inputClass} />
              </div>
            ))}
            {['resistance1', 'resistance2', 'resistance3'].map(f => (
              <div key={f}>
                <label className={labelClass}>{lang === 'ar' ? `مقاومة ${f.slice(-1)}` : `Resistance ${f.slice(-1)}`}</label>
                <input type="number" step="0.00001" value={(form as any)[f]} onChange={e => updateField(f, e.target.value)} className={inputClass} />
              </div>
            ))}
          </div>
        </div>

        {/* Image & Tags */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'صور ووسوم' : 'Image & Tags'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</label>
              <input type="text" value={form.image} onChange={e => updateField('image', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الوسوم (مفصولة بفواصل)' : 'Tags (comma separated)'}</label>
              <input type="text" value={form.tags} onChange={e => updateField('tags', e.target.value)} className={inputClass} placeholder="forex, EUR/USD, breakout" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'ملاحظات' : 'Notes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
              <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'ملاحظات (عربي)' : 'Notes (Arabic)'}</label>
              <textarea value={form.notesAr} onChange={e => updateField('notesAr', e.target.value)} rows={3} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 justify-end">
          <a href={`/${lang}/admin/strategies`} className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </a>
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving
              ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
              : (lang === 'ar' ? 'إنشاء الاستراتيجية' : 'Create Strategy')}
          </button>
        </div>
      </form>
    </div>
  );
}
