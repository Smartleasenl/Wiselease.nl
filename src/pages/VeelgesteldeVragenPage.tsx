import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Phone, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const SITE = {
  naam: 'Wiselease',
  telefoon: '085 - 80 08 600',
  telefoonHref: 'tel:0858008600',
  email: 'info@wiselease.nl',
  kleur: 'smartlease-yellow',
  accent: '#0d9488',
  aanbodUrl: '/aanbod',
  contactUrl: '/contact',
};

interface FAQ { vraag: string; antwoord: string | string[]; }
interface Categorie { id: string; titel: string; emoji: string; vragen: FAQ[]; }

const CATEGORIEEN: Categorie[] = [
  {
    id: 'financial-lease',
    titel: 'Financial Lease',
    emoji: '📋',
    vragen: [
      {
        vraag: 'Wat is financial lease en hoe werkt het bij Wiselease?',
        antwoord: [
          'Financial lease is een financieringsvorm waarbij Wiselease de auto voor jou aankoopt en jij de auto maandelijks aflost. Gedurende de looptijd gebruik jij de auto, maar de juridische eigendom ligt bij Wiselease als zekerheid voor de financiering.',
          'Aan het einde van de looptijd betaal je de afgesproken slottermijn (restwaarde) en wordt de auto volledig jouw eigendom. Je bent tijdens de gehele looptijd economisch eigenaar — dat betekent dat eventuele waardestijging voor jou is en dat je zelf keuzes maakt over verzekering, onderhoud en gebruik.',
          'Het grote voordeel ten opzichte van een traditionele autolening is dat je de BTW op de aanschafprijs kunt verrekenen (als BTW-plichtige ondernemer) en dat je vaste maandlasten hebt voor de gehele looptijd.',
        ],
      },
      {
        vraag: 'Wat is het verschil tussen financial lease en private lease of operational lease?',
        antwoord: [
          'Bij financial lease word jij uiteindelijk eigenaar van de auto. Je draagt zelf zorg voor verzekering, wegenbelasting en onderhoud — maar dit geeft je ook de vrijheid om te kiezen wat het beste bij jou past. Na het betalen van de slottermijn is de auto van jou.',
          'Bij private lease en operational lease blijft de auto altijd eigendom van de leasemaatschappij. Aan het einde van de looptijd lever je de auto in. Deze vormen zijn vaak duurder per maand, maar alles is inclusief: verzekering, onderhoud en wegenbelasting.',
          'Financial lease is ideaal voor ondernemers die willen profiteren van fiscale voordelen én uiteindelijk eigenaar willen worden van de auto. Operational lease past beter bij wie maximale ontzorging wil en geen binding wil aangaan.',
        ],
      },
      {
        vraag: 'Wat zijn de fiscale voordelen van financial lease voor ondernemers?',
        antwoord: [
          'Als BTW-ondernemer kun je de BTW op de aanschafprijs van de auto (deels) terugvorderen bij de Belastingdienst. De exacte terugvordering hangt af van het zakelijk gebruik van de auto.',
          'De rente die je betaalt over het gefinancierde bedrag is aftrekbaar als bedrijfskosten. Dit verlaagt je belastbare winst en dus je belastingafdracht.',
          'Houd er rekening mee dat bij een auto op de zaak de bijtelling van toepassing kan zijn als je de auto ook privé gebruikt. Bespreek de exacte fiscale gevolgen altijd met jouw accountant, want dit verschilt per rechtsvorm en situatie.',
        ],
      },
      {
        vraag: 'Kan ik als startende ondernemer ook financial lease aanvragen bij Wiselease?',
        antwoord: [
          'Ja, ook startende ondernemers kunnen een aanvraag indienen bij Wiselease. Er geldt geen minimale bedrijfsduur. Wij beoordelen elke aanvraag individueel op basis van jouw financiële situatie en het bedrijfsprofiel.',
          'Voor startende ondernemers kan het zijn dat een hogere aanbetaling gevraagd wordt om het financieringsrisico te beperken. Een goede onderbouwing van je ondernemersplan en inkomsten kan helpen bij de beoordeling.',
          'Twijfel je of je in aanmerking komt? Neem contact met ons op voor een vrijblijvende beoordeling. Wij denken graag mee over de mogelijkheden.',
        ],
      },
    ],
  },
  {
    id: 'voorwaarden',
    titel: 'Voorwaarden & Doelgroep',
    emoji: '✅',
    vragen: [
      {
        vraag: 'Voor wie is financial lease bij Wiselease bedoeld?',
        antwoord: [
          'Wiselease richt zich uitsluitend op zakelijke klanten met een actieve KVK-inschrijving. Denk aan ZZP\'ers, eenmanszaken, vennootschappen onder firma (VOF), besloten vennootschappen (BV), coöperaties en overige rechtspersonen.',
          'Particulieren zonder KVK-inschrijving kunnen bij Wiselease helaas geen financial lease aanvragen. Dit heeft te maken met de fiscale en juridische structuur van financial lease, die specifiek is ingericht voor ondernemers.',
          'Heb je net een bedrijf gestart en ben je nog bezig met de KVK-inschrijving? Wacht dan tot de inschrijving definitief is voordat je een aanvraag doet, zodat we je aanvraag volledig kunnen beoordelen.',
        ],
      },
      {
        vraag: 'Kan ik financial lease aanvragen als ik een BKR-registratie heb?',
        antwoord: [
          'Een BKR-registratie hoeft zeker geen dealbreaker te zijn bij Wiselease. In maar liefst 90% van de gevallen kunnen wij toch een passende financieringsoplossing vinden, ook bij een bestaande BKR-registratie.',
          'Afhankelijk van de aard en het bedrag van de registratie kan een hogere aanbetaling gevraagd worden — variërend van 5% tot 20% van de voertuigwaarde. Dit vergroot de zekerheid voor de financiering en verhoogt de kans op goedkeuring aanzienlijk.',
          'Twijfel je of jouw BKR-situatie een probleem vormt? Neem vrijblijvend contact met ons op. Wij beoordelen je aanvraag discreet en persoonlijk, zonder verplichtingen.',
        ],
      },
      {
        vraag: 'Welke documenten heb ik nodig voor een aanvraag?',
        antwoord: [
          'Voor een eerste aanvraag heb je minimaal nodig: je KVK-nummer, naam, telefoonnummer en e-mailadres. Wij nemen daarna contact met je op om de aanvraag verder te bespreken.',
          'Afhankelijk van de financieringsaanvraag kunnen wij aanvullende documenten opvragen, zoals een recent jaarverslag, bankafschriften of een inkomensverklaring. Voor startende ondernemers kan een ondernemingsplan gevraagd worden.',
          'Wij streven ernaar het aanvraagproces zo soepel en snel mogelijk te laten verlopen. Onze specialisten begeleiden je stap voor stap door het proces.',
        ],
      },
    ],
  },
  {
    id: 'importproces',
    titel: 'Importproces & Aanbod',
    emoji: '🚗',
    vragen: [
      {
        vraag: 'Hoe werkt het importeren van een auto via Wiselease?',
        antwoord: [
          'Wiselease importeert auto\'s rechtstreeks uit Europa. Via ons uitgebreide netwerk hebben wij toegang tot meer dan 250.000 voertuigen van alle merken en modellen. Hierdoor kunnen wij vaak dezelfde auto 10 tot 25% goedkoper leveren dan bij een Nederlandse dealer.',
          'Wij regelen het volledige importproces: van aankoop bij de Europese dealer, BPM-aangifte bij de Belastingdienst, inschrijving in het Nederlands kentekenregister tot transport naar Nederland. Jij hoeft niets te doen — wij ontzorgen je volledig.',
          'Na afronding van het importproces ontvang je de auto rijklaar inclusief Nederlands kenteken. De gemiddelde levertijd na akkoord op de offerte bedraagt twee tot vier weken, afhankelijk van de beschikbaarheid en het land van herkomst.',
        ],
      },
      {
        vraag: 'Welke merken en modellen zijn beschikbaar via Wiselease?',
        antwoord: [
          'Via het Europese netwerk van Wiselease zijn meer dan 250.000 auto\'s beschikbaar van vrijwel alle merken: van populaire merken zoals Volkswagen, BMW, Mercedes-Benz, Audi en Toyota tot luxe merken als Porsche, Bentley en Ferrari.',
          'Het aanbod omvat alle categorieën: compacte hatchbacks, gezinsauto\'s, SUV\'s, coupés, cabriolets, bestelwagens en elektrische voertuigen. Filter eenvoudig op merk, model, bouwjaar, brandstof of prijs via ons aanbod op de website.',
          'Staat jouw gewenste auto er niet tussen? Geen probleem. Wij zoeken gericht voor je in ons netwerk. Neem contact op en vertel ons wat je zoekt — wij vinden de auto die bij je past.',
        ],
      },
      {
        vraag: 'Zijn er ook elektrische auto\'s beschikbaar via Wiselease?',
        antwoord: [
          'Ja, Wiselease levert ook elektrische auto\'s via financial lease. In ons Europese netwerk zijn elektrische modellen van onder andere Tesla, Volkswagen, BMW, Hyundai, Kia, Renault en vele andere merken beschikbaar.',
          'Elektrische auto\'s leasen via Wiselease kan fiscaal interessant zijn voor ondernemers, zeker met de lagere bijtellingspercentages voor volledig elektrische voertuigen. Vraag naar de mogelijkheden bij onze specialisten.',
          'Houd ook rekening met subsidies zoals de SEPP-subsidie (Subsidie Elektrische Personenauto\'s Particulieren) — hoewel deze voor zakelijk gebruik andere voorwaarden kan hebben. Onze adviseurs informeren je graag over de actuele regelgeving.',
        ],
      },
      {
        vraag: 'Kan ik een specifieke auto aanvragen die niet in het aanbod staat?',
        antwoord: [
          'Absoluut. Als je een specifieke auto op het oog hebt — een bepaald merk, model, bouwjaar, kleur of uitvoering — dan zoeken wij gericht voor je in ons Europese netwerk van duizenden dealers en importeurs.',
          'Neem contact op met onze specialisten via telefoon of e-mail en beschrijf zo specifiek mogelijk wat je zoekt. Wij geven je een eerlijk advies over beschikbaarheid, importkosten en levertijd.',
        ],
      },
    ],
  },
  {
    id: 'financiering',
    titel: 'Financiering & Kosten',
    emoji: '💰',
    vragen: [
      {
        vraag: 'Is een aanbetaling verplicht bij Wiselease?',
        antwoord: [
          'Nee, bij Wiselease is geen minimale aanbetaling verplicht. In principe kun je tot 100% van de voertuigwaarde financieren. Dit maakt financial lease toegankelijk ook als je niet direct eigen vermogen wilt inzetten.',
          'Een hogere aanbetaling heeft wel voordelen: je maandlasten worden lager en de totale rentekosten over de looptijd nemen af. Gebruik onze online calculator om te zien welk effect een aanbetaling heeft op jouw maandbedrag.',
          'Bij een BKR-registratie of bij startende ondernemers kan een aanbetaling van 5% tot 20% gevraagd worden om de financiering mogelijk te maken.',
        ],
      },
      {
        vraag: 'Welke looptijden zijn mogelijk bij Wiselease?',
        antwoord: [
          'Bij Wiselease kun je kiezen uit de volgende vaste looptijden: 12, 18, 24, 30, 36, 42, 48, 54, 60, 66 of 72 maanden. Hiermee heb je de flexibiliteit om de looptijd te kiezen die het beste past bij jouw financiële situatie en rijgedrag.',
          'Een kortere looptijd betekent hogere maandlasten maar minder totale rentekosten. Een langere looptijd geeft lagere maandlasten maar je betaalt over een langere periode rente. Gebruik onze calculator om de optimale looptijd voor jouw situatie te berekenen.',
        ],
      },
      {
        vraag: 'Hoe wordt het maandbedrag berekend?',
        antwoord: [
          'Het maandbedrag wordt berekend op basis van vier factoren: de voertuigprijs, de aanbetaling, de looptijd en de vaste rente. Het te financieren bedrag is de voertuigprijs minus de aanbetaling. Over dit bedrag wordt rente berekend, verdeeld over de gekozen looptijd.',
          'Aan het einde van de looptijd betaal je de slottermijn (restwaarde). Deze restwaarde kun je zelf instellen in onze calculator — een hogere restwaarde verlaagt je maandbedrag maar je betaalt een groter bedrag ineens aan het einde.',
          'Gebruik onze gratis online lease calculator op de website om direct een indicatie te krijgen van jouw maandbedrag. Geen verplichtingen, geen registratie — gewoon rekenen.',
        ],
      },
      {
        vraag: 'Wat is de rente bij Wiselease?',
        antwoord: [
          'De rente bij Wiselease is vast voor de gehele looptijd. Dit betekent dat jouw maandbedrag nooit stijgt, ongeacht wat er op de financiële markten gebeurt. Je weet exact waar je aan toe bent.',
          'De exacte rentehoogte is afhankelijk van meerdere factoren: de hoogte van de financiering, de gekozen looptijd, het voertuig en jouw ondernemersprofiel. Vraag een vrijblijvende offerte aan voor een persoonlijk renteaanbod.',
        ],
      },
      {
        vraag: 'Wat zijn de kosten naast het maandbedrag?',
        antwoord: [
          'Naast het maandbedrag rekent Wiselease eenmalige bemiddelingskosten van €150 excl. BTW. Dit is een vergoeding voor de bemiddeling en het administratieve proces rondom jouw financieringsaanvraag.',
          'Let op: het maandbedrag dekt uitsluitend de financiering van het voertuig. Verzekering, wegenbelasting en onderhoud zijn niet inbegrepen en komen voor jouw eigen rekening. Dit geeft je de vrijheid om deze zaken naar eigen inzicht in te richten.',
          'De importkosten zijn onderdeel van de voertuigprijs en worden niet apart in rekening gebracht. Wat je ziet in de calculator is het totale bedrag inclusief import, BPM en kentekening.',
        ],
      },
      {
        vraag: 'Wat gebeurt er aan het einde van de looptijd?',
        antwoord: [
          'Aan het einde van de looptijd betaal je de afgesproken slottermijn. Na betaling hiervan is de auto volledig en juridisch van jou. Je hoeft de auto niet in te leveren en er is geen kilometergrens.',
          'Je kunt de slottermijn betalen uit eigen middelen, herfinancieren of de auto verkopen en de opbrengst gebruiken om de slottermijn te voldoen. Onze specialisten adviseren je graag over de beste aanpak.',
        ],
      },
    ],
  },
  {
    id: 'operational-lease',
    titel: 'Operational Lease',
    emoji: '🔄',
    vragen: [
      {
        vraag: 'Wat is operational lease en wat is er inbegrepen bij Wiselease?',
        antwoord: [
          'Bij operational lease van Wiselease rij jij een auto waarbij alles is inbegrepen in één vast maandbedrag: verzekering, wegenbelasting, onderhoud en reparaties. Aan het einde van de looptijd lever je de auto in — je wordt geen eigenaar.',
          'Operational lease is de meest zorgeloze manier van autorijden voor ondernemers. Je weet exact wat je maandelijks betaalt, hebt nooit onverwachte kosten en hoeft je niet bezig te houden met verzekering zoeken, onderhoudsafspraken plannen of wegenbelasting betalen.',
          'Wiselease biedt operational lease aan met looptijden van 24, 36, 48 of 60 maanden. Na afloop lever je de auto netjes in en kun je indien gewenst een nieuwe auto leasen.',
        ],
      },
      {
        vraag: 'Wat zijn de looptijden voor operational lease bij Wiselease?',
        antwoord: [
          'Voor operational lease bij Wiselease zijn de beschikbare looptijden: 24, 36, 48 en 60 maanden. Dit zijn de meest gangbare looptijden voor operational lease waarbij ook de restwaarde van het voertuig goed is in te schatten.',
          'Een kortere looptijd van 24 maanden betekent dat je sneller een nieuw voertuig kunt rijden maar de maandlasten zijn iets hoger. Een langere looptijd van 60 maanden geeft lagere maandlasten maar je rijdt langer in dezelfde auto.',
          'In overleg is het soms mogelijk om een maatwerk looptijd af te spreken. Neem contact op met onze specialisten om de mogelijkheden te bespreken.',
        ],
      },
      {
        vraag: 'Is er een kilometergrens bij operational lease van Wiselease?',
        antwoord: [
          'Ja, bij operational lease wordt vooraf een geschat jaarkilometrage afgesproken. Dit kilometrage is de basis voor de berekening van het maandbedrag — want meer kilometers betekent meer slijtage en een lagere restwaarde.',
          'Gangbare opties zijn 10.000, 15.000, 20.000, 25.000 of 30.000 kilometer per jaar. Rij je meer kilometers dan afgesproken, dan betaal je een meerprijs per kilometer aan het einde van de looptijd. Rij je minder, dan ontvang je vaak een vergoeding.',
          'Schat je kilometers zo realistisch mogelijk in om onaangename verrassingen aan het einde te voorkomen. Onze adviseurs helpen je bij het kiezen van het juiste kilometer pakket.',
        ],
      },
    ],
  },
  {
    id: 'aanvraag',
    titel: 'Aanvraag & Doorlooptijd',
    emoji: '⚡',
    vragen: [
      {
        vraag: 'Hoe snel word ik geholpen na mijn aanvraag bij Wiselease?',
        antwoord: [
          'Wiselease streeft ernaar aanvragen direct te verwerken. Na het indienen van je offerte aanvraag nemen wij zo snel mogelijk contact met je op — in de meeste gevallen nog dezelfde dag.',
          'Na akkoord op de offerte en afronding van de financieringsaanvraag bedraagt de gemiddelde levertijd van de auto twee tot vier weken. Dit is afhankelijk van de beschikbaarheid van het voertuig en het land van herkomst.',
        ],
      },
      {
        vraag: 'Hoe vraag ik een offerte aan bij Wiselease?',
        antwoord: [
          'Een offerte aanvragen is eenvoudig. Kies een auto uit ons aanbod op de website, stel de gewenste aanbetaling en looptijd in via onze calculator en klik op "Gratis offerte aanvragen". Vul vervolgens je gegevens in en een van onze specialisten neemt contact met je op.',
          'Je kunt ook een terugbelverzoek doen via de website of direct contact opnemen via telefoon of e-mail. Wij helpen je graag bij het vinden van de juiste auto en het berekenen van jouw maandbedrag.',
          'De offerte is volledig vrijblijvend. Er zijn geen kosten verbonden aan het aanvragen of ontvangen van een offerte.',
        ],
      },
      {
        vraag: 'Is de offerte van Wiselease vrijblijvend?',
        antwoord: [
          'Ja, een offerte aanvragen bij Wiselease is altijd volledig vrijblijvend en kosteloos. Je bent nergens aan gebonden totdat je akkoord gaat met de offerte en het contract tekent.',
          'Wij adviseren je graag zonder verkoopdruk. Onze specialisten nemen de tijd om jouw situatie goed te begrijpen en een passend voorstel te doen.',
        ],
      },
    ],
  },
];

