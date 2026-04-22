import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mail, Phone, Car, Clock, Eye, X, Loader2, Inbox, ExternalLink,
  Save, Trash2, MessageSquare, Search,
} from 'lucide-react';

interface Lead {
  id: number;
  type: string;
  naam: string | null;
  email: string | null;
  telefoon: string | null;
  bedrijfsnaam: string | null;
  bericht: string | null;
  vehicle_info: string | null;
  vehicle_id: number | null;
  calculator_data: {
    looptijd: number;
    aanbetaling: number;
    maandbedrag: number;
    slottermijn: number;
    financieringsbedrag: number;
    aankoopprijs: number;
  } | null;
  status: string;
  entry_point: string | null;
  entry_point_detail: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'nieuw', label: 'Nieuw', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_behandeling', label: 'In behandeling', color: 'bg-amber-100 text-amber-700' },
  { value: 'afgerond', label: 'Afgerond', color: 'bg-green-100 text-green-700' },
  { value: 'afgewezen', label: 'Afgewezen', color: 'bg-red-100 text-red-700' },
];

const ENTRY_POINT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  autopagina: { icon: '🚗', label: 'Autopagina', color: 'bg-green-50 text-green-700 border-green-200' },
  calculator: { icon: '🧮', label: 'Calculator', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  vergelijker: { icon: '⚖️', label: 'Vergelijker', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  contact_formulier: { icon: '📋', label: 'Formulier', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  website: { icon: '🌐', label: 'Website', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

function EntryPointBadge({ ep }: { ep: string | null }) {
  if (!ep) return null;
  const cfg = ENTRY_POINT_CONFIG[ep] || { icon: '🌐', label: ep, color: 'bg-gray-50 text-gray-500 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatWaNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '').replace(/^0/, '31');
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alle');
  const [entryFilter, setEntryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('id, type, naam, email, telefoon, bedrijfsnaam, bericht, vehicle_info, vehicle_id, calculator_data, status, entry_point, entry_point_detail, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setLeads(data);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status } : null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" verwijderen?`)) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = filter === 'alle' || l.status === filter;
    const matchesEntry = !entryFilter || l.entry_point === entryFilter;
    if (!searchQuery) return matchesStatus && matchesEntry;
    const s = searchQuery.toLowerCase();
    return matchesStatus && matchesEntry && (
      (l.naam || '').toLowerCase().includes(s) ||
      (l.email || '').toLowerCase().includes(s) ||
      (l.bedrijfsnaam || '').toLowerCase().includes(s) ||
      (l.vehicle_info || '').toLowerCase().includes(s)
    );
  });

  const statusCounts = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <span className={'px-2.5 py-1 rounded-lg text-xs font-semibold ' + opt.color}>{opt.label}</span>;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-smartlease-yellow" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 mt-1">{leads.length} totaal, {leads.filter(l => l.status === 'nieuw').length} nieuw</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setFilter(filter === s.value ? 'alle' : s.value)}
            className={`p-3 rounded-xl border text-left transition-all ${filter === s.value ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <p className="text-xl font-bold text-gray-900">{statusCounts[s.value] || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Zoek op naam, e-mail, bedrijf..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow" />
        </div>
        <select value={entryFilter} onChange={e => setEntryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600">
          <option value="">Alle bronnen</option>
          {Object.entries(ENTRY_POINT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {['alle', ...STATUS_OPTIONS.map(s => s.value)].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={'px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ' + (filter === f ? 'bg-smartlease-yellow text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {f === 'alle' ? 'Alle' : STATUS_OPTIONS.find(s => s.value === f)?.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Geen leads gevonden</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ overflowX: 'auto' }}>
          <table className="w-full" style={{ minWidth: '650px' }}>
            <thead>
              <tr className="border-b border-gray-100">
                {['Naam / Bedrijf', 'Contact', 'Auto', 'Status', 'Bron', 'Datum', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.map(lead => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-gray-50/50 transition cursor-pointer">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{lead.naam || '—'}</p>
                    {lead.bedrijfsnaam && <p className="text-xs text-gray-400 mt-0.5">{lead.bedrijfsnaam}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {lead.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</p>}
                    {lead.telefoon && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {lead.telefoon}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {lead.vehicle_info && <p className="text-xs text-gray-500 truncate max-w-[180px]">{lead.vehicle_info}</p>}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                  <td className="px-4 py-3"><EntryPointBadge ep={lead.entry_point} /></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span></td>
                  <td className="px-4 py-3">
                    <button className="p-2 text-gray-400 hover:text-smartlease-yellow hover:bg-smartlease-yellow/10 rounded-lg transition"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4" onClick={() => setSelectedLead(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedLead.status)}
                <EntryPointBadge ep={selectedLead.entry_point} />
                <span className="text-xs text-gray-400">{new Date(selectedLead.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Klant + acties */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{selectedLead.naam || '—'}</p>
                    {selectedLead.bedrijfsnaam && <p className="text-sm text-gray-500 mt-0.5">{selectedLead.bedrijfsnaam}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {selectedLead.telefoon && (
                      <>
                        <a href={`tel:${selectedLead.telefoon}`} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"><Phone size={13} /> Bellen</a>
                        <a href={`https://wa.me/${formatWaNumber(selectedLead.telefoon)}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-lg text-xs font-semibold transition"><MessageSquare size={13} /> WhatsApp</a>
                      </>
                    )}
                    {selectedLead.email && (
                      <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"><Mail size={13} /> Mail</a>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedLead.telefoon && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-[10px] text-gray-400 uppercase">Telefoon</p><p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedLead.telefoon}</p></div>}
                  {selectedLead.email && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-[10px] text-gray-400 uppercase">E-mail</p><p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{selectedLead.email}</p></div>}
                </div>
              </div>

              {/* Auto */}
              {selectedLead.vehicle_info && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Gewenste auto</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedLead.vehicle_info}</p>
                  {selectedLead.vehicle_id && (
                    <button onClick={() => window.open('/auto/' + selectedLead.vehicle_id + '/voertuig', '_blank')}
                      className="inline-flex items-center gap-1 mt-2 text-xs text-smartlease-yellow hover:underline font-semibold"><ExternalLink size={12} /> Bekijk advertentie</button>
                  )}
                </div>
              )}

              {/* Calculator */}
              {selectedLead.calculator_data && selectedLead.calculator_data.aankoopprijs > 0 && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Lease berekening</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {selectedLead.calculator_data.aankoopprijs > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Aankoopprijs</span><span className="font-semibold">{formatPrice(selectedLead.calculator_data.aankoopprijs)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Aanbetaling</span><span className="font-semibold">{formatPrice(selectedLead.calculator_data.aanbetaling)}</span></div>
                    {selectedLead.calculator_data.financieringsbedrag > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Te financieren</span><span className="font-semibold">{formatPrice(selectedLead.calculator_data.financieringsbedrag)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Looptijd</span><span className="font-semibold">{selectedLead.calculator_data.looptijd} mnd</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Slottermijn</span><span className="font-semibold">{formatPrice(selectedLead.calculator_data.slottermijn)}</span></div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200"><span className="font-medium">Maandbedrag</span><span className="font-bold text-smartlease-yellow">{formatPrice(selectedLead.calculator_data.maandbedrag)}/mnd</span></div>
                  </div>
                </div>
              )}

              {/* Bericht */}
              {selectedLead.bericht && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Bericht</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{selectedLead.bericht}</p>
                </div>
              )}

              {/* Status */}
              <div className="px-6 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Status wijzigen</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => updateStatus(selectedLead.id, opt.value)}
                      className={'px-3 py-1.5 rounded-lg text-xs font-semibold border transition ' + (selectedLead.status === opt.value ? opt.color + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => handleDelete(selectedLead.id, selectedLead.naam || 'Lead')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-xl text-sm transition"><Trash2 size={14} /></button>
              <button onClick={() => setSelectedLead(null)} className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition">Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
