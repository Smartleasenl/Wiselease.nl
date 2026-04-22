// src/pages/admin/FooterBeheer.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, CheckCircle, AlertCircle, Eye, EyeOff, Rows3, LayoutGrid, Type, Phone } from 'lucide-react';

interface Settings { [key: string]: string }

const TOGGLE_ITEMS = [
  {
    key: 'footer_show_usp_balk',
    label: 'USP balk',
    desc: 'De groene balk met "Volledig verzekerd advies", "Binnen 24 uur" etc.',
    icon: Rows3,
  },
  {
    key: 'footer_show_reviews_badge',
    label: 'Reviews badge',
    desc: 'De 4,9 sterren badge naast het logo.',
    icon: CheckCircle,
  },
  {
    key: 'footer_show_whatsapp',
    label: 'WhatsApp link',
    desc: 'WhatsApp contactregel in de footer.',
    icon: Phone,
  },
  {
    key: 'footer_show_email',
    label: 'E-mail link',
    desc: 'E-mail contactregel in de footer.',
    icon: Phone,
  },
  {
    key: 'footer_show_aanbod',
    label: 'Kolom: Ons aanbod',
    desc: 'De kolom met leaseaanbod links (calculator, occasions, etc.).',
    icon: LayoutGrid,
  },
  {
    key: 'footer_show_financial_lease',
    label: 'Kolom: Financial Lease',
    desc: 'De kolom met alle Financial Lease subpagina links (dynamisch).',
    icon: LayoutGrid,
  },
  {
    key: 'footer_show_meer_informatie',
    label: 'Kolom: Meer informatie',
    desc: 'De kolom met alle Meer informatie subpagina links (dynamisch).',
    icon: LayoutGrid,
  },
  {
    key: 'footer_show_cta_blok',
    label: 'CTA blokje "Gratis offerte?"',
    desc: 'Het groene blokje met offerte-knop onderin de Meer informatie kolom.',
    icon: Type,
  },
];

const TEXT_ITEMS = [
  {
    key: 'footer_tagline',
    label: 'Tagline onder logo',
    placeholder: 'Slimmer leasen begint hier...',
    multiline: true,
  },
  {
    key: 'footer_openingstijden',
    label: 'Openingstijden',
    placeholder: 'Ma-Vr 9:00 – 18:00 | Za 10:00 – 14:00',
    multiline: false,
  },
];

export default function FooterBeheer() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'footer%');
    const map: Settings = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    setSettings(map);
    setLoading(false);
  }

  function get(key: string, fallback = '') {
    return settings[key] ?? fallback;
  }

  function isOn(key: string) {
    return get(key, 'true') !== 'false';
  }

  function toggle(key: string) {
    setSettings(prev => ({ ...prev, [key]: prev[key] === 'false' ? 'true' : 'false' }));
    setDirty(true);
  }

  function setText(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      );
      await Promise.all(updates);
      showToast('Instellingen opgeslagen ✓');
      setDirty(false);
    } catch {
      showToast('Fout bij opslaan', 'error');
    }
    setSaving(false);
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-smartlease-yellow rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${
          toast.type === 'success' ? 'bg-smartlease-yellow' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer beheer</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bepaal wat er wel en niet getoond wordt in de footer</p>
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-5 py-2.5 bg-smartlease-yellow text-white text-sm font-bold rounded-xl hover:bg-smartlease-yellow/90 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Opslaan...' : dirty ? 'Opslaan' : 'Opgeslagen'}
        </button>
      </div>

      {/* Preview link */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-smartlease-yellow font-semibold mb-8 hover:underline"
      >
        <Eye className="h-4 w-4" /> Bekijk footer op de website →
      </a>

      {/* Tekst instellingen */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-700">Teksten</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {TEXT_ITEMS.map(item => (
            <div key={item.key} className="px-6 py-5">
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{item.label}</label>
              {item.multiline ? (
                <textarea
                  value={get(item.key)}
                  onChange={e => setText(item.key, e.target.value)}
                  rows={3}
                  placeholder={item.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow resize-none"
                />
              ) : (
                <input
                  value={get(item.key)}
                  onChange={e => setText(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toggle instellingen */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-700">Zichtbaarheid secties</h2>
          <p className="text-xs text-gray-400 mt-0.5">Zet aan of uit welke onderdelen in de footer verschijnen</p>
        </div>
        <div className="divide-y divide-gray-50">
          {TOGGLE_ITEMS.map(item => {
            const on = isOn(item.key);
            return (
              <div
                key={item.key}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition cursor-pointer"
                onClick={() => toggle(item.key)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-sm font-semibold ${on ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-xs font-semibold ${on ? 'text-smartlease-yellow' : 'text-gray-400'}`}>
                    {on ? 'Aan' : 'Uit'}
                  </span>
                  {on
                    ? <Eye className="h-4 w-4 text-smartlease-yellow" />
                    : <EyeOff className="h-4 w-4 text-gray-300" />
                  }
                  {/* Toggle switch */}
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-smartlease-yellow' : 'bg-gray-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs text-blue-600 font-semibold mb-1">ℹ️ Kolommen zijn dynamisch</p>
        <p className="text-xs text-blue-500 leading-relaxed">
          De Financial Lease en Meer informatie kolommen tonen automatisch alle gepubliceerde subpagina's.
          Wil je bepaalde links toevoegen of verwijderen? Beheer dat via <strong>Pagina beheer</strong>.
        </p>
      </div>

      {/* Opslaan onderaan */}
      {dirty && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-smartlease-yellow text-white font-bold rounded-xl hover:bg-smartlease-yellow/90 transition disabled:opacity-60 shadow-md"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
          </button>
        </div>
      )}
    </div>
  );
}