// Schema.org FAQ JSON-LD
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CATEGORIEEN.flatMap(cat =>
    cat.vragen.map(faq => ({
      '@type': 'Question',
      name: faq.vraag,
      acceptedAnswer: {
        '@type': 'Answer',
        text: Array.isArray(faq.antwoord) ? faq.antwoord.join(' ') : faq.antwoord,
      },
    }))
  ),
};

function FaqItem({ vraag, antwoord, zoekterm }: FAQ & { zoekterm: string }) {
  const [open, setOpen] = useState(false);
  const antwoordTekst = Array.isArray(antwoord) ? antwoord : [antwoord];

  const highlight = (text: string) => {
    if (!zoekterm) return text;
    const regex = new RegExp(`(${zoekterm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-100 text-smartlease-yellow rounded px-0.5">{part}</mark> : part
    );
  };

  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? 'border-yellow-200 shadow-sm' : 'border-gray-200 hover:border-gray-300'} bg-white`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className={`font-semibold text-sm sm:text-base leading-snug ${open ? 'text-smartlease-yellow' : 'text-gray-900'}`}>
          {highlight(vraag)}
        </span>
        <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-yellow-100' : 'bg-gray-100'}`}>
          {open ? <ChevronUp size={14} className="text-smartlease-yellow" /> : <ChevronDown size={14} className="text-gray-500" />}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          {antwoordTekst.map((alinea, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">{highlight(alinea)}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VeelgesteldeVragenPage() {
  const [zoekterm, setZoekterm] = useState('');
  const [actieveCategorie, setActieveCategorie] = useState<string | null>(null);

  const gefilterdeCategorieen = useMemo(() => {
    let cats = CATEGORIEEN;
    if (actieveCategorie) cats = cats.filter(c => c.id === actieveCategorie);
    if (!zoekterm) return cats;
    return cats.map(cat => ({
      ...cat,
      vragen: cat.vragen.filter(faq =>
        faq.vraag.toLowerCase().includes(zoekterm.toLowerCase()) ||
        (Array.isArray(faq.antwoord) ? faq.antwoord.join(' ') : faq.antwoord).toLowerCase().includes(zoekterm.toLowerCase())
      ),
    })).filter(cat => cat.vragen.length > 0);
  }, [zoekterm, actieveCategorie]);

  const totaalVragen = CATEGORIEEN.reduce((acc, c) => acc + c.vragen.length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-12 pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Veelgestelde vragen</h1>
            <p className="text-slate-400 text-base sm:text-lg mb-8">
              Antwoorden op de meest gestelde vragen over financial lease en auto importeren. {totaalVragen} vragen, eerlijke antwoorden.
            </p>
            {/* Zoekbalk */}
            <div className="relative max-w-xl mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={zoekterm}
                onChange={e => setZoekterm(e.target.value)}
                placeholder="Zoek in veelgestelde vragen..."
                className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-smartlease-yellow shadow-lg"
              />
              {zoekterm && (
                <button onClick={() => setZoekterm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categorie tabs */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm -mt-6">
          <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-1 py-3 min-w-max">
              <button
                onClick={() => setActieveCategorie(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!actieveCategorie ? 'bg-smartlease-yellow text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Alle vragen ({totaalVragen})
              </button>
              {CATEGORIEEN.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActieveCategorie(actieveCategorie === cat.id ? null : cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${actieveCategorie === cat.id ? 'bg-smartlease-yellow text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {cat.emoji} {cat.titel} ({cat.vragen.length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ content */}
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
          {gefilterdeCategorieen.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Geen vragen gevonden voor "<strong>{zoekterm}</strong>"</p>
              <button onClick={() => setZoekterm('')} className="mt-4 text-smartlease-yellow hover:underline text-sm">Wis zoekopdracht</button>
            </div>
          ) : (
            gefilterdeCategorieen.map(cat => (
              <div key={cat.id}>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                  <span>{cat.emoji}</span> {cat.titel}
                  <span className="text-sm font-normal text-gray-400">({cat.vragen.length})</span>
                </h2>
                <div className="space-y-2">
                  {cat.vragen.map(faq => (
                    <FaqItem key={faq.vraag} {...faq} zoekterm={zoekterm} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* CTA */}
          <div className="bg-smartlease-yellow rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Staat jouw vraag er niet bij?</h3>
            <p className="text-yellow-100 mb-6 text-sm leading-relaxed">
              Onze specialisten staan klaar om je persoonlijk te helpen. Geen verkoopdruk, gewoon eerlijk advies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={SITE.telefoonHref}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-smartlease-yellow font-semibold rounded-xl hover:bg-yellow-50 transition text-sm">
                <Phone size={16} /> {SITE.telefoon}
              </a>
              <a href={`mailto:${SITE.email}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-700 text-white font-semibold rounded-xl hover:bg-yellow-800 transition text-sm">
                <Mail size={16} /> {SITE.email}
              </a>
              <Link to={SITE.aanbodUrl}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-700 text-white font-semibold rounded-xl hover:bg-yellow-800 transition text-sm">
                Bekijk ons aanbod
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
