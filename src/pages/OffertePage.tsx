import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { submitLead } from '../lib/leadService';
import {
  FileText, Send, CheckCircle, Loader2, AlertCircle, Car, Calculator,
  User, Building2, ArrowLeft, Phone, Mail, MessageCircle,
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
  aankoopprijs?: number;
}

interface OfferteForm {
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  bedrijfsnaam: string;
  kvk_nummer: string;
  bericht: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bcjbghqrdlzwxgfuuxss.supabase.co';

export function OffertePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const vehicle: VehicleData | null = location.state?.vehicle || null;
  const calculator: CalculatorData | null = location.state?.calculator || null;
  const passedImageUrl: string | null = location.state?.cachedImageUrl || null;

  const [form, setForm] = useState<OfferteForm>({
    voornaam: '', achternaam: '', email: '', telefoon: '',
    bedrijfsnaam: '', kvk_nummer: '', bericht: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(passedImageUrl);
  const [imageLoading, setImageLoading] = useState(!passedImageUrl);

  useEffect(() => {
    if (!vehicle) { navigate('/aanbod', { replace: true }); }
  }, [vehicle, navigate]);

  useEffect(() => {
    if (passedImageUrl || !vehicle) return;
    setImageLoading(true);
    fetch(`${SUPABASE_URL}/functions/v1/cache-vehicle-image?vehicle_id=${vehicle.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.exists && data.url) setImageUrl(data.url);
        setImageLoading(false);
      })
      .catch(() => setImageLoading(false));
  }, [vehicle, passedImageUrl]);

  if (!vehicle) return null;

  const vehicleTitle = `${vehicle.merk} ${vehicle.model}${vehicle.uitvoering ? ' ' + vehicle.uitvoering : ''}`;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);

  const financieringsbedrag = calculator?.financieringsbedrag
    ?? (calculator && vehicle.verkoopprijs ? vehicle.verkoopprijs - calculator.aanbetaling : null);
  const aankoopprijs = calculator?.aankoopprijs ?? vehicle.verkoopprijs ?? null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.voornaam.trim() || !form.achternaam.trim()) { setError('Vul je voor- en achternaam in.'); setLoading(false); return; }
    if (!form.email.trim()) { setError('Vul je e-mailadres in.'); setLoading(false); return; }
    if (!form.telefoon.trim()) { setError('Vul je telefoonnummer in.'); setLoading(false); return; }
    if (!form.bedrijfsnaam.trim()) { setError('Vul je bedrijfsnaam in.'); setLoading(false); return; }

    const result = await submitLead({
      type: 'offerte',
      voornaam: form.voornaam,
      achternaam: form.achternaam,
      naam: `${form.voornaam} ${form.achternaam}`,
      email: form.email,
      telefoon: form.telefoon,
      bedrijfsnaam: form.bedrijfsnaam,
      kvk_nummer: form.kvk_nummer || undefined,
      bericht: form.bericht || `Offerte aanvraag voor: ${vehicleTitle}`,
      vehicle_id: vehicle.id,
      vehicle_info: vehicleTitle,
      calculator_data: calculator ? {
        looptijd: calculator.looptijd,
        aanbetaling: calculator.aanbetaling,
        maandbedrag: calculator.maandbedrag,
        slottermijn: calculator.slottermijn,
        financieringsbedrag: financieringsbedrag ?? undefined,
        aankoopprijs: aankoopprijs ?? undefined,
      } : undefined,
    });

    if (result.success) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      fetch(`${SUPABASE_URL}/functions/v1/send-offerte-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voornaam: form.voornaam, achternaam: form.achternaam,
          email: form.email, telefoon: form.telefoon,
          bedrijfsnaam: form.bedrijfsnaam, kvk_nummer: form.kvk_nummer,
          bericht: form.bericht, vehicle_info: vehicleTitle,
          vehicle_price: vehicle.verkoopprijs,
          vehicle_image: imageUrl || null,
          calculator: calculator,
        }),
      }).catch(console.error);
    } else {
      setError(result.error || 'Er ging iets mis bij het versturen.');
    }
    setLoading(false);
  };

  const VehicleImage = ({ className }: { className: string }) => {
    const [imgError, setImgError] = useState(false);
    if (imageLoading) return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
      </div>
    );
    if (!imageUrl || imgError) return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <Car className="h-10 w-10 text-gray-300" />
      </div>
    );
    return (
      <img
        src={imageUrl}
        alt={vehicleTitle}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  };

  // ── BEVESTIGING ──
  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center text-white">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-2xl font-bold mb-2">Offerte aanvraag verzonden!</h1>
            <p className="text-green-100">Wij nemen zo snel mogelijk contact met je op met een offerte op maat.</p>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-smartlease-yellow" /> Overzicht van je aanvraag
            </h2>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Voertuig</p>
              <div className="flex gap-4">
                <div className="w-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                  <VehicleImage className="w-full h-full object-cover object-center" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{vehicleTitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                    {vehicle.bouwjaar && <span>{vehicle.bouwjaar}</span>}
                    {vehicle.brandstof && <span>{vehicle.brandstof}</span>}
                    {vehicle.transmissie && <span>{vehicle.transmissie}</span>}
                    {vehicle.kmstand != null && <span>{vehicle.kmstand.toLocaleString('nl-NL')} km</span>}
                  </div>
                  {vehicle.verkoopprijs != null && (
                    <p className="text-smartlease-yellow font-bold mt-1">{formatPrice(vehicle.verkoopprijs)}</p>
                  )}
                </div>
              </div>
            </div>

            {calculator && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Lease berekening</p>
                {/* Volgorde: Aankoopprijs → Aanbetaling → Financieringsbedrag → Looptijd → Slottermijn → Maandbedrag */}
                <div className="space-y-2">
                  {aankoopprijs && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Aankoopprijs</span>
                      <span className="font-semibold text-gray-900">{formatPrice(aankoopprijs)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aanbetaling</span>
                    <span className="font-semibold text-gray-900">{formatPrice(calculator.aanbetaling)}</span>
                  </div>
                  {financieringsbedrag && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Financieringsbedrag</span>
                      <span className="font-semibold text-gray-900">{formatPrice(financieringsbedrag)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Looptijd</span>
                    <span className="font-semibold text-gray-900">{calculator.looptijd} maanden</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Slottermijn</span>
                    <span className="font-semibold text-gray-900">{formatPrice(calculator.slottermijn)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-900 font-semibold">Maandbedrag</span>
                    <span className="text-lg font-bold text-smartlease-yellow">{formatPrice(calculator.maandbedrag)}/mnd</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Jouw gegevens</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Naam:</span> <span className="text-gray-900 font-medium">{form.voornaam} {form.achternaam}</span></div>
                <div><span className="text-gray-400">E-mail:</span> <span className="text-gray-900 font-medium">{form.email}</span></div>
                <div><span className="text-gray-400">Telefoon:</span> <span className="text-gray-900 font-medium">{form.telefoon}</span></div>
                <div><span className="text-gray-400">Bedrijf:</span> <span className="text-gray-900 font-medium">{form.bedrijfsnaam}</span></div>
                {form.kvk_nummer && <div><span className="text-gray-400">KvK:</span> <span className="text-gray-900 font-medium">{form.kvk_nummer}</span></div>}
              </div>
              {form.bericht && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-400 text-sm">Opmerking:</span>
                  <p className="text-gray-900 text-sm mt-1">{form.bericht}</p>
                </div>
              )}
            </div>

            <div className="bg-smartlease-yellow/5 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-1">Wat gebeurt er nu?</p>
              <p>Je ontvangt een bevestigingsmail op <strong>{form.email}</strong>. Onze lease specialist neemt binnen 1 werkdag contact met je op.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/auto/${vehicle.id}/${encodeURIComponent(vehicleTitle.toLowerCase().replace(/\s+/g, '-'))}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-smartlease-yellow text-white rounded-xl font-semibold hover:bg-smartlease-yellow/90 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Terug naar auto
              </Link>
              <Link to="/aanbod" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                Bekijk meer auto's
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORMULIER ──
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-smartlease-yellow transition">Home</Link><span className="mx-2">›</span>
        <Link to="/aanbod" className="hover:text-smartlease-yellow transition">Aanbod</Link><span className="mx-2">›</span>
        <Link
          to={`/auto/${vehicle.id}/${encodeURIComponent(vehicleTitle.toLowerCase().replace(/\s+/g, '-'))}`}
          className="hover:text-smartlease-yellow transition"
        >
          {vehicleTitle}
        </Link><span className="mx-2">›</span>
        <span className="text-gray-700">Offerte aanvragen</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gratis offerte aanvragen</h1>
      <p className="text-gray-500 mb-8">Vul je gegevens in en ontvang binnen 1 werkdag een offerte op maat.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulier */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <User className="h-5 w-5 text-smartlease-yellow" /> Persoonlijke gegevens
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Voornaam <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.voornaam} onChange={e => setForm({...form, voornaam: e.target.value})} placeholder="Jan"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Achternaam <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.achternaam} onChange={e => setForm({...form, achternaam: e.target.value})} placeholder="de Vries"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres <span className="text-red-500">*</span></label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jan@bedrijf.nl"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefoonnummer <span className="text-red-500">*</span></label>
                  <input type="tel" required value={form.telefoon} onChange={e => setForm({...form, telefoon: e.target.value})} placeholder="06 - 12345678"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                <Building2 className="h-5 w-5 text-smartlease-yellow" /> Bedrijfsgegevens
              </h2>
              <p className="text-xs text-gray-400 mb-4">Smartlease bedient uitsluitend zakelijke klanten.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrijfsnaam <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.bedrijfsnaam} onChange={e => setForm({...form, bedrijfsnaam: e.target.value})} placeholder="Bedrijf B.V."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">KvK-nummer <span className="text-gray-400 font-normal">(optioneel)</span></label>
                  <input type="text" value={form.kvk_nummer} onChange={e => setForm({...form, kvk_nummer: e.target.value})} placeholder="12345678" maxLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Opmerking <span className="text-gray-400 font-normal">(optioneel)</span></label>
              <textarea value={form.bericht} onChange={e => setForm({...form, bericht: e.target.value})}
                placeholder="Heb je nog specifieke wensen of vragen?" rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition resize-y" />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-smartlease-yellow text-white rounded-xl font-bold text-lg hover:bg-smartlease-yellow/90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-lg shadow-smartlease-yellow/20">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {loading ? 'Bezig met verzenden...' : 'Offerte aanvragen'}
            </button>
            <p className="text-xs text-gray-400 text-center">Door op 'Offerte aanvragen' te klikken ga je akkoord met onze voorwaarden.</p>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-4 sticky top-28">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div style={{ aspectRatio: '4/3' }} className="w-full overflow-hidden bg-gray-100">
                <VehicleImage className="w-full h-full object-cover object-center" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 leading-snug">{vehicleTitle}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                  {vehicle.bouwjaar && <span>{vehicle.bouwjaar}</span>}
                  {vehicle.brandstof && <span>• {vehicle.brandstof}</span>}
                  {vehicle.transmissie && <span>• {vehicle.transmissie}</span>}
                </div>
                {vehicle.kmstand != null && (
                  <p className="text-xs text-gray-400 mt-1">{vehicle.kmstand.toLocaleString('nl-NL')} km</p>
                )}
                {vehicle.verkoopprijs != null && (
                  <p className="text-lg font-bold text-smartlease-yellow mt-2">{formatPrice(vehicle.verkoopprijs)}</p>
                )}
              </div>
            </div>

            {/* Berekening sidebar — volgorde: Aankoopprijs → Aanbetaling → Financieringsbedrag → Looptijd → Slottermijn → Maandbedrag */}
            {calculator && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3">
                  <Calculator className="h-4 w-4 text-smartlease-yellow" /> Jouw berekening
                </h3>
                <div className="space-y-2">
                  {aankoopprijs && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Aankoopprijs</span>
                      <span className="font-semibold text-gray-900">{formatPrice(aankoopprijs)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aanbetaling</span>
                    <span className="font-semibold text-gray-900">{formatPrice(calculator.aanbetaling)}</span>
                  </div>
                  {financieringsbedrag && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Financieringsbedrag</span>
                      <span className="font-semibold text-gray-900">{formatPrice(financieringsbedrag)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Looptijd</span>
                    <span className="font-semibold text-gray-900">{calculator.looptijd} maanden</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Slottermijn</span>
                    <span className="font-semibold text-gray-900">{formatPrice(calculator.slottermijn)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="text-gray-900 font-semibold">Maandbedrag</span>
                    <span className="text-lg font-bold text-smartlease-yellow">{formatPrice(calculator.maandbedrag)}/mnd</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Vragen?</h3>
              <a href="tel:0858008600" className="flex items-center gap-3 text-sm text-gray-600 hover:text-smartlease-yellow transition">
                <Phone className="h-4 w-4" /> 085 - 80 08 600
              </a>
              <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href="mailto:info@smartlease.nl" className="flex items-center gap-3 text-sm text-gray-600 hover:text-smartlease-yellow transition">
                <Mail className="h-4 w-4" /> info@smartlease.nl
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}