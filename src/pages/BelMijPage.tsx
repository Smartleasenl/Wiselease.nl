import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { submitLead } from '../lib/leadService';
import {
  Phone,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  Car,
  Calculator,
  User,
  Building2,
  ArrowLeft,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface VehicleData {
  id: number;
  merk: string;
  model: string;
  uitvoering?: string;
  bouwjaar?: string;
  verkoopprijs?: number;
  brandstof?: string;
  transmissie?: string;
  kmstand?: number;
  small_picture?: string;
}

interface CalculatorData {
  looptijd: number;
  aanbetaling: number;
  maandbedrag: number;
  slottermijn: number;
  financieringsbedrag?: number;
}

interface BelMijForm {
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  bedrijfsnaam: string;
  kvk_nummer: string;
  bericht: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtKm = (n: number) => new Intl.NumberFormat('nl-NL').format(n);

function VehiclePhoto({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const [imgError, setImgError] = useState(false);
  if (!imageUrl || imgError) {
    return (
      <div className="w-full bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
        <Car className="h-10 w-10 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover object-center"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export function BelMijPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    vehicle?: VehicleData;
    calculator?: CalculatorData;
    cachedImageUrl?: string;
  } | null;

  const vehicle = state?.vehicle;
  const calculator = state?.calculator;
  const cachedImageUrl = state?.cachedImageUrl || vehicle?.small_picture || null;

  const [form, setForm] = useState<BelMijForm>({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: '',
    bedrijfsnaam: '',
    kvk_nummer: '',
    bericht: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const vehicleTitle = vehicle ? `${vehicle.merk} ${vehicle.model} ${vehicle.uitvoering || ''}`.trim() : '';

  // Bereken financieringsbedrag
  const financieringsbedrag = calculator?.financieringsbedrag
    ?? (calculator && vehicle?.verkoopprijs ? vehicle.verkoopprijs - calculator.aanbetaling : null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.voornaam.trim() || !form.achternaam.trim() || !form.telefoon.trim() || !form.email.trim()) {
      setError('Vul alle verplichte velden in.');
      setLoading(false);
      return;
    }

    if (!form.bedrijfsnaam.trim()) {
      setError('Bedrijfsnaam is verplicht.');
      setLoading(false);
      return;
    }

    const result = await submitLead({
      type: 'terugbelverzoek',
      voornaam: form.voornaam,
      achternaam: form.achternaam,
      naam: `${form.voornaam} ${form.achternaam}`,
      email: form.email,
      telefoon: form.telefoon,
      bedrijfsnaam: form.bedrijfsnaam,
      kvk_nummer: form.kvk_nummer,
      bericht: form.bericht || `Terugbelverzoek voor: ${vehicleTitle}`,
      vehicle_id: vehicle?.id,
      vehicle_info: vehicleTitle,
      calculator_data: calculator ? {
        looptijd: calculator.looptijd,
        aanbetaling: calculator.aanbetaling,
        maandbedrag: calculator.maandbedrag,
        slottermijn: calculator.slottermijn,
      } : undefined,
    });

    if (result.success) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bcjbghqrdlzwxgfuuxss.supabase.co';
        fetch(`${supabaseUrl}/functions/v1/send-offerte-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voornaam: form.voornaam,
            achternaam: form.achternaam,
            email: form.email,
            telefoon: form.telefoon,
            bedrijfsnaam: form.bedrijfsnaam,
            kvk_nummer: form.kvk_nummer,
            bericht: form.bericht,
            vehicle_info: vehicleTitle,
            vehicle_price: vehicle?.verkoopprijs,
            vehicle_image: cachedImageUrl,
            calculator: calculator,
            type: 'terugbelverzoek',
          }),
        }).catch(console.error);
      } catch (e) {
        console.error('Email sending failed:', e);
      }
    } else {
      setError(result.error || 'Er ging iets mis bij het versturen.');
    }
    setLoading(false);
  };

  // ── Bevestigingsscherm ──
  if (success) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-8 text-center text-white">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-bold mb-2">Terugbelverzoek verzonden!</h1>
              <p className="text-blue-100">Wij bellen je zo snel mogelijk terug.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">Je gegevens</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Naam</span>
                    <p className="font-medium text-gray-900">{form.voornaam} {form.achternaam}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Telefoon</span>
                    <p className="font-medium text-gray-900">{form.telefoon}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">E-mail</span>
                    <p className="font-medium text-gray-900">{form.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Bedrijf</span>
                    <p className="font-medium text-gray-900">{form.bedrijfsnaam}</p>
                  </div>
                </div>
              </div>

              {vehicle && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Voertuig</h3>
                  <div className="rounded-lg overflow-hidden mb-3">
                    <VehiclePhoto imageUrl={cachedImageUrl} title={vehicleTitle} />
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{vehicleTitle}</p>
                  {vehicle.verkoopprijs && vehicle.verkoopprijs > 0 && (
                    <p className="text-sm font-bold text-smartlease-teal mt-1">{fmt(vehicle.verkoopprijs)}</p>
                  )}
                </div>
              )}

              {/* Bevestiging berekening — volgorde: Aankoopprijs → Aanbetaling → Financieringsbedrag → Looptijd → Slottermijn → Maandbedrag */}
              {calculator && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Lease berekening</h3>
                  <div className="space-y-2 text-sm">
                    {vehicle?.verkoopprijs && vehicle.verkoopprijs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Aankoopprijs</span>
                        <span className="font-semibold text-gray-900">{fmt(vehicle.verkoopprijs)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aanbetaling</span>
                      <span className="font-semibold text-gray-900">{fmt(calculator.aanbetaling)}</span>
                    </div>
                    {financieringsbedrag && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Financieringsbedrag</span>
                        <span className="font-semibold text-gray-900">{fmt(financieringsbedrag)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Looptijd</span>
                      <span className="font-semibold text-gray-900">{calculator.looptijd} maanden</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Slottermijn</span>
                      <span className="font-semibold text-gray-900">{fmt(calculator.slottermijn)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">Maandbedrag</span>
                      <span className="font-bold text-smartlease-teal">€ {calculator.maandbedrag} p/m</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link to="/aanbod" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-smartlease-teal text-white rounded-xl font-semibold hover:bg-smartlease-teal/90 transition">
                  <Car className="h-5 w-5" /> Bekijk meer auto's
                </Link>
                <Link to="/" className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulier ──
  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-smartlease-teal transition">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/aanbod" className="hover:text-smartlease-teal transition">Aanbod</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Terugbelverzoek</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Formulier ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bel mij terug</h1>
                <p className="text-sm text-gray-500">Laat je gegevens achter en wij bellen je zo snel mogelijk terug</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-smartlease-teal" />
                  <h2 className="font-bold text-gray-900">Persoonlijke gegevens</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Voornaam <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.voornaam} onChange={(e) => setForm({ ...form, voornaam: e.target.value })} placeholder="Jan"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Achternaam <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.achternaam} onChange={(e) => setForm({ ...form, achternaam: e.target.value })} placeholder="de Vries"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres <span className="text-red-500">*</span></label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jan@bedrijf.nl"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefoonnummer <span className="text-red-500">*</span></label>
                    <input type="tel" required value={form.telefoon} onChange={(e) => setForm({ ...form, telefoon: e.target.value })} placeholder="06 - 12345678"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-smartlease-teal" />
                  <h2 className="font-bold text-gray-900">Bedrijfsgegevens</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrijfsnaam <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.bedrijfsnaam} onChange={(e) => setForm({ ...form, bedrijfsnaam: e.target.value })} placeholder="Bedrijfsnaam B.V."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">KvK-nummer <span className="text-gray-400 font-normal">(optioneel)</span></label>
                    <input type="text" value={form.kvk_nummer} onChange={(e) => setForm({ ...form, kvk_nummer: e.target.value })} placeholder="12345678" maxLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Wanneer kunnen we je het beste bellen? <span className="text-gray-400 font-normal">(optioneel)</span>
                </label>
                <textarea value={form.bericht} onChange={(e) => setForm({ ...form, bericht: e.target.value })}
                  placeholder="Bijv. 's ochtends tussen 9:00 en 12:00, of heb je nog specifieke vragen?" rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-teal/20 focus:border-smartlease-teal transition resize-y" />
              </div>

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-smartlease-blue text-white rounded-xl font-bold text-lg hover:bg-smartlease-blue/90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-lg shadow-smartlease-blue/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
                {loading ? 'Bezig met verzenden...' : 'Terugbelverzoek versturen'}
              </button>
              <p className="text-xs text-gray-400 text-center">Je gegevens worden veilig verwerkt en nooit gedeeld met derden.</p>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {vehicle && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <VehiclePhoto imageUrl={cachedImageUrl} title={vehicleTitle} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-4 w-4 text-smartlease-teal flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 text-sm">Gekozen voertuig</h3>
                    </div>
                    <h4 className="font-bold text-gray-900">{vehicle.merk} {vehicle.model}</h4>
                    {vehicle.uitvoering && <p className="text-xs text-gray-500 mt-0.5">{vehicle.uitvoering}</p>}
                    {vehicle.verkoopprijs && vehicle.verkoopprijs > 0 && (
                      <p className="text-lg font-bold text-smartlease-teal mt-2">{fmt(vehicle.verkoopprijs)}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      {vehicle.bouwjaar && (
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                          <span className="text-gray-400">Bouwjaar</span>
                          <p className="font-semibold text-gray-900">{vehicle.bouwjaar}</p>
                        </div>
                      )}
                      {vehicle.kmstand && (
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                          <span className="text-gray-400">Km-stand</span>
                          <p className="font-semibold text-gray-900">{fmtKm(vehicle.kmstand)} km</p>
                        </div>
                      )}
                      {vehicle.brandstof && (
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                          <span className="text-gray-400">Brandstof</span>
                          <p className="font-semibold text-gray-900">{vehicle.brandstof}</p>
                        </div>
                      )}
                      {vehicle.transmissie && (
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                          <span className="text-gray-400">Transmissie</span>
                          <p className="font-semibold text-gray-900">{vehicle.transmissie}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar berekening — volgorde: Aankoopprijs → Aanbetaling → Financieringsbedrag → Looptijd → Slottermijn → Maandbedrag */}
              {calculator && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h3 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3">
                    <Calculator className="h-4 w-4 text-smartlease-teal" /> Jouw berekening
                  </h3>
                  <div className="space-y-2">
                    {vehicle?.verkoopprijs && vehicle.verkoopprijs > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Aankoopprijs</span>
                        <span className="font-semibold text-gray-900">{fmt(vehicle.verkoopprijs)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Aanbetaling</span>
                      <span className="font-semibold text-gray-900">{fmt(calculator.aanbetaling)}</span>
                    </div>
                    {financieringsbedrag && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Financieringsbedrag</span>
                        <span className="font-semibold text-gray-900">{fmt(financieringsbedrag)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Looptijd</span>
                      <span className="font-semibold text-gray-900">{calculator.looptijd} maanden</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Slottermijn</span>
                      <span className="font-semibold text-gray-900">{fmt(calculator.slottermijn)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                      <span className="text-gray-900 font-semibold">Maandbedrag</span>
                      <span className="text-lg font-bold text-smartlease-teal">{fmt(calculator.maandbedrag)}/mnd</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm">Vragen?</h3>
                <a href="tel:0858008600" className="flex items-center gap-3 text-sm text-gray-600 hover:text-smartlease-teal transition">
                  <Phone className="h-4 w-4" /> 085 - 80 08 600
                </a>
                <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href="mailto:info@smartlease.nl" className="flex items-center gap-3 text-sm text-gray-600 hover:text-smartlease-teal transition">
                  <Mail className="h-4 w-4" /> info@smartlease.nl
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}