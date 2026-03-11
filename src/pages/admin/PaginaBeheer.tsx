// src/pages/admin/PaginaBeheer.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Pencil, Trash2, Save, X, Eye, EyeOff,
  ChevronDown, ChevronUp, Globe, FileText, Search,
  CheckCircle, AlertCircle, GripVertical
} from 'lucide-react';

interface Section {
  heading: string;
  text: string;
}

interface Page {
  id: string;
  slug: string;
  parent_slug: string;
  menu_label: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  intro: string;
  content: Section[];
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  sort_order: number;
}

const EMPTY_PAGE: Omit<Page, 'id'> = {
  slug: '',
  parent_slug: 'financial-lease',
  menu_label: '',
  title: '',
  subtitle: '',
  hero_image_url: '',
  intro: '',
  content: [
    { heading: '', text: '' },
    { heading: '', text: '' },
    { heading: '', text: '' },
    { heading: '', text: '' },
  ],
  meta_title: '',
  meta_description: '',
  is_published: true,
  sort_order: 0,
};

const PARENT_OPTIONS = [
  { value: 'financial-lease', label: 'Financial Lease' },
  { value: 'meer-informatie', label: 'Meer informatie' },
];

export default function PaginaBeheer() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Page, 'id'>>(EMPTY_PAGE);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParent, setFilterParent] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { fetchPages(); }, []);

  async function fetchPages() {
    setLoading(true);
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('parent_slug')
      .order('sort_order');
    setPages(data as Page[] || []);
    setLoading(false);
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function startEdit(page: Page) {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      parent_slug: page.parent_slug,
      menu_label: page.menu_label,
      title: page.title,
      subtitle: page.subtitle,
      hero_image_url: page.hero_image_url,
      intro: page.intro,
      content: page.content?.length ? page.content : EMPTY_PAGE.content,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      is_published: page.is_published,
      sort_order: page.sort_order,
    });
    setIsCreating(false);
  }

  function startCreate() {
    setIsCreating(true);
    setEditingPage(null);
    setFormData(EMPTY_PAGE);
  }

  function cancelEdit() {
    setEditingPage(null);
    setIsCreating(false);
  }

  async function savePage() {
    if (!formData.title || !formData.slug || !formData.menu_label) {
      showToast('Vul minimaal titel, slug en menulabel in.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (isCreating) {
        const { error } = await supabase.from('pages').insert([formData]);
        if (error) throw error;
        showToast('Pagina aangemaakt ✓');
      } else if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update(formData)
          .eq('id', editingPage.id);
        if (error) throw error;
        showToast('Pagina opgeslagen ✓');
      }
      await fetchPages();
      cancelEdit();
    } catch (e: any) {
      showToast(e.message || 'Fout bij opslaan', 'error');
    }
    setSaving(false);
  }

  async function togglePublished(page: Page) {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);
    if (!error) {
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
      showToast(page.is_published ? 'Pagina verborgen' : 'Pagina gepubliceerd');
    }
  }

  async function deletePage(id: string) {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (!error) {
      setPages(prev => prev.filter(p => p.id !== id));
      showToast('Pagina verwijderd');
    } else {
      showToast('Fout bij verwijderen', 'error');
    }
    setDeleteConfirm(null);
  }

  function updateSection(index: number, field: keyof Section, value: string) {
    const updated = [...formData.content];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, content: updated }));
  }

  function addSection() {
    setFormData(prev => ({ ...prev, content: [...prev.content, { heading: '', text: '' }] }));
  }

  function removeSection(index: number) {
    setFormData(prev => ({ ...prev, content: prev.content.filter((_, i) => i !== index) }));
  }

  const filtered = pages.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.menu_label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchParent = filterParent === 'all' || p.parent_slug === filterParent;
    return matchSearch && matchParent;
  });

  const grouped = PARENT_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = filtered.filter(p => p.parent_slug === opt.value);
    return acc;
  }, {} as Record<string, Page[]>);

  // ── FORM MODAL ───────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto">
        {/* Form header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isCreating ? 'Nieuwe pagina aanmaken' : `Bewerken: ${editingPage?.menu_label}`}
          </h2>
          <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Basis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Menu label *</label>
              <input
                value={formData.menu_label}
                onChange={e => setFormData(p => ({ ...p, menu_label: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
                placeholder="bijv. Zzp lease"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rubriek *</label>
              <select
                value={formData.parent_slug}
                onChange={e => setFormData(p => ({ ...p, parent_slug: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
              >
                {PARENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Slug (URL) *</label>
            <input
              value={formData.slug}
              onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
              placeholder="financial-lease/zzp-lease"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Paginatitel *</label>
            <input
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
              placeholder="Grote paginatitel"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subtitel</label>
            <input
              value={formData.subtitle}
              onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
              placeholder="Ondertitel onder de paginatitel"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hero afbeelding URL</label>
            <input
              value={formData.hero_image_url}
              onChange={e => setFormData(p => ({ ...p, hero_image_url: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
              placeholder="https://images.unsplash.com/..."
            />
            {formData.hero_image_url && (
              <img src={formData.hero_image_url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Introductietekst</label>
            <textarea
              value={formData.intro}
              onChange={e => setFormData(p => ({ ...p, intro: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal resize-none"
              placeholder="De openingsparagraaf van de pagina..."
            />
          </div>

          {/* Content secties */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inhoud secties</label>
              <button
                onClick={addSection}
                className="flex items-center gap-1.5 text-xs font-semibold text-smartlease-teal hover:text-smartlease-teal/80 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Sectie toevoegen
              </button>
            </div>
            <div className="space-y-4">
              {formData.content.map((section, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">Sectie {i + 1}</span>
                    {formData.content.length > 1 && (
                      <button
                        onClick={() => removeSection(i)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    value={section.heading}
                    onChange={e => updateSection(i, 'heading', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal bg-white"
                    placeholder="Kopje van deze sectie"
                  />
                  <textarea
                    value={section.text}
                    onChange={e => updateSection(i, 'text', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal bg-white resize-none"
                    placeholder="Inhoud van deze sectie..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">SEO</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta titel</label>
                <input
                  value={formData.meta_title}
                  onChange={e => setFormData(p => ({ ...p, meta_title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal"
                  placeholder="Paginatitel | Smartlease.nl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta omschrijving</label>
                <textarea
                  value={formData.meta_description}
                  onChange={e => setFormData(p => ({ ...p, meta_description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal resize-none"
                  placeholder="Korte beschrijving voor zoekmachines (max. 160 tekens)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.meta_description.length}/160 tekens</p>
              </div>
            </div>
          </div>

          {/* Publicatie */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Gepubliceerd</p>
              <p className="text-xs text-gray-400">Zichtbaar op de website</p>
            </div>
            <button
              onClick={() => setFormData(p => ({ ...p, is_published: !p.is_published }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_published ? 'bg-smartlease-teal' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_published ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={cancelEdit}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Annuleren
          </button>
          <button
            onClick={savePage}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-smartlease-teal text-white rounded-lg hover:bg-smartlease-teal/90 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-smartlease-teal' : 'bg-red-500'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pagina verwijderen?</h3>
            <p className="text-sm text-gray-500 mb-5">Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Annuleren
              </button>
              <button onClick={() => deletePage(deleteConfirm)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {(editingPage || isCreating) && renderForm()}

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pagina beheer</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pages.length} pagina's in de database</p>
          </div>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-smartlease-teal text-white text-sm font-bold rounded-xl hover:bg-smartlease-teal/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nieuwe pagina
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Zoek op titel of label..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal bg-white"
            />
          </div>
          <select
            value={filterParent}
            onChange={e => setFilterParent(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-teal/30 focus:border-smartlease-teal bg-white"
          >
            <option value="all">Alle rubrieken</option>
            {PARENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Grouped page lists */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-smartlease-teal rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {PARENT_OPTIONS.map(group => {
              const groupPages = grouped[group.value] || [];
              if (filterParent !== 'all' && filterParent !== group.value) return null;
              return (
                <div key={group.value} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-smartlease-teal" />
                      <span className="font-bold text-sm text-gray-700">{group.label}</span>
                      <span className="text-xs bg-smartlease-teal/10 text-smartlease-teal font-semibold px-2 py-0.5 rounded-full">
                        {groupPages.length}
                      </span>
                    </div>
                  </div>

                  {/* Page rows */}
                  {groupPages.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-400">Geen pagina's gevonden</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {groupPages.map((page) => (
                        <div key={page.id}>
                          {/* Row */}
                          <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition group">
                            <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 truncate">{page.menu_label}</span>
                                {!page.is_published && (
                                  <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                    Verborgen
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 font-mono">/{page.slug}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => setExpandedId(expandedId === page.id ? null : page.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"
                                title="Preview"
                              >
                                {expandedId === page.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              <a
                                href={`/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-smartlease-teal"
                                title="Bekijk pagina"
                              >
                                <FileText className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => togglePublished(page)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title={page.is_published ? 'Verbergen' : 'Publiceren'}
                              >
                                {page.is_published
                                  ? <Eye className="h-4 w-4 text-smartlease-teal" />
                                  : <EyeOff className="h-4 w-4 text-gray-400" />}
                              </button>
                              <button
                                onClick={() => startEdit(page)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-500"
                                title="Bewerken"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(page.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"
                                title="Verwijderen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded preview */}
                          {expandedId === page.id && (
                            <div className="px-5 pb-4 bg-gray-50/50 border-t border-gray-100">
                              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="font-semibold text-gray-500 mb-1">Titel</p>
                                  <p className="text-gray-700">{page.title}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-500 mb-1">Subtitel</p>
                                  <p className="text-gray-700">{page.subtitle}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="font-semibold text-gray-500 mb-1">Intro</p>
                                  <p className="text-gray-700 line-clamp-2">{page.intro}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-500 mb-1">Secties</p>
                                  <p className="text-gray-700">{page.content?.length || 0} secties</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-500 mb-1">Meta titel</p>
                                  <p className="text-gray-700 truncate">{page.meta_title || '—'}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => startEdit(page)}
                                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-smartlease-teal hover:underline"
                              >
                                <Pencil className="h-3 w-3" /> Bewerken
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}