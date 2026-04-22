import { useCanonical } from '../hooks/useCanonical';
import { useState, FormEvent } from 'react';
import { submitLead } from '../lib/leadService';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export function ContactPage() {
  useCanonical();
  const [form, setForm] = useState({
    naam: '',
    email: '',
    telefoon: '',
    bericht: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.naam.trim() || !form.telefoon.trim()) {
      setError('Vul minimaal je naam en telefoonnummer in.');
      setLoading(false);
      return;
    }

    const result = await submitLead({
      type: 'contact',
      naam: form.naam,
      email: form.email,
      telefoon: form.telefoon,
      bericht: form.bericht,
    });

    if (result.success) {
      setSuccess(true);
      setForm({ naam: '', email: '', telefoon: '', bericht: '' });
    } else {
      setError(result.error || 'Er ging iets mis.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <a href="/" className="hover:text-smartlease-yellow transition">Home</a>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Contact</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Contact form */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact</h1>
          <p className="text-gray-500 mb-8">
            Heb je een vraag of wil je meer informatie? Vul het formulier in en we nemen zo snel mogelijk contact met je op.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bericht verzonden!</h2>
              <p className="text-gray-600 mb-6">
                Bedankt voor je bericht. Wij nemen zo snel mogelijk contact met je op.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-smartlease-yellow text-white rounded-xl font-semibold hover:bg-smartlease-yellow/90 transition"
              >
                Nieuw bericht sturen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.naam}
                    onChange={(e) => setForm({ ...form, naam: e.target.value })}
                    placeholder="Je volledige naam"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="naam@voorbeeld.nl"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefoonnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.telefoon}
                  onChange={(e) => setForm({ ...form, telefoon: e.target.value })}
                  placeholder="06 - 12345678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bericht
                </label>
                <textarea
                  value={form.bericht}
                  onChange={(e) => setForm({ ...form, bericht: e.target.value })}
                  placeholder="Waar kunnen we je mee helpen?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-smartlease-yellow text-white rounded-xl font-semibold hover:bg-smartlease-yellow/90 active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {loading ? 'Verzenden...' : 'Verstuur bericht'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-28">
            <h2 className="font-bold text-gray-900 text-lg">Meer weten?</h2>

            <a
              href="tel:0858008777"
              className="flex items-center gap-4 p-4 rounded-xl bg-smartlease-yellow/5 hover:bg-smartlease-yellow/10 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-smartlease-yellow/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-smartlease-yellow" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-smartlease-yellow transition">085 - 80 08 600</p>
                <p className="text-xs text-gray-400">Bel ons direct</p>
              </div>
            </a>

            <a
              href="https://wa.me/31613669328"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50 hover:bg-green-50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition">WhatsApp</p>
                <p className="text-xs text-gray-400">Direct antwoord</p>
              </div>
            </a>

            <a
              href="mailto:info@smartlease.nl"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-smartlease-yellow transition">info@smartlease.nl</p>
                <p className="text-xs text-gray-400">Stuur een email</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Bereikbaarheid</p>
                <p className="text-xs text-gray-400">Ma - Vr: 9:00 - 18:00</p>
              </div>
            </div>

            {/* Links naar andere pagina's */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-500 mb-3">Handige links</p>
              <div className="space-y-2">
                {[
                  { label: 'Financial lease', href: '/financial-lease' },
                  { label: 'Lease calculator', href: '/calculator' },
                  { label: 'Aanbod', href: '/aanbod' },
                  { label: 'AI Keuzehulp', href: '/keuzehulp' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-smartlease-yellow hover:underline"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}