// src/pages/OfferteVergelijkerPage.tsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ArrowRight, Phone, MessageCircle, TrendingDown, TrendingUp, Minus, RefreshCw, Shield, Zap, Star, X, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Step = 'upload' | 'analyzing' | 'result' | 'error';

interface OfferteData {
  aanbieder: string | null;
  merk: string | null;
  model: string | null;
  uitvoering: string | null;
  bouwjaar: number | null;
  verkoopprijs: number | null;
  looptijd_maanden: number | null;
  aanbetaling_bedrag: number | null;
  aanbetaling_percentage: number | null;
  slottermijn_bedrag: number | null;
  slottermijn_percentage: number | null;
  rente_percentage: number | null;
  maandbedrag: number | null;
}

interface Vergelijking {
  concurrent_maandbedrag: number | null;
  concurrent_params: {
    looptijd: number;
    aanbetaling_pct: number;
    slottermijn_pct: number;
    rente_pct: number | null;
  };
  smartlease_zelfde_params_maandbedrag: number | null;
  eerlijke_besparing_per_maand: number | null;
  eerlijke_besparing_totaal: number | null;
  smartlease_eigen_params_maandbedrag: number | null;
  smartlease_params: {
    looptijd: number;
    aanbetaling_pct: number;
    slottermijn_pct: number;
    rente_pct: number;
  };
}

const SUPABASE_URL = 'https://bcjbghqrdlzwxgfuuxss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamJnaHFyZGx6d3hnZnV1eHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NjY0MDAsImV4cCI6MjA1NjE0MjQwMH0.xMEbRBnMGSGn1OycpY4cDJSIGWfAFVSfnQMkuLiZcI4';

function fmtEuro(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  return `${n}%`;
}

