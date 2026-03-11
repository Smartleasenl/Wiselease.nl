// src/pages/admin/FooterLinksAdmin.tsx
// Beheerpagina voor de footer links — bereikbaar via het admin dashboard
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save, X } from 'lucide-react';

interface FooterLink {
  id: number;
  column_key: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

const COLUMNS = [
  { key: 'aanbod',          label: 'Ons aanbod' },
  { key: 'financial_lease', label: 'Financial Lease' },
  { key: 'meer_informatie', label: 'Meer informatie' },
];

const EMPTY_LINK: Omit<FooterLink, 'id'> = {
  column_key: 'aanbod',
  label: '',
  url: '',
  sort_order: 99,
  is_active: true,
};

export default function FooterLinksAdmin() {
  const [links, setLinks]       = useState<FooterLink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('aanbod');
  const [adding, setAdding]     = useState(false);
  const [newLink, setNewLink]   = useState({ ...EMPTY_LINK, column_key: 'aanbod' });
  const [editId, setEditId]     = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<FooterLink>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('footer_links')
      .select('*')
      .order('column_key')
      .order('sort_order');
    setLinks((data as FooterLink[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const colLinks = links.filter(l => l.column_key === activeTab);

  async function toggleActive(link: FooterLink) {
    setSaving(link.id);
    await supabase.from('footer_links').update({ is_active: !link.is_active }).eq('id', link.id);
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l));
    setSaving(null);
  }

  async function deleteLink(id: number) {
    if (!confirm('Weet je zeker dat je deze link wilt verwijderen?')) return;
    await supabase.from('footer_links').delete().eq('id', id);
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  async function addLink() {
    if (!newLink.label || !newLink.url) return;
    const maxOrder = Math.max(0, ...links.filter(l => l.column_key === activeTab).map(l => l.sort_order));
    const payload = { ...newLink, column_key: activeTab, sort_order: maxOrder + 1 };
    const { data } = await supabase.from('footer_links').insert(payload).select().single();
    if (data) {
      setLinks(prev => [...prev, data as FooterLink]);
      setNewLink({ ...EMPTY_LINK, column_key: activeTab });
      setAdding(false);
    }
  }

  async function saveEdit(id: number) {
    if (!editData.label || !editData.url) return;
    setSaving(id);
    await supabase.from('footer_links').update(editData).eq('id', id);
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...editData } : l));
    setEditId(null);
    setEditData({});
    setSaving(null);
  }

  async function moveUp(link: FooterLink) {
    const col = links.filter(l => l.column_key === activeTab).sort((a, b) => a.sort_order - b.sort_order);
    const idx = col.findIndex(l => l.id === link.id);
    if (idx === 0) return;
    const prev = col[idx - 1];
    await supabase.from('footer_links').update({ sort_order: prev.sort_order }).eq('id', link.id);
    await supabase.from('footer_links').update({ sort_order: link.sort_order }).eq('id', prev.id);
    setLinks(all => all.map(l => {
      if (l.id === link.id) return { ...l, sort_order: prev.sort_order };
      if (l.id === prev.id) return { ...l, sort_order: link.sort_order };
      return l;
    }));
  }

  async function moveDown(link: FooterLink) {
    const col = links.filter(l => l.column_key === activeTab).sort((a, b) => a.sort_order - b.sort_order);
    const idx = col.findIndex(l => l.id === link.id);
    if (idx === col.length - 1) return;
    const next = col[idx + 1];
    await supabase.from('footer_links').update({ sort_order: next.sort_order }).eq('id', link.id);
    await supabase.from('footer_links').update({ sort_order: link.sort_order }).eq('id', next.id);
    setLinks(all => all.map(l => {
      if (l.id === link.id) return { ...l, sort_order: next.sort_order };
      if (l.id === next.id) return { ...l, sort_order: link.sort_order };
      return l;
    }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Footer links beheren</h1>
        <p className="text-sm text-gray-500 mt-1">Voeg paginalinks toe, verwijder ze of zet ze aan/uit per kolom.</p>
      </div>

      {/* Tab navigatie per kolom */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {COLUMNS.map(col => (
          <button
            key={col.key}
            onClick={() => { setActiveTab(col.key); setAdding(false); setEditId(null); }}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === col.key
                ? 'border-smartlease-yellow text-smartlease-yellow bg-yellow-50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {col.label}
            <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
              {links.filter(l => l.column_key === col.key && l.is_active).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Laden...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Links lijst */}
          {colLinks.sort((a, b) => a.sort_order - b.sort_order).map((link, idx) => (
            <div
              key={link.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 ${
                !link.is_active ? 'opacity-40' : ''
              }`}
            >
              {/* Volgorde buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveUp(link)} disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
                <button onClick={() => moveDown(link)} disabled={idx === colLinks.length - 1}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
              </div>

              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />

              {/* Bewerkmodus */}
              {editId === link.id ? (
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  <input
                    value={editData.label ?? link.label}
                    onChange={e => setEditData(d => ({ ...d, label: e.target.value }))}
                    placeholder="Label"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]"
                  />
                  <input
                    value={editData.url ?? link.url}
                    onChange={e => setEditData(d => ({ ...d, url: e.target.value }))}
                    placeholder="URL bijv. /aanbod"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px]"
                  />
                  <button onClick={() => saveEdit(link.id)}
                    className="p-1.5 bg-smartlease-yellow text-white rounded-lg hover:bg-yellow-600 transition">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setEditId(null); setEditData({}); }}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onDoubleClick={() => { setEditId(link.id); setEditData({}); }}
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">{link.label}</p>
                  <p className="text-xs text-gray-400 truncate">{link.url}</p>
                </div>
              )}

              {/* Aan/uit toggle */}
              <button
                onClick={() => toggleActive(link)}
                disabled={saving === link.id}
                title={link.is_active ? 'Verbergen in footer' : 'Tonen in footer'}
                className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                  link.is_active
                    ? 'text-smartlease-yellow hover:bg-yellow-50'
                    : 'text-gray-300 hover:bg-gray-100'
                }`}
              >
                {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              {/* Verwijderen */}
              <button
                onClick={() => deleteLink(link.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                title="Verwijderen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Lege staat */}
          {colLinks.length === 0 && !adding && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Nog geen links in deze kolom.
            </div>
          )}

          {/* Nieuwe link toevoegen */}
          {adding ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border-t border-yellow-100 flex-wrap">
              <input
                autoFocus
                value={newLink.label}
                onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))}
                placeholder="Naam bijv. Elektrisch leasen"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]"
              />
              <input
                value={newLink.url}
                onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                placeholder="URL bijv. /aanbod?fuel=elektrisch"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
              />
              <button onClick={addLink}
                disabled={!newLink.label || !newLink.url}
                className="px-4 py-1.5 bg-smartlease-yellow text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-40 transition">
                Toevoegen
              </button>
              <button onClick={() => setAdding(false)}
                className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
                Annuleren
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => { setAdding(true); setNewLink({ ...EMPTY_LINK, column_key: activeTab }); }}
                className="flex items-center gap-2 text-sm font-semibold text-smartlease-yellow hover:text-yellow-600 transition"
              >
                <Plus className="h-4 w-4" />
                Link toevoegen aan {COLUMNS.find(c => c.key === activeTab)?.label}
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Dubbelklik op een link om deze te bewerken. Wijzigingen zijn direct zichtbaar in de footer.
      </p>
    </div>
  );
}