import { useState, FormEvent } from 'react';
import { submitLead } from '../lib/leadService';
import {
  X,
  Phone,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface BelMijModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: number;
  vehicleInfo?: string;
}

export default function BelMijModal({ isOpen, onClose, vehicleId, vehicleInfo }: BelMijModalProps) {
  const [form, setForm] = useState({
    naam: '',
    telefoon: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.naam.trim() || !form.telefoon.trim()) {
      setError('Vul je naam en telefoonnummer in.');
      setLoading(false);
      return;
    }

    const result = await submitLead({
      type: 'terugbelverzoek',
      naam: form.naam,
      telefoon: form.telefoon,
      bericht: `Terugbelverzoek voor: ${vehicleInfo || 'Onbekend voertuig'}`,
      vehicle_id: vehicleId,
      vehicle_info: vehicleInfo,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Er ging iets mis.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setForm({ naam: '', telefoon: '' });
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Bel mij terug</h2>
              {vehicleInfo && <p className="text-xs text-gray-400 truncate max-w-[180px]">{vehicleInfo}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verzoek ontvangen!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Wij bellen je zo snel mogelijk terug.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-smartlease-teal text-white rounded-xl font-semibold hover:bg-smartlease-teal/90 transition"
              >
                Sluiten
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.naam}
                  onChange={(e) => setForm({ ...form, naam: e.target.value })}
                  placeholder="Je naam"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoonnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.telefoon}
                  onChange={(e) => setForm({ ...form, telefoon: e.target.value })}
                  placeholder="06 - 12345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
                {loading ? 'Verzenden...' : 'Bel mij terug'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}