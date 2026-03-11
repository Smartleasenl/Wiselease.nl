// src/pages/admin/ReviewsBeheer.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Star, Trash2, Eye, EyeOff, Save, Plus,
  Sparkles, CheckCircle, AlertCircle, Loader2,
  X, ChevronDown, ChevronUp, GripVertical, PenLine
} from 'lucide-react';

interface Review {
  id: string;
  naam: string;
  bedrijf: string;
  sterren: number;
  tekst: string;
  datum: string;
  is_published: boolean;
  sort_order: number;
}

const EMPTY_REVIEW = {
  naam: '', bedrijf: '', sterren: 5, tekst: '',
  datum: new Date().toISOString().split('T')[0],
  is_published: true, sort_order: 0
};

export default function ReviewsBeheer() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // AI bulk import
  const [bulkText, setBulkText]     = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiPreview, setAiPreview]   = useState<Omit<Review, 'id'>[] | null>(null);
  const [bulkOpen, setBulkOpen]     = useState(true);

  // Handmatig formulier
  const [form, setForm]     = useState(EMPTY_REVIEW);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  async function fetchReviews() {
    setLoading(true);
    const { data } = await supabase
      .from('reviews').select('*')
      .order('sort_order').order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── AI IMPORT via Edge Function ────────────────────────────────────────────
  async function runAiImport() {
    if (!bulkText.trim()) return;
    setAiLoading(true);
    setAiPreview(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await supabase.functions.invoke('parse-reviews', {
        body: { text: bulkText },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.error) throw new Error(res.error.message);

      const { reviews: parsed, error: fnError } = res.data;
      if (fnError) throw new Error(fnError);
      if (!Array.isArray(parsed)) throw new Error('Geen reviews ontvangen');

      const today = new Date().toISOString().split('T')[0];
      const withDefaults = parsed.map((r: any, i: number) => ({
        naam:         r.naam        || 'Onbekend',
        bedrijf:      r.bedrijf     || '',
        sterren:      Math.min(5, Math.max(1, parseInt(r.sterren) || 5)),
        tekst:        r.tekst       || '',
        datum:        r.datum       || today,
        is_published: true,
        sort_order:   i,
      }));

      setAiPreview(withDefaults);
    } catch (e: any) {
      showToast('AI fout: ' + (e.message || 'Onbekende fout'), 'error');
    }
    setAiLoading(false);
  }

  async function saveAiPreview() {
    if (!aiPreview) return;
    setSaving(true);
    const { error } = await supabase.from('reviews').insert(aiPreview);
    if (error) {
      showToast('Fout bij opslaan: ' + error.message, 'error');
    } else {
      showToast(`${aiPreview.length} reviews opgeslagen ✓`);
      setAiPreview(null);
      setBulkText('');
      await fetchReviews();
    }
    setSaving(false);
  }

  // ── HANDMATIG ─────────────────────────────────────────────────────────────
  function startEdit(r: Review) {
    setForm({ naam: r.naam, bedrijf: r.bedrijf, sterren: r.sterren, tekst: r.tekst, datum: r.datum, is_published: r.is_published, sort_order: r.sort_order });
    setEditId(r.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveForm() {
    if (!form.naam || !form.tekst) { showToast('Naam en tekst zijn verplicht', 'error'); return; }
    setSaving(true);
    if (editId) {
      await supabase.from('reviews').update(form).eq('id', editId);
    } else {
      await supabase.from('reviews').insert([form]);
    }
    showToast(editId ? 'Review bijgewerkt ✓' : 'Review toegevoegd ✓');
    setForm(EMPTY_REVIEW); setEditId(null); setFormOpen(false);
    await fetchReviews();
    setSaving(false);
  }

  async function togglePublished(r: Review) {
    await supabase.from('reviews').update({ is_published: !r.is_published }).eq('id', r.id);
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, is_published: !x.is_published } : x));
  }

  async function deleteReview(id: string) {
    if (!confirm('Review verwijderen?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(x => x.id !== id));
    showToast('Verwijderd');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${
          toast.type === 'success' ? 'bg-smartlease-yellow' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews beheer</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reviews.length} reviews in de database</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_REVIEW); setEditId(null); setFormOpen(o => !o); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-smartlease-yellow text-white text-sm font-bold rounded-xl hover:bg-smartlease-yellow/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Review toevoegen
        </button>
      </div>

      {/* ── AI BULK IMPORT ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
          onClick={() => setBulkOpen(o => !o)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">AI Bulk import</p>
              <p className="text-xs text-gray-400">Plak al je Google reviews — AI verwerkt ze automatisch</p>
            </div>
          </div>
          {bulkOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {bulkOpen && (
          <div className="px-6 pb-6 border-t border-gray-50">
            <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-purple-700 font-semibold mb-2">📋 Zo werkt het:</p>
              <ol className="text-xs text-purple-600 space-y-1.5 list-decimal list-inside">
                <li>Ga naar <strong>Google Maps</strong> → zoek je bedrijf → klik op "Reviews"</li>
                <li>Scroll naar beneden zodat alle reviews geladen zijn</li>
                <li>Selecteer alle tekst op de pagina (<strong>Ctrl+A</strong>) → kopieer (<strong>Ctrl+C</strong>)</li>
                <li>Plak hieronder (<strong>Ctrl+V</strong>) → klik "Verwerk met AI"</li>
              </ol>
            </div>

            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="Plak hier de gekopieerde tekst van je Google reviews pagina..."
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none font-mono"
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={runAiImport}
                disabled={aiLoading || !bulkText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Verwerken...</>
                  : <><Sparkles className="h-4 w-4" /> Verwerk met AI</>
                }
              </button>
              {bulkText && (
                <button onClick={() => { setBulkText(''); setAiPreview(null); }}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Wissen
                </button>
              )}
            </div>

            {/* AI Preview */}
            {aiPreview && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">
                    ✅ {aiPreview.length} reviews gevonden — controleer en sla op
                  </p>
                  <button
                    onClick={saveAiPreview}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-smartlease-yellow text-white text-sm font-bold rounded-lg hover:bg-smartlease-yellow/90 transition disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Opslaan...' : `Alle ${aiPreview.length} opslaan`}
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {aiPreview.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="font-semibold text-sm text-gray-900">{r.naam}</span>
                          {r.bedrijf && <span className="text-xs text-gray-400 ml-2">— {r.bedrijf}</span>}
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= r.sterren ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{r.tekst}</p>
                      <p className="text-xs text-gray-400 mt-1">{r.datum}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── HANDMATIG FORMULIER ── */}
      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-5 text-sm">
            {editId ? 'Review bewerken' : 'Review handmatig toevoegen'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Naam *</label>
              <input value={form.naam} onChange={e => setForm(p => ({ ...p, naam: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                placeholder="Jan de Vries" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bedrijf</label>
              <input value={form.bedrijf} onChange={e => setForm(p => ({ ...p, bedrijf: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                placeholder="Optioneel" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sterren</label>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setForm(p => ({ ...p, sterren: s }))}>
                    <Star className={`h-7 w-7 transition-colors ${s <= form.sterren ? 'fill-amber-400 text-amber-400' : 'text-gray-200 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Datum</label>
              <input type="date" value={form.datum} onChange={e => setForm(p => ({ ...p, datum: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Review tekst *</label>
            <textarea value={form.tekst} onChange={e => setForm(p => ({ ...p, tekst: e.target.value }))}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow resize-none"
              placeholder="Wat schreef de klant?" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-smartlease-yellow' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-gray-600">Gepubliceerd</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setFormOpen(false); setEditId(null); setForm(EMPTY_REVIEW); }}
                className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">
                Annuleren
              </button>
              <button onClick={saveForm} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-smartlease-yellow text-white text-sm font-bold rounded-lg hover:bg-smartlease-yellow/90 transition disabled:opacity-60">
                <Save className="h-3.5 w-3.5" /> {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEWS LIJST ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Nog geen reviews.</p>
          <p className="text-gray-300 text-xs mt-1">Gebruik de AI import hierboven om snel te starten!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {reviews.filter(r => r.is_published).length} gepubliceerd · {reviews.filter(r => !r.is_published).length} verborgen
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {reviews.map(r => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/50 transition group">
                <GripVertical className="h-4 w-4 text-gray-200 flex-shrink-0 mt-2" />
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white mt-0.5"
                  style={{ background: `hsl(${r.naam.charCodeAt(0) * 7 % 360}, 55%, 48%)` }}>
                  {r.naam.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">{r.naam}</span>
                    {r.bedrijf && <span className="text-xs text-gray-400">— {r.bedrijf}</span>}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= r.sterren ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    {!r.is_published && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">Verborgen</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{r.tekst}</p>
                  <p className="text-[11px] text-gray-300 mt-1">
                    {new Date(r.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                  <button onClick={() => togglePublished(r)} title={r.is_published ? 'Verbergen' : 'Publiceren'}
                    className="p-2 hover:bg-gray-100 rounded-lg transition">
                    {r.is_published ? <Eye className="h-4 w-4 text-smartlease-yellow" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button onClick={() => startEdit(r)} title="Bewerken"
                    className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-500">
                    <PenLine className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteReview(r.id)} title="Verwijderen"
                    className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}