import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQ {
  vraag: string;
  antwoord: string;
}

interface Categorie {
  titel: string;
  emoji: string;
  vragen: FAQ[];
}

const CATEGORIEEN: Categorie[] = [
  {
    titel: 'Financial Lease',
    emoji: '📋',
    vragen: [
      {
        vraag: 'Wat is financial lease?',
        antwoord: 'Bij financial lease financiert Wiselease de aankoop van jouw auto. Jij betaalt een vast maandbedrag gedurende de gekozen looptijd. Aan het einde betaal je de slottermijn en is de auto volledig van jou. Je bent vanaf dag één economisch eigenaar — dat betekent ook dat jij profiteert van waardestijging en zelf de vrijheid hebt in keuzes rondom verzekering en onderhoud.',
      },
      {
        vraag: 'Wat is operational lease?',
        antwoord: 'Bij operational lease van Wiselease rij je een auto waarbij alles is inbegrepen: verzekering, onderhoud en wegenbelasting. Aan het einde van de looptijd lever je de auto in. Dit is de meest zorgeloze optie — je weet precies wat je maandelijks betaalt en hoeft nergens anders aan te denken.',
      },
      {
        vraag: 'Wat is het verschil tussen financial lease en operational lease?',
        antwoord: 'Bij financial lease word jij eigenaar van de auto na het betalen van de slottermijn. Verzekering, wegenbelasting en onderhoud regel je zelf — dit biedt fiscale voordelen voor ondernemers. Bij operational lease blijft de auto van Wiselease en is alles inbegrepen in het maandbedrag. Je levert de auto aan het einde in.',
      },
      {
        vraag: 'Wat zijn de fiscale voordelen van financial lease?',
        antwoord: 'Als ondernemer kun je de rente op het leasebedrag aftrekken als bedrijfskosten. De btw op zakelijke kosten zoals onderhoud en verzekering is terugvorderbaar. Overleg met je accountant voor jouw specifieke situatie, want de voordelen verschillen per rechtsvorm.',
      },
    ],
  },
  {
    titel: 'Voorwaarden & Doelgroep',
    emoji: '✅',
    vragen: [
      {
        vraag: 'Voor wie is Wiselease?',
        antwoord: 'Wiselease werkt uitsluitend met zakelijke klanten. Dit zijn ondernemers met een actieve KVK-inschrijving: ZZP\'ers, eenmanszaken, vennootschappen onder firma (VOF), besloten vennootschappen (BV) en andere rechtspersonen. Particulieren zonder KVK-inschrijving komen helaas niet in aanmerking.',
      },
      {
        vraag: 'Wat als ik een BKR-registratie heb?',
        antwoord: 'Een BKR-registratie hoeft geen probleem te zijn. In de meeste gevallen kunnen wij toch een passende oplossing vinden. Afhankelijk van de aard van de registratie kan een hogere aanbetaling van 5% tot 20% gevraagd worden. Neem contact met ons op voor een vrijblijvende beoordeling.',
      },
      {
        vraag: 'Moet mijn bedrijf al lang bestaan?',
        antwoord: 'Er is geen minimale bedrijfsduur vereist. Elke aanvraag wordt individueel beoordeeld op basis van jouw financiële situatie en bedrijfsprofiel. Startende ondernemers zijn welkom.',
      },
    ],
  },
  {
    titel: 'Ons Aanbod',
    emoji: '🚗',
    vragen: [
      {
        vraag: 'Welke auto\'s zijn beschikbaar bij Wiselease?',
        antwoord: 'Wiselease biedt een breed aanbod van occasions van Nederlandse dealers én nieuwe auto\'s rechtstreeks van de fabriek. Daarnaast is import uit Europa mogelijk. Heb je een specifieke auto op het oog die je niet op onze website ziet staan? Wij zoeken actief met je mee in ons netwerk.',
      },
      {
        vraag: 'Kan ik een specifieke auto aanvragen?',
        antwoord: 'Absoluut. Als jij een specifieke auto wilt — een bepaald merk, model, bouwjaar of uitvoering — dan zoeken wij gericht voor je. Onze specialisten hebben toegang tot een uitgebreid netwerk van Nederlandse dealers én Europese importeurs. Neem contact met ons op en wij gaan voor je aan de slag.',
      },
      {
        vraag: 'Zijn er ook elektrische auto\'s beschikbaar?',
        antwoord: 'Ja, zeker. In ons aanbod staan zowel volledig elektrische auto\'s als hybrides. Onze lease specialisten helpen je graag bij het kiezen van de juiste elektrische auto die past bij jouw rijgedrag en budget.',
      },
    ],
  },
  {
    titel: 'Financiering & Kosten',
    emoji: '💰',
    vragen: [
      {
        vraag: 'Wat is de minimale aanbetaling?',
        antwoord: 'Bij Wiselease geldt een minimale aanbetaling van 10% van de voertuigprijs. Een hogere aanbetaling verlaagt je maandlast. Bij een BKR-registratie kan een aanbetaling van 5% tot 20% gevraagd worden.',
      },
      {
        vraag: 'Welke looptijden zijn mogelijk?',
        antwoord: 'Voor financial lease kun je kiezen uit de volgende looptijden: 12, 18, 24, 30, 36, 42, 48, 54, 60, 66 of 72 maanden. Voor operational lease zijn de beschikbare looptijden 24, 36, 48 en 60 maanden.',
      },
      {
        vraag: 'Wat is de rente?',
        antwoord: 'De rente is vast voor de gehele looptijd — zo weet je altijd precies waar je aan toe bent. De exacte rente is afhankelijk van jouw aanvraag, het voertuig en de looptijd. Gebruik onze calculator voor een indicatie of vraag een vrijblijvende offerte aan.',
      },
      {
        vraag: 'Wat zijn de bijkomende kosten?',
        antwoord: 'Wij rekenen eenmalige bemiddelingskosten van €150 excl. btw. Bij financial lease zijn verzekering, wegenbelasting en onderhoud niet inbegrepen — die regel je zelf. Bij operational lease is alles inbegrepen in het maandbedrag.',
      },
    ],
  },
  {
    titel: 'Aanvraag & Service',
    emoji: '⚡',
    vragen: [
      {
        vraag: 'Hoe snel word ik geholpen?',
        antwoord: 'Binnen 24 uur heb je een specialist aan de lijn. Wij nemen snel contact met je op na je aanvraag om de mogelijkheden te bespreken.',
      },
      {
        vraag: 'Hoe vraag ik een offerte aan?',
        antwoord: 'Kies een auto uit ons aanbod, stel de gewenste looptijd en aanbetaling in via de calculator en klik op "Gratis offerte aanvragen". Vul je gegevens in en een van onze specialisten neemt binnen 24 uur contact met je op.',
      },
      {
        vraag: 'Wat heb ik nodig voor een aanvraag?',
        antwoord: 'Voor een aanvraag heb je nodig: je KVK-nummer, persoonlijke gegevens (naam, telefoonnummer en e-mailadres) en een keuze voor een auto. Wij verzorgen de rest van het proces.',
      },
    ],
  },
];

