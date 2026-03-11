// src/pages/admin/FaqBeheer.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, Save, CheckCircle, AlertCircle,
  Loader2, ChevronDown, ChevronUp, GripVertical,
  Eye, EyeOff, PenLine, X
} from 'lucide-react';

interface Faq {
  id: string;
  vraag: string;
  antwoord: string;
  categorie: string;
  sort_order: number;
  is_published: boolean;
}

const EMPTY: Omit<Faq, 'id'> = {
  vraag: '', antwoord: '', categorie: 'Algemeen', sort_order: 0, is_published: true
};

const CATEGORIEEN = ['Algemeen', 'Financieel', 'Contract', 'Aanbod', 'Proces'];

export default function FaqBeheer() {
  const [faqs, setFaqs]       = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchFaqs(); }, []);

  async function fetchFaqs() {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('sort_order').order('created_at');
    setFaqs((data as Faq[]) || []);
    setLoading(false);
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function startEdit(f: Faq) {
    setForm({ vraag: f.vraag, antwoord: f.antwoord, categorie: f.categorie, sort_order: f.sort_order, is_published: f.is_published });
    setEditId(f.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY); setEditId(null); setFormOpen(false);
  }

  async function saveFaq() {
    if (!form.vraag || !form.antwoord) { showToast('Vraag en antwoord zijn verplicht', 'error'); return; }
    setSaving(true);
    if (editId) {
      await supabase.from('faqs').update(form).eq('id', editId);
    } else {
      const maxOrder = faqs.length ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 0;
      await supabase.from('faqs').insert([{ ...form, sort_order: maxOrder }]);
    }
    showToast(editId ? 'FAQ bijgewerkt ✓' : 'FAQ toegevoegd ✓');
    resetForm();
    await fetchFaqs();
    setSaving(false);
  }

  async function togglePublished(f: Faq) {
    await supabase.from('faqs').update({ is_published: !f.is_published }).eq('id', f.id);
    setFaqs(prev => prev.map(x => x.id === f.id ? { ...x, is_published: !x.is_published } : x));
  }

  async function deleteFaq(id: string) {
    if (!confirm('FAQ verwijderen?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    setFaqs(prev => prev.filter(x => x.id !== id));
    showToast('Verwijderd');
  }

  // Groepeer per categorie
  const grouped = CATEGORIEEN.reduce((acc, cat) => {
    const items = faqs.filter(f => f.categorie === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Faq[]>);
  const overig = faqs.filter(f => !CATEGORIEEN.includes(f.categorie));
  if (overig.length) grouped['Overig'] = overig;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

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
          <h1 className="text-2xl font-bold text-gray-900">FAQ beheer</h1>
          <p className="text-sm text-gray-500 mt-0.5">{faqs.length} vragen · {faqs.filter(f => f.is_published).length} gepubliceerd</p>
        </div>
        <button
          onClick={() => { resetForm(); setFormOpen(o => !o); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-smartlease-yellow text-white text-sm font-bold rounded-xl hover:bg-smartlease-yellow/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Vraag toevoegen
        </button>
      </div>

      {/* Formulier */}
      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-sm">{editId ? 'FAQ bewerken' : 'Nieuwe FAQ'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categorie</label>
            <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow bg-white">
              {CATEGORIEEN.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Vraag *</label>
            <input value={form.vraag} onChange={e => setForm(p => ({ ...p, vraag: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
              placeholder="Kan ik leasen met een BKR-registratie?" />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Antwoord *</label>
            <textarea value={form.antwoord} onChange={e => setForm(p => ({ ...p, antwoord: e.target.value }))}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow resize-none"
              placeholder="Het antwoord op de vraag..." />
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
              <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Annuleren</button>
              <button onClick={saveFaq} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-smartlease-yellow text-white text-sm font-bold rounded-lg hover:bg-smartlease-yellow/90 transition disabled:opacity-60">
                <Save className="h-3.5 w-3.5" /> {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ lijst */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{cat}</span>
                <span className="text-xs text-gray-400">{items.length} vragen</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(f => (
                  <div key={f.id} className="group">
                    <div
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition cursor-pointer"
                      onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                    >
                      <GripVertical className="h-4 w-4 text-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${f.is_published ? 'text-gray-900' : 'text-gray-400'}`}>
                          {f.vraag}
                        </p>
                      </div>
                      {!f.is_published && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Verborgen</span>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => togglePublished(f)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                          {f.is_published ? <Eye className="h-3.5 w-3.5 text-smartlease-yellow" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                        <button onClick={() => startEdit(f)} className="p-1.5 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-500">
                          <PenLine className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteFaq(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {expanded === f.id ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    {expanded === f.id && (
                      <div className="px-5 pb-4 pt-1 bg-gray-50/50 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">{f.antwoord}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}