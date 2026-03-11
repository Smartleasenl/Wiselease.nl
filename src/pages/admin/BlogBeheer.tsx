// src/pages/admin/BlogBeheer.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, Save, CheckCircle, AlertCircle, Loader2,
  Eye, EyeOff, PenLine, X, Image as ImageIcon, Calendar
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  read_time: number;
  is_published: boolean;
  published_at: string;
  sort_order: number;
}

const EMPTY: Omit<BlogPost, 'id'> = {
  slug: '', title: '', excerpt: '', content: '', image_url: '',
  category: 'Algemeen', read_time: 5, is_published: true,
  published_at: new Date().toISOString().split('T')[0], sort_order: 0,
};

const CATEGORIES = ['Algemeen', 'Advies', 'Fiscaal', 'Elektrisch', 'Top 10', 'Nieuws'];

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[àáâã]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõ]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function BlogBeheer() {
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*')
      .order('sort_order').order('published_at', { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleTitleChange(title: string) {
    setForm(p => ({ ...p, title, slug: editId ? p.slug : slugify(title) }));
  }

  function startEdit(post: BlogPost) {
    setForm({ slug: post.slug, title: post.title, excerpt: post.excerpt, content: post.content,
      image_url: post.image_url, category: post.category, read_time: post.read_time,
      is_published: post.is_published, published_at: post.published_at, sort_order: post.sort_order });
    setEditId(post.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() { setForm(EMPTY); setEditId(null); setFormOpen(false); }

  async function savePost() {
    if (!form.title || !form.excerpt) { showToast('Titel en samenvatting zijn verplicht', 'error'); return; }
    if (!form.slug) { showToast('Slug is verplicht', 'error'); return; }
    setSaving(true);
    const payload = { ...form };
    if (editId) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editId);
      if (error) { showToast('Fout: ' + error.message, 'error'); setSaving(false); return; }
    } else {
      const maxOrder = posts.length ? Math.max(...posts.map(p => p.sort_order)) + 1 : 0;
      const { error } = await supabase.from('blog_posts').insert([{ ...payload, sort_order: maxOrder }]);
      if (error) { showToast('Fout: ' + error.message, 'error'); setSaving(false); return; }
    }
    showToast(editId ? 'Artikel bijgewerkt ✓' : 'Artikel toegevoegd ✓');
    resetForm();
    await fetchPosts();
    setSaving(false);
  }

  async function togglePublished(post: BlogPost) {
    await supabase.from('blog_posts').update({ is_published: !post.is_published }).eq('id', post.id);
    setPosts(prev => prev.map(x => x.id === post.id ? { ...x, is_published: !x.is_published } : x));
  }

  async function deletePost(id: string) {
    if (!confirm('Artikel verwijderen?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(x => x.id !== id));
    showToast('Verwijderd');
  }

  const GRADIENT_MAP: Record<string, string> = {
    'Advies': 'from-yellow-500 to-yellow-500', 'Fiscaal': 'from-blue-500 to-indigo-500',
    'Top 10': 'from-violet-500 to-purple-500', 'Elektrisch': 'from-emerald-500 to-green-500',
    'Nieuws': 'from-amber-500 to-orange-500', 'Algemeen': 'from-gray-500 to-gray-600',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-smartlease-yellow' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog beheer</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} artikelen · {posts.filter(p => p.is_published).length} gepubliceerd</p>
        </div>
        <button onClick={() => { resetForm(); setFormOpen(o => !o); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-smartlease-yellow text-white text-sm font-bold rounded-xl hover:bg-smartlease-yellow/90 transition shadow-sm">
          <Plus className="h-4 w-4" /> Artikel toevoegen
        </button>
      </div>

      {/* Formulier */}
      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-sm">{editId ? 'Artikel bewerken' : 'Nieuw artikel'}</h3>
            <button onClick={resetForm}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Titel *</label>
              <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                placeholder="De 10 beste lease auto's van 2026" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">/blog/</span>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                  placeholder="de-10-beste-lease-autos-van-2026" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Samenvatting * <span className="text-gray-300 font-normal">(wordt getoond op de blogpagina)</span></label>
            <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow resize-none"
              placeholder="Korte samenvatting van het artikel..." />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Volledige inhoud <span className="text-gray-300 font-normal">(HTML of tekst)</span></label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={8} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow resize-none"
              placeholder="Volledige artikel tekst..." />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Afbeelding URL</label>
            <div className="flex gap-2">
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-3" />
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow"
                placeholder="https://images.unsplash.com/..." />
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categorie</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Leestijd (min)</label>
              <input type="number" min={1} max={60} value={form.read_time} onChange={e => setForm(p => ({ ...p, read_time: parseInt(e.target.value) || 5 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Publicatiedatum</label>
              <input type="date" value={form.published_at} onChange={e => setForm(p => ({ ...p, published_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow" />
            </div>
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
              <button onClick={savePost} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-smartlease-yellow text-white text-sm font-bold rounded-lg hover:bg-smartlease-yellow/90 transition disabled:opacity-60">
                <Save className="h-3.5 w-3.5" /> {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lijst */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <p className="text-gray-400 text-sm">Nog geen artikelen. Voeg er een toe!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {posts.filter(p => p.is_published).length} gepubliceerd · {posts.filter(p => !p.is_published).length} concept
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition group">
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${GRADIENT_MAP[post.category] || 'from-gray-500 to-gray-600'}`}>
                      {post.category}
                    </span>
                    {!post.is_published && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">Concept</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[11px] text-gray-400">{post.read_time} min leestijd</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                  <button onClick={() => togglePublished(post)} title={post.is_published ? 'Verbergen' : 'Publiceren'}
                    className="p-2 hover:bg-gray-100 rounded-lg transition">
                    {post.is_published ? <Eye className="h-4 w-4 text-smartlease-yellow" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button onClick={() => startEdit(post)} className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-500">
                    <PenLine className="h-4 w-4" />
                  </button>
                  <button onClick={() => deletePost(post.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
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