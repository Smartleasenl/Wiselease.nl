import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Mail, Phone, Car, Clock, ArrowLeft, ExternalLink,
  Building2, Hash, Loader2, Trash2, Save, StickyNote, AlertTriangle,
} from 'lucide-react';

interface Lead {
  id: number;
  type: string;
  naam: string | null;
  voornaam: string | null;
  achternaam: string | null;
  bedrijfsnaam: string | null;
  kvk_nummer: string | null;
  email: string | null;
  telefoon: string | null;
  bericht: string | null;
  notities: string | null;
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

const formatDate = (date: string) =>
  new Date(date).toLocaleString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notities, setNotities] = useState('');
  const [savingNotities, setSavingNotities] = useState(false);
  const [notitiesSaved, setNotitiesSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) loadLead(Number(id));
  }, [id]);

  const loadLead = async (leadId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    if (!error && data) {
      setLead(data);
      setNotities(data.notities || '');
    }
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!lead) return;
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', lead.id);
    if (!error) setLead((prev) => prev ? { ...prev, status } : null);
  };

  const saveNotities = async () => {
    if (!lead) return;
    setSavingNotities(true);
    const { error } = await supabase
      .from('leads')
      .update({ notities, updated_at: new Date().toISOString() })
      .eq('id', lead.id);
    if (!error) {
      setLead((prev) => prev ? { ...prev, notities } : null);
      setNotitiesSaved(true);
      setTimeout(() => setNotitiesSaved(false), 2000);
    }
    setSavingNotities(false);
  };

  const deleteLead = async () => {
    if (!lead) return;
    setDeleting(true);
    const { error } = await supabase.from('leads').delete().eq('id', lead.id);
    if (!error) navigate('/admin/leads');
    else setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-smartlease-yellow" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Lead niet gevonden.</p>
        <button onClick={() => navigate('/admin/leads')} className="mt-4 text-smartlease-yellow hover:underline text-sm">
          Terug naar leads
        </button>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === lead.status) || STATUS_OPTIONS[0];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Terug naar leads
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition"
        >
          <Trash2 className="h-4 w-4" /> Verwijderen
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{lead.naam || 'Onbekend'}</h1>
            {lead.bedrijfsnaam && (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {lead.bedrijfsnaam}
              </p>
            )}
            {lead.kvk_nummer && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> KVK: {lead.kvk_nummer}
              </p>
            )}
          </div>
          <span className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ' + currentStatus.color}>
            {currentStatus.label}
          </span>
        </div>

        <div className="space-y-2.5 mb-5">
          {lead.email && (
            <a href={'mailto:' + lead.email} className="flex items-center gap-3 text-sm text-gray-700 hover:text-smartlease-yellow transition">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" /> {lead.email}
            </a>
          )}
          {lead.telefoon && (
            <a href={'tel:' + lead.telefoon} className="flex items-center gap-3 text-sm text-gray-700 hover:text-smartlease-yellow transition">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" /> {lead.telefoon}
            </a>
          )}
          {lead.vehicle_info && (
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <Car className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{lead.vehicle_info}</p>
                {lead.vehicle_id && (
                  <button
                    onClick={() => window.open('/auto/' + lead.vehicle_id + '/voertuig', '_blank')}
                    className="inline-flex items-center gap-1 text-xs text-smartlease-yellow hover:underline mt-0.5"
                  >
                    <ExternalLink className="h-3 w-3" /> Bekijk advertentie
                  </button>
                )}
              </div>
            </div>
          )}
          <p className="flex items-center gap-3 text-sm text-gray-400">
            <Clock className="h-4 w-4 text-gray-300 flex-shrink-0" /> {formatDate(lead.created_at)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status wijzigen</p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStatus(opt.value)}
                className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition ' + (lead.status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {lead.calculator_data && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Berekening</p>
          <div className="space-y-2">
            {lead.calculator_data.aankoopprijs > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Aankoopprijs</span>
                <span className="font-semibold text-gray-900">{formatPrice(lead.calculator_data.aankoopprijs)}</span>
              </div>
            )}
            {lead.calculator_data.financieringsbedrag > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Financieringsbedrag</span>
                <span className="font-semibold text-gray-900">{formatPrice(lead.calculator_data.financieringsbedrag)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Looptijd</span>
              <span className="font-semibold text-gray-900">{lead.calculator_data.looptijd} maanden</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Aanbetaling</span>
              <span className="font-semibold text-gray-900">{formatPrice(lead.calculator_data.aanbetaling)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Slottermijn</span>
              <span className="font-semibold text-gray-900">{formatPrice(lead.calculator_data.slottermijn)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Maandbedrag</span>
              <span className="font-bold text-smartlease-yellow text-base">{formatPrice(lead.calculator_data.maandbedrag)}/mnd</span>
            </div>
          </div>
        </div>
      )}

      {lead.bericht && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bericht van klant</p>
          <p className="text-sm text-gray-700 leading-relaxed">{lead.bericht}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5" /> Interne notities
          </p>
          <button
            onClick={saveNotities}
            disabled={savingNotities}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ' + (notitiesSaved ? 'bg-green-100 text-green-700' : 'bg-smartlease-yellow text-white hover:bg-yellow-600')}
          >
            {savingNotities ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {notitiesSaved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          placeholder="Voeg interne notities toe over deze lead..."
          rows={5}
          className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/30 focus:border-smartlease-yellow/50 resize-none placeholder-gray-300 transition"
        />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Lead verwijderen?</h3>
                <p className="text-xs text-gray-500 mt-0.5">Dit kan niet ongedaan worden gemaakt.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5 bg-gray-50 rounded-xl p-3">
              <span className="font-medium">{lead.naam || 'Onbekend'}</span>
              {lead.bedrijfsnaam && <span className="text-gray-400"> · {lead.bedrijfsnaam}</span>}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Annuleren
              </button>
              <button
                onClick={deleteLead}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}