function FaqItem({ vraag, antwoord }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl transition-all ${open ? 'border-smartlease-yellow/30 bg-smartlease-yellow/5' : 'border-gray-200 bg-white'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={`font-semibold text-sm sm:text-base leading-snug ${open ? 'text-smartlease-yellow' : 'text-gray-900'}`}>
          {vraag}
        </span>
        {open
          ? <ChevronUp size={18} className="text-smartlease-yellow flex-shrink-0" />
          : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{antwoord}</p>
        </div>
      )}
    </div>
  );
}

export default function VeelgesteldeVragenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Veelgestelde vragen</h1>
          <p className="text-gray-400 text-lg">Alles wat je wilt weten over financial lease, operational lease en ons aanbod.</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {CATEGORIEEN.map((cat) => (
          <div key={cat.titel}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <span>{cat.emoji}</span> {cat.titel}
            </h2>
            <div className="space-y-2">
              {cat.vragen.map((faq) => (
                <FaqItem key={faq.vraag} {...faq} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-smartlease-yellow rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Staat jouw vraag er niet bij?</h3>
          <p className="text-white/80 mb-6 text-sm">Neem gerust contact op. Onze specialisten helpen je graag verder.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:0858008600"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-smartlease-yellow font-semibold rounded-xl hover:bg-gray-50 transition text-sm">
              <Phone size={16} /> 085 - 80 08 600
            </a>
            <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-sm">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href="mailto:info@wiselease.nl"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-sm">
              <Mail size={16} /> info@wiselease.nl
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