export function OfferteVergelijkerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [offerte, setOfferte] = useState<OfferteData | null>(null);
  const [vergelijking, setVergelijking] = useState<Vergelijking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [leadSaved, setLeadSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStep('analyzing');
    setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 85)), 400);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-offerte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ fileData: b64, mimeType: file.type }),
      });
      clearInterval(iv);
      setProgress(100);
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.error || 'Er ging iets mis'); }
      const data = await resp.json();
      setOfferte(data.offerte);
      setVergelijking(data.vergelijking);
      setTimeout(() => setStep('result'), 500);
    } catch (e) {
      clearInterval(iv);
      setErrorMsg(e instanceof Error ? e.message : 'Er ging iets mis');
      setStep('error');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) processFile(f);
  }, [processFile]);

  const handleAanvragen = async () => {
    if (!leadSaved && offerte) {
      try {
        await supabase.from('leads').insert({
          bron: 'offerte_vergelijker',
          voertuig_info: offerte.merk && offerte.model ? `${offerte.merk} ${offerte.model}` : null,
          vergelijker_data: offerte,
          concurrent_aanbieder: offerte.aanbieder,
          concurrent_maandbedrag: vergelijking?.concurrent_maandbedrag,
          smartlease_maandbedrag: vergelijking?.smartlease_zelfde_params_maandbedrag,
          besparing_per_maand: vergelijking?.eerlijke_besparing_per_maand,
          status: 'nieuw',
        });
        setLeadSaved(true);
      } catch { /* silent */ }
    }
    const p = new URLSearchParams();
    if (offerte?.merk) p.set('merk', offerte.merk);
    if (offerte?.model) p.set('model', offerte.model);
    navigate(`/offerte?${p.toString()}`);
  };

  const reset = () => { setStep('upload'); setOfferte(null); setVergelijking(null); setFileName(''); setErrorMsg(''); };

  const besparing = vergelijking?.eerlijke_besparing_per_maand ?? null;
  const pos = besparing !== null && besparing > 10;
  const neu = besparing !== null && Math.abs(besparing) <= 10;

  const paramsDifferent = vergelijking ? (
    Math.abs((vergelijking.concurrent_params.aanbetaling_pct ?? 15) - 15) > 1 ||
    Math.abs((vergelijking.concurrent_params.slottermijn_pct ?? 10) - 10) > 1 ||
    (vergelijking.concurrent_params.looptijd ?? 72) !== 72
  ) : false;

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center gap-2 text-smartlease-yellow text-sm font-semibold mb-4">
            <Zap className="h-4 w-4" /><span>AI-gestuurde analyse</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Betaal je te veel<br /><span className="text-smartlease-yellow">voor je financial lease?</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">Upload je huidige offerte en ontvang binnen 10 seconden een <strong>eerlijke</strong> vergelijking — met dezelfde aanbetaling en looptijd.</p>
          <div className="flex flex-wrap gap-4 mt-6">
            {[{ icon: Shield, text: 'Veilig & privé' }, { icon: Zap, text: 'Resultaat in 10 sec' }, { icon: Star, text: '4,9 ★ beoordeling' }].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-gray-500"><I className="h-4 w-4 text-smartlease-yellow" /><span>{text}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {step === 'upload' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12 md:p-16 flex flex-col items-center text-center ${dragOver ? 'border-smartlease-yellow bg-smartlease-yellow/5' : 'border-gray-300 bg-white hover:border-smartlease-yellow'}`}
            >
              <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleChange} className="hidden" />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${dragOver ? 'bg-smartlease-yellow text-white' : 'bg-smartlease-yellow/10 text-smartlease-yellow'}`}>
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sleep je offerte hierheen</h3>
              <p className="text-gray-400 text-sm mb-4">of klik om een bestand te kiezen</p>
              <div className="flex gap-2">{['PDF','JPG','PNG'].map(f => <span key={f} className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{f}</span>)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="font-bold text-gray-800 mb-5">Hoe werkt de eerlijke vergelijking?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { n: '1', t: 'Upload je offerte', d: 'Foto of PDF van je huidige financial lease offerte' },
                  { n: '2', t: 'AI leest alle details', d: 'Aanbetaling, slottermijn, looptijd en alle financieringsgegevens worden gelezen' },
                  { n: '3', t: 'Eerlijke vergelijking', d: 'Zelfde aanbetaling & looptijd — zo zie je het echte verschil in maandbedrag' },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-smartlease-yellow text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{n}</div>
                    <div><p className="font-semibold text-gray-800 text-sm">{t}</p><p className="text-gray-400 text-sm mt-0.5">{d}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-gray-400"><Shield className="h-3.5 w-3.5 inline mr-1" />Je offerte wordt alleen gebruikt voor deze vergelijking en nooit gedeeld met derden.</p>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 md:p-16 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-smartlease-yellow/10 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-smartlease-yellow/10 flex items-center justify-center">
                <FileText className="h-9 w-9 text-smartlease-yellow" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Offerte wordt geanalyseerd...</h3>
            <p className="text-gray-400 text-sm mb-1">{fileName}</p>
            <p className="text-gray-400 text-sm mb-8">AI leest aanbetaling, slottermijn & looptijd voor een eerlijke vergelijking</p>
            <div className="w-full max-w-sm bg-gray-100 rounded-full h-2 mb-3">
              <div className="bg-smartlease-yellow h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
            <div className="mt-8 space-y-2 text-sm text-gray-400">
              {progress > 20 && <p>✓ Bestand ontvangen</p>}
              {progress > 45 && <p>✓ Aanbetaling & slottermijn gelezen...</p>}
              {progress > 65 && <p>✓ Financieringsgegevens geëxtraheerd...</p>}
              {progress > 80 && <p>✓ Eerlijke vergelijking wordt berekend...</p>}
            </div>
          </div>
        )}

        {step === 'result' && offerte && vergelijking && (
          <div className="space-y-6">
            {/* Banner */}
            <div className={`rounded-2xl p-6 md:p-8 ${pos ? 'bg-gradient-to-r from-emerald-500 to-yellow-500' : neu ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    {pos ? <TrendingDown className="h-7 w-7" /> : neu ? <Minus className="h-7 w-7" /> : <TrendingUp className="h-7 w-7" />}
                  </div>
                  <div>
                    {pos ? (
                      <>
                        <p className="text-white/80 text-sm">Bij gelijke voorwaarden bespaar jij</p>
                        <p className="text-3xl font-bold">{fmtEuro(besparing)} per maand</p>
                        {vergelijking.eerlijke_besparing_totaal && <p className="text-white/70 text-sm mt-0.5">{fmtEuro(vergelijking.eerlijke_besparing_totaal)} totaal over de looptijd</p>}
                      </>
                    ) : neu ? (
                      <>
                        <p className="text-white/80 text-sm">Bij gelijke voorwaarden</p>
                        <p className="text-2xl font-bold">Vergelijkbaar maandbedrag</p>
                        <p className="text-white/70 text-sm mt-0.5">Maar wij bieden meer service & zekerheid</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/80 text-sm">Bij gelijke voorwaarden is hun maandbedrag lager</p>
                        <p className="text-2xl font-bold">{fmtEuro(Math.abs(besparing ?? 0))} per maand verschil</p>
                        <p className="text-white/70 text-sm mt-0.5">Vraag toch een offerte — wij kijken mee</p>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={handleAanvragen} className="flex-shrink-0 bg-white text-gray-800 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 shadow-lg">
                  Vraag onze offerte aan <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Uitleg eerlijke vergelijking */}
            {paramsDifferent && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  <strong>Eerlijke vergelijking:</strong> Hun offerte heeft {fmtPct(vergelijking.concurrent_params.aanbetaling_pct)} aanbetaling en {fmtPct(vergelijking.concurrent_params.slottermijn_pct)} slottermijn. Wij berekenen ons maandbedrag met <strong>exact dezelfde parameters</strong> zodat je een eerlijk beeld krijgt.
                </p>
              </div>
            )}

            {/* Tabel */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg">Vergelijking op gelijke basis</h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {[offerte.merk, offerte.model, offerte.uitvoering].filter(Boolean).join(' ')}
                  {offerte.verkoopprijs ? ` • ${fmtEuro(offerte.verkoopprijs)}` : ''}
                </p>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <div className="p-4 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">Onderdeel</div>
                <div className="p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-l border-gray-100">{offerte.aanbieder || 'Huidige aanbieder'}</div>
                <div className="p-4 bg-smartlease-yellow/5 text-xs font-bold text-smartlease-yellow uppercase tracking-wider border-l border-gray-100">Smartlease.nl</div>

                {/* Maandbedrag — EERLIJK */}
                <div className="p-4 border-t border-gray-50">
                  <div className="font-semibold text-gray-700">Maandbedrag</div>
                  <div className="text-xs text-gray-400 mt-0.5">bij gelijke voorwaarden</div>
                </div>
                <div className="p-4 font-bold text-gray-800 text-lg border-t border-gray-50 border-l border-gray-100">{fmtEuro(vergelijking.concurrent_maandbedrag)}</div>
                <div className={`p-4 font-bold text-lg border-t border-gray-50 border-l border-gray-100 ${pos ? 'text-emerald-600' : 'text-gray-800'}`}>
                  {fmtEuro(vergelijking.smartlease_zelfde_params_maandbedrag)}
                  {pos && besparing && <div className="text-xs text-emerald-500 font-normal mt-0.5">{fmtEuro(besparing)} goedkoper/mnd</div>}
                </div>

                {/* Looptijd */}
                <div className="p-4 text-gray-500 border-t border-gray-50">Looptijd</div>
                <div className="p-4 text-gray-800 border-t border-gray-50 border-l border-gray-100">{vergelijking.concurrent_params.looptijd} mnd</div>
                <div className="p-4 text-gray-500 border-t border-gray-50 border-l border-gray-100">zelfde ({vergelijking.concurrent_params.looptijd} mnd)</div>

                {/* Aanbetaling */}
                <div className="p-4 text-gray-500 border-t border-gray-50">Aanbetaling</div>
                <div className="p-4 text-gray-800 border-t border-gray-50 border-l border-gray-100">
                  {fmtPct(vergelijking.concurrent_params.aanbetaling_pct)}
                  {offerte.aanbetaling_bedrag ? <span className="text-gray-400 text-xs ml-1">({fmtEuro(offerte.aanbetaling_bedrag)})</span> : null}
                </div>
                <div className="p-4 text-gray-500 border-t border-gray-50 border-l border-gray-100">zelfde ({fmtPct(vergelijking.concurrent_params.aanbetaling_pct)})</div>

                {/* Slottermijn */}
                <div className="p-4 text-gray-500 border-t border-gray-50">Slottermijn</div>
                <div className="p-4 text-gray-800 border-t border-gray-50 border-l border-gray-100">
                  {fmtPct(vergelijking.concurrent_params.slottermijn_pct)}
                  {offerte.slottermijn_bedrag ? <span className="text-gray-400 text-xs ml-1">({fmtEuro(offerte.slottermijn_bedrag)})</span> : null}
                </div>
                <div className="p-4 text-gray-500 border-t border-gray-50 border-l border-gray-100">zelfde ({fmtPct(vergelijking.concurrent_params.slottermijn_pct)})</div>
              </div>

              {/* Informatief: standaard Smartlease aanbod */}
              {paramsDifferent && vergelijking.smartlease_eigen_params_maandbedrag && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ons standaard aanbod (15% aanbetaling · 10% slottermijn · 72 mnd)</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Maandbedrag:</span>
                    <span className="font-bold text-gray-800">{fmtEuro(vergelijking.smartlease_eigen_params_maandbedrag)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Ander maandbedrag door andere aanbetaling/slottermijn — niet direct vergelijkbaar.</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="font-bold text-gray-800 text-lg mb-1">Interesse in ons aanbod?</h3>
              <p className="text-gray-400 text-sm mb-6">Vraag direct een persoonlijke offerte aan of neem contact op.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAanvragen} className="flex-1 bg-smartlease-yellow hover:bg-yellow-500 text-white font-bold px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />Gratis offerte aanvragen
                </button>
                <a href="tel:0858008777" className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-5 py-3.5 rounded-xl transition text-sm">
                  <Phone className="h-4 w-4" />085 - 80 08 600
                </a>
                <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-600 font-semibold px-5 py-3.5 rounded-xl transition text-sm">
                  <MessageCircle className="h-4 w-4" />WhatsApp
                </a>
              </div>
            </div>

            <div className="text-center">
              <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1.5 mx-auto">
                <RefreshCw className="h-3.5 w-3.5" />Andere offerte uploaden
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <X className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analyse mislukt</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={reset} className="bg-smartlease-yellow text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 justify-center">
                <RefreshCw className="h-4 w-4" />Opnieuw proberen
              </button>
              <a href="tel:0858008600" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-gray-300 transition flex items-center gap-2 justify-center text-sm">
                <Phone className="h-4 w-4" />Bel ons direct
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}