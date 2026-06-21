'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export default function EditStrategyPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()),
      fetch(`/api/admin/strategies/${id}`).then(r => r.json()),
    ]).then(([catData, stratData]) => {
      if (catData.success) setCategories(catData.categories);
      if (stratData.success) {
        const s = stratData.strategy;
        setForm({
          title: s.title || '',
          titleAr: s.titleAr || '',
          slug: s.slug || '',
          description: s.description || '',
          descriptionAr: s.descriptionAr || '',
          currencyPair: s.currencyPair || 'EUR/USD',
          direction: s.direction || 'BUY',
          entryPrice: String(s.entryPrice || ''),
          stopLoss: String(s.stopLoss || ''),
          takeProfit1: String(s.takeProfit1 || ''),
          takeProfit2: String(s.takeProfit2 || ''),
          takeProfit3: String(s.takeProfit3 || ''),
          risk: s.risk || 'MEDIUM',
          riskPercent: String(s.riskPercent || ''),
          riskReward: String(s.riskReward || ''),
          confidence: String(s.confidence || '75'),
          status: s.status || 'DRAFT',
          isPremium: s.isPremium || false,
          image: s.image || '',
          tags: s.tags || '',
          categoryId: s.categoryId || '',
          summary: s.summary || '',
          summaryAr: s.summaryAr || '',
          trend: s.trend || 'NEUTRAL',
          support1: String(s.support1 || ''),
          support2: String(s.support2 || ''),
          support3: String(s.support3 || ''),
          resistance1: String(s.resistance1 || ''),
          resistance2: String(s.resistance2 || ''),
          resistance3: String(s.resistance3 || ''),
          technicalAnalysis: s.technicalAnalysis || '',
          technicalAnalysisAr: s.technicalAnalysisAr || '',
          fundamentalAnalysis: s.fundamentalAnalysis || '',
          fundamentalAnalysisAr: s.fundamentalAnalysisAr || '',
          rsi: String(s.rsi || ''),
          macdValue: String(s.macdValue || ''),
          macdSignal: String(s.macdSignal || ''),
          macdHistogram: String(s.macdHistogram || ''),
          emaFast: String(s.emaFast || ''),
          emaSlow: String(s.emaSlow || ''),
          smaPeriod: String(s.smaPeriod || ''),
          smaValue: String(s.smaValue || ''),
          atr: String(s.atr || ''),
          bbUpper: String(s.bbUpper || ''),
          bbMiddle: String(s.bbMiddle || ''),
          bbLower: String(s.bbLower || ''),
          adx: String(s.adx || ''),
          cci: String(s.cci || ''),
          notes: s.notes || '',
          notesAr: s.notesAr || '',
          winRate: String(s.winRate || ''),
          analysis: s.analysis || '',
          tradingRules: s.tradingRules || '',
        });
      }
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(form)) {
      if (['entryPrice', 'stopLoss', 'takeProfit1', 'takeProfit2', 'takeProfit3', 'riskPercent', 'riskReward', 'confidence', 'winRate', 'rsi', 'macdValue', 'macdSignal', 'macdHistogram', 'emaFast', 'emaSlow', 'smaValue', 'atr', 'bbUpper', 'bbMiddle', 'bbLower', 'adx', 'cci', 'support1', 'support2', 'support3', 'resistance1', 'resistance2', 'resistance3'].includes(key)) {
        body[key] = val ? parseFloat(val as string) : null;
      } else if (key === 'smaPeriod') {
        body[key] = val ? parseInt(val as string) : null;
      } else {
        body[key] = val;
      }
    }

    try {
      const res = await fetch(`/api/admin/strategies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
        router.push(`/${lang}/admin/strategies`);
      } else {
        toast.error(data.errors ? Object.values(data.errors).flat().join(', ') : data.message);
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50 transition-colors';
  const labelClass = 'block text-text-dim text-xs font-medium mb-1.5';
  const sectionClass = 'glass rounded-2xl p-5 border border-border';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">
          {lang === 'ar' ? 'تعديل الاستراتيجية' : 'Edit Strategy'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}</h2>
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
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="FEATURED">Featured</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
              <select value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)} className={inputClass}>
                <option value="">{lang === 'ar' ? 'بدون تصنيف' : 'No category'}</option>
                {categories.map((c: Category) => (
                  <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="isPremium" checked={form.isPremium} onChange={e => updateField('isPremium', e.target.checked)} className="w-4 h-4 rounded border-border" />
              <label htmlFor="isPremium" className="text-text text-sm">{lang === 'ar' ? 'محتوى مميز' : 'Premium'}</label>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'مستويات السعر' : 'Price Levels'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'سعر الدخول' : 'Entry'} *</label>
              <input type="number" step="0.00001" value={form.entryPrice} onChange={e => updateField('entryPrice', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>SL *</label>
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

        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'المخاطرة والثقة' : 'Risk & Confidence'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'المخاطرة' : 'Risk'}</label>
              <select value={form.risk} onChange={e => updateField('risk', e.target.value)} className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Risk %</label>
              <input type="number" value={form.riskPercent} onChange={e => updateField('riskPercent', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>R/R</label>
              <input type="number" step="0.1" value={form.riskReward} onChange={e => updateField('riskReward', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'ar' ? 'الثقة' : 'Confidence'} *</label>
              <input type="number" value={form.confidence} onChange={e => updateField('confidence', e.target.value)} className={inputClass} required />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <a href={`/${lang}/admin/strategies`} className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</a>
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
