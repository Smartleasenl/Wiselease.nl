import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mail, Phone, Car, Clock, Eye, X, Loader2, Inbox, ExternalLink,
} from 'lucide-react';

interface Lead {
  id: number;
  type: string;
  naam: string | null;
  email: string | null;
  telefoon: string | null;
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
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'nieuw', label: 'Nieuw', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_behandeling', label: 'In behandeling', color: 'bg-amber-100 text-amber-700' },
  { value: 'afgerond', label: 'Afgerond', color: 'bg-green-100 text-green-700' },
  { value: 'afgewezen', label: 'Afgewezen', color: 'bg-red-100 text-red-700' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alle');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) setLeads(data);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status } : null);
    }
  };

  const filteredLeads = filter === 'alle' ? leads : leads.filter((l) => l.status === filter);

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${opt.color}`}>{opt.label}</span>;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('nl-NL', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-smartlease-teal" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">{leads.length} totaal, {leads.filter((l) => l.status === 'nieuw').length} nieuw</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['alle', ...STATUS_OPTIONS.map((s) => s.value)].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
              filter === f ? 'bg-smartlease-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'alle' ? 'Alle' : STATUS_OPTIONS.find((s) => s.value === f)?.label}
          </button>
        ))}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Geen leads gevonden</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter !== 'alle' ? 'Probeer een ander filter' : 'Leads verschijnen hier zodra ze binnenkomen'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Naam</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Datum</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 text-sm">{lead.naam || '—'}</p>
                      {lead.vehicle_info && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{lead.vehicle_info}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {lead.email && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </p>
                        )}
                        {lead.telefoon && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {lead.telefoon}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500 capitalize">{lead.type}</span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 text-gray-400 hover:text-smartlease-teal hover:bg-smartlease-teal/10 rounded-lg transition"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-4">{selectedLead.naam || 'Onbekend'}</h2>

            {/* Contact info */}
            <div className="space-y-2.5 mb-5">
              {selectedLead.email && (
                <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-smartlease-teal transition">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" /> {selectedLead.email}
                </a>
              )}
              {selectedLead.telefoon && (
                <a href={`tel:${selectedLead.telefoon}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-smartlease-teal transition">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" /> {selectedLead.telefoon}
                </a>
              )}
              {selectedLead.vehicle_info && (
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <Car className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{selectedLead.vehicle_info}</p>
                    {selectedLead.vehicle_id && (
                      <a
                        href={`/auto/${selectedLead.vehicle_id}/voertuig`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-smartlease-teal hover:underline mt-0.5"
                      >
                        <ExternalLink className="h-3 w-3" /> Bekijk advertentie
                      </a>
                    )}
                  </div>
                </div>
              )}
              <p className="flex items-center gap-3 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" /> {formatDate(selectedLead.created_at)}
              </p>
            </div>

            {/* Calculator data */}
            {selectedLead.calculator_data && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Berekening</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {selectedLead.calculator_data.aankoopprijs > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Aankoopprijs</span>
                      <span className="font-semibold text-gray-900">{formatPrice(selectedLead.calculator_data.aankoopprijs)}</span>
                    </div>
                  )}
                  {selectedLead.calculator_data.financieringsbedrag > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Financieringsbedrag</span>
                      <span className="font-semibold text-gray-900">{formatPrice(selectedLead.calculator_data.financieringsbedrag)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Looptijd</span>
                    <span className="font-semibold text-gray-900">{selectedLead.calculator_data.looptijd} maanden</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aanbetaling</span>
                    <span className="font-semibold text-gray-900">{formatPrice(selectedLead.calculator_data.aanbetaling)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Slottermijn</span>
                    <span className="font-semibold text-gray-900">{formatPrice(selectedLead.calculator_data.slottermijn)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Maandbedrag</span>
                    <span className="font-bold text-smartlease-teal">{formatPrice(selectedLead.calculator_data.maandbedrag)}/mnd</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bericht */}
            {selectedLead.bericht && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bericht</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{selectedLead.bericht}</p>
              </div>
            )}

            {/* Status wijzigen */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status wijzigen</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateStatus(selectedLead.id, opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedLead.status === opt.value
                        ? opt.color + ' ring-2 ring-offset-1 ring-gray-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}