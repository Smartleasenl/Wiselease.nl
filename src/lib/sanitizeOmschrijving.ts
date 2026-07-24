import DOMPurify from 'dompurify';

/**
 * Veilige weergave van de dealer-omschrijving.
 *
 * `vehicle.omschrijving` komt uit EXTERNE dealer-feeds — niet-vertrouwde content die
 * HTML-opmaak (of kwaadaardige tags) kan bevatten. Nooit blind via
 * dangerouslySetInnerHTML renderen. Deze helper:
 *   1. decodeert HTML-entities (feeds leveren tags soms encoded aan: `&lt;br&gt;`),
 *      zodat de sanitizer de échte tags ziet en beoordeelt;
 *   2. saniteert met een strikte allowlist van uitsluitend veilige opmaak-tags en
 *      ZONDER attributen — alles daarbuiten (script, iframe, on*-handlers,
 *      javascript:-links, style, class, id, …) wordt gestript.
 *
 * Volgorde is bewust decode → sanitize: eerst decoderen dan saniteren, zodat
 * geëncodeerde payloads (`&lt;script&gt;`) ook daadwerkelijk worden verwijderd.
 */
const ALLOWED_TAGS = ['br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'p'];

function decodeEntities(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&euro;/g, '€')
    .replace(/&#\d+;/g, '');
}

export function sanitizeOmschrijving(raw: string): string {
  const clean = DOMPurify.sanitize(decodeEntities(raw), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  // Sommige feeds leveren platte tekst met \n-regelovergangen i.p.v. HTML-tags.
  // HTML collapst \n, dus zónder structuur-tags zetten we elke \n om naar <br> zodat
  // de regelindeling behouden blijft (zoals de oude whitespace-pre-line deed). Bevat
  // de content al <br>/<p>/<ul>/<ol>/<li>, dan laten we het ongemoeid — anders zou je
  // dubbele witruimte krijgen bij feeds die al echte HTML aanleveren.
  return /<(br|p|ul|ol|li)\b/i.test(clean) ? clean : clean.replace(/\n/g, '<br>');
}
