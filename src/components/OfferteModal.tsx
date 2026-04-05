import { useState, FormEvent } from 'react';
import { validatePhone, phoneErrorMsg } from '../utils/validatePhone';
import { submitLead } from '../lib/leadService';
import { X, FileText, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import type { CalculatorState } from './LeaseCalculator';

interface OfferteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: number;
  vehicleInfo?: string;
  calculatorState?: CalculatorState | null;
}

export default function OfferteModal({ isOpen, onClose, vehicleId, vehicleInfo, calculatorState }: OfferteModalProps) {
  const [form, setForm] = useState({ naam: '', bedrijfsnaam: '', email: '', telefoon: '', bericht: '' });
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.naam.trim()) { setError('Vul je naam in.'); setLoading(false); return; }
    if (!form.bedrijfsnaam.trim()) { setError('Vul je bedrijfsnaam in.'); setLoading(false); return; }
    if (!form.telefoon.trim()) { setError('Vul je telefoonnummer in.'); setLoading(false); return; }
    if (!validatePhone(form.telefoon)) { setPhoneError(phoneErrorMsg()); setLoading(false); return; }
    setPhoneError('');

    const result = await submitLead({
      type: 'offerte',
      naam: form.naam,
      email: form.email,
      telefoon: form.telefoon,
      bericht: form.bericht || `Offerte aanvraag voor: ${vehicleInfo || 'Onbekend voertuig'}`,
      vehicle_id: vehicleId,
      vehicle_info: vehicleInfo,
      calculator_data: calculatorState ? {
        looptijd: calculatorState.looptijd,
        aanbetaling: calculatorState.aanbetaling,
        maandbedrag: calculatorState.maandbedrag,
        slottermijn: calculatorState.slottermijn,
        financieringsbedrag: calculatorState.financieringsbedrag,
        aankoopprijs: calculatorState.aankoopprijs,
      } : undefined,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Er ging iets mis.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setForm({ naam: '', bedrijfsnaam: '', email: '', telefoon: '', bericht: '' });
    setPhoneError('');
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-smartlease-yellow/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-smartlease-yellow" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Gratis offerte aanvragen</h2>
              {vehicleInfo && <p className="text-xs text-gray-400 truncate max-w-[200px]">{vehicleInfo}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aanvraag verzonden!</h3>
              <p className="text-gray-500 text-sm mb-6">Wij nemen zo snel mogelijk contact met je op.</p>
              <button onClick={handleClose} className="px-6 py-2.5 bg-smartlease-yellow text-white rounded-xl font-semibold hover:bg-smartlease-yellow/90 transition">
                Sluiten
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}

              {/* Calculator samenvatting */}
              {calculatorState && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1 border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1.5">Jouw berekening</p>
                  <div className="flex justify-between"><span>Aankoopprijs</span><span className="font-medium">€ {calculatorState.aankoopprijs.toLocaleString('nl-NL')}</span></div>
                  <div className="flex justify-between"><span>Financieringsbedrag</span><span className="font-medium">€ {calculatorState.financieringsbedrag.toLocaleString('nl-NL')}</span></div>
                  <div className="flex justify-between"><span>Looptijd</span><span className="font-medium">{calculatorState.looptijd} maanden</span></div>
                  <div className="flex justify-between"><span>Aanbetaling</span><span className="font-medium">€ {calculatorState.aanbetaling.toLocaleString('nl-NL')}</span></div>
                  <div className="flex justify-between"><span>Slottermijn</span><span className="font-medium">€ {calculatorState.slottermijn.toLocaleString('nl-NL')}</span></div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold text-smartlease-yellow">
                    <span>Maandbedrag</span><span>€ {calculatorState.maandbedrag}/mnd</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam <span className="text-red-500">*</span></label>
                <input type="text" required value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })}
                  placeholder="Je volledige naam"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam <span className="text-red-500">*</span></label>
                <input type="text" required value={form.bedrijfsnaam} onChange={(e) => setForm({ ...form, bedrijfsnaam: e.target.value })}
                  placeholder="Jouw bedrijf BV"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="naam@voorbeeld.nl"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer <span className="text-red-500">*</span></label>
                <input type="tel" required value={form.telefoon} onChange={(e) => { setForm({ ...form, telefoon: e.target.value }); setPhoneError(''); }}
                  onBlur={() => form.telefoon && !validatePhone(form.telefoon) ? setPhoneError(phoneErrorMsg()) : setPhoneError('')}
                  placeholder="06 - 12345678"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition ${phoneError ? 'border-red-400' : 'border-gray-200'}`} />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opmerking</label>
                <textarea value={form.bericht} onChange={(e) => setForm({ ...form, bericht: e.target.value })}
                  placeholder="Optioneel: heb je nog specifieke wensen?" rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition resize-y" />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-smartlease-yellow text-white rounded-xl font-semibold hover:bg-smartlease-yellow/90 active:scale-[0.98] disabled:opacity-60 transition-all">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {loading ? 'Verzenden...' : 'Offerte aanvragen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}