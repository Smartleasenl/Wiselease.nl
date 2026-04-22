import { useCanonical } from '../hooks/useCanonical';
import { useState, useMemo } from 'react';
import { Search, X, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── CONFIG ── wordt per site overschreven
const SITE = {
  naam: 'Wiselease',
  kleur: 'yellow' as 'emerald' | 'teal' | 'yellow',
  telefoon: '085 - 80 08 600',
  telefoonHref: 'tel:0858008600',
  email: 'info@wiselease.nl',
  whatsapp: 'https://wa.me/31613669328',
  aanbodUrl: '/aanbod',
};

type Kleur = typeof SITE.kleur;

const kl = (k: Kleur) => ({
  emerald: {
    bg: 'bg-emerald-600', bgLight: 'bg-emerald-50', border: 'border-emerald-500',
    text: 'text-emerald-700', textLight: 'text-emerald-600',
    activeCat: 'bg-emerald-600 text-white border-emerald-600',
    openItem: 'border-emerald-400',
    openQ: 'text-emerald-700',
    iconOpen: 'bg-emerald-50 text-emerald-600 border-emerald-300',
    focus: 'focus:ring-emerald-500',
    highlight: 'bg-emerald-100 text-emerald-800',
    cta: 'bg-emerald-600',
    ctaBtn: 'bg-white text-emerald-700 hover:bg-emerald-50',
    ctaBtnAlt: 'bg-emerald-700 text-white hover:bg-emerald-800',
  },
  teal: {
    bg: 'bg-teal-600', bgLight: 'bg-teal-50', border: 'border-teal-500',
    text: 'text-teal-700', textLight: 'text-teal-600',
    activeCat: 'bg-teal-600 text-white border-teal-600',
    openItem: 'border-teal-400',
    openQ: 'text-teal-700',
    iconOpen: 'bg-teal-50 text-teal-600 border-teal-300',
    focus: 'focus:ring-teal-500',
    highlight: 'bg-teal-100 text-teal-800',
    cta: 'bg-teal-600',
    ctaBtn: 'bg-white text-teal-700 hover:bg-teal-50',
    ctaBtnAlt: 'bg-teal-700 text-white hover:bg-teal-800',
  },
  yellow: {
    bg: 'bg-yellow-400', bgLight: 'bg-yellow-50', border: 'border-yellow-400',
    text: 'text-yellow-700', textLight: 'text-yellow-600',
    activeCat: 'bg-yellow-400 text-slate-900 border-yellow-400',
    openItem: 'border-yellow-400',
    openQ: 'text-yellow-700',
    iconOpen: 'bg-yellow-50 text-yellow-600 border-yellow-300',
    focus: 'focus:ring-yellow-400',
    highlight: 'bg-yellow-100 text-yellow-800',
    cta: 'bg-yellow-400',
    ctaBtn: 'bg-white text-slate-800 hover:bg-yellow-50',
    ctaBtnAlt: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
}[k]);

interface FAQ { vraag: string; antwoord: string[]; }
interface Categorie { id: string; titel: string; emoji: string; vragen: FAQ[]; }

const CATEGORIEEN: Categorie[] = [
  {
    id: 'financial-lease', titel: 'Financial Lease', emoji: '📋',
    vragen: [
      {
        vraag: 'Wat is financial lease en hoe werkt het bij Wiselease?',
        antwoord: [
          'Bij financial lease financiert Wiselease de aankoop van jouw auto. Jij betaalt maandelijks een vast bedrag en bent direct economisch eigenaar van het voertuig. De juridische eigendom ligt tijdelijk bij Wiselease als zekerheid voor de financiering.',
          'Aan het einde van de looptijd betaal je de afgesproken slottermijn — daarna is de auto volledig en juridisch van jou. Er is geen kilometergrens en je hebt volledige vrijheid in het gebruik van de auto.',
          'Het grote voordeel ten opzichte van een traditionele lening is dat je als BTW-plichtige ondernemer de BTW op de aanschafprijs kunt verrekenen en dat je vaste, voorspelbare maandlasten hebt voor de gehele looptijd.',
        ],
      },
      {
        vraag: 'Wat is het verschil tussen financial lease en operational of private lease?',
        antwoord: [
          'Bij financial lease word jij uiteindelijk eigenaar van de auto. Verzekering, wegenbelasting en onderhoud regel je zelf — dit geeft je keuzevrijheid én fiscale voordelen. Na de slottermijn is de auto volledig van jou.',
          'Bij operational lease en private lease blijft de auto altijd eigendom van de leasemaatschappij. Alles is inbegrepen in één maandbedrag, maar aan het einde lever je de auto in. Deze vormen zijn duurder maar volledig zorgeloos.',
          'Financial lease is ideaal voor ondernemers die willen profiteren van fiscale voordelen én eigenaar willen worden van de auto. Heb je liever maximale ontzorging en geen binding? Dan past operational lease beter.',
        ],
      },
      {
        vraag: 'Wat zijn de fiscale voordelen van financial lease voor ondernemers?',
        antwoord: [
          'Als BTW-plichtige ondernemer kun je de BTW op de aanschafprijs (deels) terugvorderen bij de Belastingdienst. De exacte terugvordering hangt af van het zakelijk gebruik van de auto.',
          'De rente die je betaalt over het gefinancierde bedrag is volledig aftrekbaar als bedrijfskosten. Dit verlaagt je belastbare winst en dus je belastingafdracht.',
          'Houd rekening met de bijtelling als je de auto ook privé gebruikt. Bespreek de exacte fiscale gevolgen altijd met jouw accountant, want dit verschilt per rechtsvorm en situatie.',
        ],
      },
      {
        vraag: 'Kan ik als startende ondernemer financial lease aanvragen?',
        antwoord: [
          'Ja, ook startende ondernemers zijn welkom bij Wiselease. Er geldt geen minimale bedrijfsduur. Elke aanvraag wordt individueel beoordeeld op basis van jouw financiële situatie en bedrijfsprofiel.',
          'Voor startende ondernemers kan een hogere aanbetaling gevraagd worden om het risico te beperken. Een goede onderbouwing van je inkomsten helpt bij de beoordeling.',
          'Twijfel je of je in aanmerking komt? Neem vrijblijvend contact op. Wij denken graag mee over de mogelijkheden, zonder verplichtingen.',
        ],
      },
    ],
  },
  {
    id: 'voorwaarden', titel: 'Voorwaarden & Doelgroep', emoji: '✅',
    vragen: [
      {
        vraag: 'Voor wie is financial lease bij Wiselease bedoeld?',
        antwoord: [
          'Wiselease richt zich uitsluitend op zakelijke klanten met een actieve KVK-inschrijving: ZZP\'ers, eenmanszaken, VOF\'s, BV\'s, coöperaties en overige rechtspersonen.',
          'Particulieren zonder KVK-inschrijving kunnen helaas geen financial lease aanvragen. Financial lease is juridisch en fiscaal ingericht voor ondernemers.',
          'Heb je net een bedrijf gestart en ben je bezig met de KVK-inschrijving? Wacht tot de inschrijving definitief is voor je een aanvraag doet.',
        ],
      },
      {
        vraag: 'Kan ik financial lease aanvragen met een BKR-registratie?',
        antwoord: [
          'Een BKR-registratie is zeker geen dealbreaker bij Wiselease. In maar liefst 90% van de gevallen vinden wij toch een passende oplossing, ook met een bestaande BKR-registratie.',
          'Afhankelijk van de aard en het bedrag van de registratie kan een hogere aanbetaling gevraagd worden — variërend van 5% tot 20% van de voertuigwaarde. Dit vergroot de kans op goedkeuring aanzienlijk.',
          'Twijfel je? Neem vrijblijvend contact op. Wij beoordelen jouw aanvraag discreet en persoonlijk.',
        ],
      },
      {
        vraag: 'Welke documenten heb ik nodig voor een aanvraag?',
        antwoord: [
          'Voor een eerste aanvraag heb je minimaal nodig: je KVK-nummer, naam, telefoonnummer en e-mailadres. Wij nemen daarna contact met je op om de aanvraag verder te bespreken.',
          'Afhankelijk van de financieringsaanvraag kunnen aanvullende documenten worden gevraagd, zoals een jaarverslag, bankafschriften of inkomensverklaring.',
          'Wij begeleiden je stap voor stap door het proces. Het aanvraagproces is zo eenvoudig en snel mogelijk ingericht.',
        ],
      },
    ],
  },
  {
    id: 'importproces', titel: 'Ons Aanbod', emoji: '🚗',
    vragen: [
      {
        vraag: 'Hoe werkt het het aanbod bij Wiselease?',
        antwoord: [
          'Wiselease importeert auto\'s rechtstreeks uit Europa via een uitgebreid netwerk van meer dan 250.000 voertuigen. Hierdoor leveren wij dezelfde auto vaak 10 tot 25% goedkoper dan bij een Nederlandse dealer.',
          'Wij regelen het volledige importproces: aankoop bij de Europese dealer, BPM-aangifte, inschrijving in het Nederlands kentekenregister en transport naar Nederland. Jij hoeft niets te doen.',
          'Na afronding ontvang je de auto rijklaar inclusief Nederlands kenteken. De gemiddelde levertijd na akkoord op de offerte is twee tot vier weken, afhankelijk van beschikbaarheid en land van herkomst.',
        ],
      },
      {
        vraag: 'Welke merken en modellen zijn beschikbaar via Wiselease?',
        antwoord: [
          'Via ons Europese netwerk zijn meer dan 250.000 auto\'s beschikbaar van vrijwel alle merken: van Volkswagen, BMW, Mercedes-Benz, Audi en Toyota tot Porsche, Bentley en Ferrari.',
          'Het aanbod omvat alle categorieën: hatchbacks, gezinsauto\'s, SUV\'s, coupés, cabriolets, bestelwagens én elektrische voertuigen. Filter eenvoudig op merk, model, bouwjaar of prijs via onze website.',
          'Staat jouw gewenste auto er niet tussen? Geen probleem — wij zoeken gericht voor je in ons netwerk. Vertel ons wat je zoekt en wij vinden de juiste auto.',
        ],
      },
      {
        vraag: 'Zijn er ook elektrische auto\'s beschikbaar via Wiselease?',
        antwoord: [
          'Ja, Wiselease levert ook elektrische auto\'s via financial lease. In ons Europese netwerk zijn modellen beschikbaar van Tesla, Volkswagen, BMW, Hyundai, Kia, Renault en vele andere merken.',
          'Elektrische auto\'s leasen via Wiselease kan fiscaal interessant zijn vanwege de lagere bijtellingspercentages voor volledig elektrische voertuigen.',
          'Onze adviseurs informeren je graag over de actuele fiscale voordelen en subsidies voor elektrische auto\'s.',
        ],
      },
      {
        vraag: 'Kan ik een specifieke auto aanvragen die niet in het aanbod staat?',
        antwoord: [
          'Absoluut. Als je een specifieke auto op het oog hebt — een bepaald merk, model, bouwjaar, kleur of uitvoering — zoeken wij gericht voor je in ons netwerk van duizenden dealers.',
          'Neem contact op met onze specialisten en beschrijf zo specifiek mogelijk wat je zoekt. Wij geven je een eerlijk advies over beschikbaarheid, importkosten en levertijd.',
        ],
      },
    ],
  },
  {
    id: 'financiering', titel: 'Financiering & Kosten', emoji: '💰',
    vragen: [
      {
        vraag: 'Is een aanbetaling verplicht bij Wiselease?',
        antwoord: [
          'Bij Wiselease geldt een minimale aanbetaling van 10% van de voertuigprijs. Een hogere aanbetaling verlaagt je maandlasten en de totale rentekosten.',
          'Een hogere aanbetaling heeft wel voordelen: lagere maandlasten en minder totale rentekosten. Gebruik onze online calculator om het effect op je maandbedrag te berekenen.',
          'Bij een BKR-registratie of startende ondernemers kan een aanbetaling van 5% tot 20% gevraagd worden.',
        ],
      },
      {
        vraag: 'Welke looptijden zijn mogelijk bij Wiselease?',
        antwoord: [
          'Je kunt kiezen uit: 12, 18, 24, 30, 36, 42, 48, 54, 60, 66 of 72 maanden. Dit geeft je de flexibiliteit om de looptijd te kiezen die het beste past bij jouw situatie.',
          'Een kortere looptijd geeft hogere maandlasten maar minder totale rentekosten. Een langere looptijd verlaagt de maandlasten maar je betaalt langer rente.',
        ],
      },
      {
        vraag: 'Hoe wordt mijn maandbedrag berekend?',
        antwoord: [
          'Het maandbedrag is gebaseerd op vier factoren: voertuigprijs, aanbetaling, looptijd en de vaste rente. Het te financieren bedrag is de voertuigprijs minus de aanbetaling.',
          'Aan het einde van de looptijd betaal je de slottermijn (restwaarde). Een hogere restwaarde verlaagt je maandbedrag maar je betaalt een groter bedrag ineens aan het einde.',
          'Gebruik onze gratis online lease calculator voor een directe indicatie van jouw maandbedrag — geen verplichtingen, geen registratie.',
        ],
      },
      {
        vraag: 'Wat is de rente bij Wiselease?',
        antwoord: [
          'De rente is vast voor de gehele looptijd. Je maandbedrag stijgt nooit — je weet exact waar je aan toe bent.',
          'De exacte rentehoogte is afhankelijk van de hoogte van de financiering, de looptijd, het voertuig en jouw ondernemersprofiel. Vraag een vrijblijvende offerte aan voor een persoonlijk aanbod.',
        ],
      },
      {
        vraag: 'Wat zijn de kosten naast het maandbedrag?',
        antwoord: [
          'Naast het maandbedrag rekent Wiselease eenmalige bemiddelingskosten van €150 excl. BTW.',
          'Het maandbedrag dekt uitsluitend de financiering. Verzekering, wegenbelasting en onderhoud zijn niet inbegrepen en komen voor jouw rekening — dit geeft je de vrijheid om dit naar eigen inzicht te regelen.',
          'Importkosten zijn onderdeel van de voertuigprijs en worden niet apart in rekening gebracht.',
        ],
      },
      {
        vraag: 'Wat gebeurt er aan het einde van de looptijd?',
        antwoord: [
          'Aan het einde van de looptijd betaal je de afgesproken slottermijn. Na betaling is de auto volledig en juridisch van jou. Er is geen kilometergrens en je hoeft de auto niet in te leveren.',
          'Je kunt de slottermijn betalen uit eigen middelen, herfinancieren of de auto verkopen. Onze specialisten adviseren je graag over de beste aanpak.',
        ],
      },
    ],
  },
  {
    id: 'operational-lease', titel: 'Operational Lease', emoji: '🔄',
    vragen: [
      {
        vraag: 'Wat is operational lease en wat is er inbegrepen bij Wiselease?',
        antwoord: [
          'Bij operational lease van Wiselease rij jij een auto waarbij alles is inbegrepen in één vast maandbedrag: verzekering, wegenbelasting, onderhoud én reparaties. Aan het einde van de looptijd lever je de auto in.',
          'Operational lease is de meest zorgeloze manier van autorijden voor ondernemers. Je weet exact wat je maandelijks betaalt, hebt nooit onverwachte kosten en hoeft je niet bezig te houden met verzekering of onderhoud.',
          'Wiselease biedt operational lease aan met looptijden van 24, 36, 48 of 60 maanden. Na afloop lever je de auto in en kun je indien gewenst een nieuwe auto leasen.',
        ],
      },
      {
        vraag: 'Is er een kilometergrens bij operational lease van Wiselease?',
        antwoord: [
          'Ja, bij operational lease wordt vooraf een geschat jaarkilometrage afgesproken — dit is de basis voor de berekening van het maandbedrag.',
          'Gangbare opties zijn 10.000, 15.000, 20.000, 25.000 of 30.000 kilometer per jaar. Rij je meer dan afgesproken, dan betaal je een meerprijs per kilometer aan het einde. Rij je minder, dan ontvang je soms een vergoeding.',
          'Schat je kilometers zo realistisch mogelijk in. Onze adviseurs helpen je bij het kiezen van het juiste kilometerplan.',
        ],
      },
      {
        vraag: 'Wat is het verschil tussen financial lease en operational lease bij Wiselease?',
        antwoord: [
          'Bij financial lease word jij eigenaar van de auto na de slottermijn. Verzekering en onderhoud regel je zelf — dit geeft fiscale voordelen maar vraagt meer eigen verantwoordelijkheid.',
          'Bij operational lease is alles inbegrepen en lever je de auto in aan het einde. Dit is de meest zorgeloze optie maar je wordt geen eigenaar van het voertuig.',
          'Wiselease helpt je graag bij het kiezen van de leasevorm die het beste aansluit bij jouw situatie en wensen.',
        ],
      },
    ],
  },
  {
    id: 'aanvraag', titel: 'Aanvraag & Service', emoji: '⚡',
    vragen: [
      {
        vraag: 'Hoe snel word ik geholpen na mijn aanvraag?',
        antwoord: [
          'Wiselease streeft ernaar aanvragen direct te verwerken. Na het indienen van je aanvraag nemen wij zo snel mogelijk contact op — in de meeste gevallen nog dezelfde dag.',
          'Na akkoord op de offerte en afronding van de financiering bedraagt de gemiddelde levertijd twee tot vier weken.',
        ],
      },
      {
        vraag: 'Hoe vraag ik een vrijblijvende offerte aan?',
        antwoord: [
          'Kies een auto uit ons aanbod, stel de gewenste aanbetaling en looptijd in via onze calculator en klik op "Gratis offerte aanvragen". Vul je gegevens in en een specialist neemt contact op.',
          'Je kunt ook direct bellen, mailen of een terugbelverzoek doen via de website. De offerte is volledig vrijblijvend en kosteloos.',
        ],
      },
      {
        vraag: 'Is de offerte van Wiselease vrijblijvend?',
        antwoord: [
          'Ja, volledig. Er zijn geen kosten verbonden aan het aanvragen of ontvangen van een offerte. Je bent nergens aan gebonden totdat je het contract tekent.',
          'Wij adviseren je graag zonder verkoopdruk. Onze specialisten nemen de tijd om jouw situatie goed te begrijpen.',
        ],
      },
    ],
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CATEGORIEEN.flatMap(cat =>
    cat.vragen.map(faq => ({
      '@type': 'Question',
      name: faq.vraag,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.antwoord.join(' '),
      },
    }))
  ),
};

function highlight(text: string, zoekterm: string) {
  if (!zoekterm.trim()) return <>{text}</>;
  const regex = new RegExp(`(${zoekterm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-sm px-0.5 not-italic">{part}</mark>
          : part
      )}
    </>
  );
}

function FaqItem({ vraag, antwoord, zoekterm, kleur }: FAQ & { zoekterm: string; kleur: Kleur }) {
  const [open, setOpen] = useState(false);
  const c = kl(kleur);
  return (
    <div className={`border rounded-xl transition-all duration-200 bg-white ${open ? `${c.openItem}` : 'border-slate-200 hover:border-slate-300'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className={`font-semibold text-sm sm:text-[15px] leading-snug mt-0.5 ${open ? c.openQ : 'text-slate-900'}`}>
          {highlight(vraag, zoekterm)}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all mt-0.5 ${open ? c.iconOpen : 'border-slate-200 text-slate-400'}`}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-3">
          {antwoord.map((alinea, i) => (
            <p key={i} className="text-sm text-slate-600 leading-relaxed">
              {highlight(alinea, zoekterm)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VeelgesteldeVragenPage() {
  useCanonical();
  const [zoekterm, setZoekterm] = useState('');
  const [actief, setActief] = useState<string | null>(null);
  const c = kl(SITE.kleur);
  const totaal = CATEGORIEEN.reduce((a, c) => a + c.vragen.length, 0);

  const gefilterd = useMemo(() => {
    let cats = actief ? CATEGORIEEN.filter(c => c.id === actief) : CATEGORIEEN;
    if (!zoekterm.trim()) return cats;
    const q = zoekterm.toLowerCase();
    return cats.map(cat => ({
      ...cat,
      vragen: cat.vragen.filter(faq =>
        faq.vraag.toLowerCase().includes(q) ||
        faq.antwoord.join(' ').toLowerCase().includes(q)
      ),
    })).filter(cat => cat.vragen.length > 0);
  }, [zoekterm, actief]);

  const totaalGefilterd = gefilterd.reduce((a, c) => a + c.vragen.length, 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-slate-900 pt-12 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Helpcentrum</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Veelgestelde vragen</h1>
            <p className="text-slate-400 text-base mb-8">
              {totaal} vragen over financial lease en auto importeren. Eerlijke antwoorden.
            </p>
            {/* Zoekbalk */}
            <div className="relative max-w-lg mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={zoekterm}
                onChange={e => setZoekterm(e.target.value)}
                placeholder="Zoek een vraag..."
                className={`w-full pl-10 pr-10 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 ${c.focus} focus:border-transparent`}
              />
              {zoekterm && (
                <button onClick={() => setZoekterm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categorie grid — GEEN horizontaal scrollen */}
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => setActief(null)}
              className={`rounded-xl py-3 px-2 text-center border transition-all text-sm font-medium ${!actief ? c.activeCat : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <span className="block text-lg mb-0.5">📚</span>
              <span className="block text-xs">Alles</span>
              <span className="block text-xs opacity-70 mt-0.5">{totaal}</span>
            </button>
            {CATEGORIEEN.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActief(actief === cat.id ? null : cat.id)}
                className={`rounded-xl py-3 px-2 text-center border transition-all text-sm font-medium ${actief === cat.id ? c.activeCat : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <span className="block text-lg mb-0.5">{cat.emoji}</span>
                <span className="block text-xs leading-tight">{cat.titel}</span>
                <span className="block text-xs opacity-70 mt-0.5">{cat.vragen.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ content */}
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {zoekterm && (
            <p className="text-sm text-slate-500">
              {totaalGefilterd === 0 ? `Geen resultaten voor` : `${totaalGefilterd} ${totaalGefilterd === 1 ? 'vraag' : 'vragen'} voor`}{' '}
              "<strong className="text-slate-700">{zoekterm}</strong>"
              {totaalGefilterd > 0 && <button onClick={() => setZoekterm('')} className={`ml-2 ${c.textLight} hover:underline`}>wis</button>}
            </p>
          )}

          {gefilterd.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-slate-700 font-semibold mb-1">Geen vragen gevonden</p>
              <p className="text-slate-500 text-sm mb-4">Probeer een andere zoekterm of bekijk alle categorieën</p>
              <button onClick={() => { setZoekterm(''); setActief(null); }} className={`text-sm font-medium ${c.textLight} hover:underline`}>
                Toon alle vragen
              </button>
            </div>
          ) : (
            gefilterd.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <h2 className="text-base font-bold text-slate-800">{cat.titel}</h2>
                  <span className="text-xs text-slate-400 font-normal">({cat.vragen.length})</span>
                </div>
                <div className="space-y-2">
                  {cat.vragen.map(faq => (
                    <FaqItem key={faq.vraag} {...faq} zoekterm={zoekterm} kleur={SITE.kleur} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* CTA */}
          <div className={`${c.cta} rounded-2xl p-6 sm:p-8 text-center`}>
            <h3 className="text-xl font-bold text-white mb-2">Staat jouw vraag er niet bij?</h3>
            <p className="text-white/75 text-sm mb-5 leading-relaxed">
              Onze specialisten helpen je persoonlijk. Geen verkoopdruk, gewoon eerlijk advies.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a href={SITE.telefoonHref} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${c.ctaBtn}`}>
                <Phone size={15} /> {SITE.telefoon}
              </a>
              {SITE.whatsapp && (
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${c.ctaBtnAlt}`}>
                  💬 WhatsApp
                </a>
              )}
              <a href={`mailto:${SITE.email}`} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${c.ctaBtnAlt}`}>
                <Mail size={15} /> {SITE.email}
              </a>
              <Link to={SITE.aanbodUrl} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${c.ctaBtnAlt}`}>
                Bekijk ons aanbod →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
