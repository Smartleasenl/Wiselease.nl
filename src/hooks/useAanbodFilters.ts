// src/hooks/useAanbodFilters.ts
import { useSearchParams } from 'react-router-dom';

export interface AanbodUrlFilters {
  categorieFilter: string | null;   // matcht op vehicles.categorie (bijv. 'Bedrijfswagen')
  brandstofFilter: string | null;   // matcht op vehicles.brandstof (bijv. 'Electro')
  margeFilter:     string | null;   // matcht op vehicles.btw_marge  (bijv. 'marge')
  occasionFilter:  boolean;         // kmstand > 0 (gebruikte auto)
}

export function useAanbodFilters(): AanbodUrlFilters {
  const [searchParams] = useSearchParams();

  const bodytype = searchParams.get('bodytype'); // personenauto | bedrijfsauto | motor
  const fuel     = searchParams.get('fuel');     // elektrisch
  const type     = searchParams.get('type');     // occasion | marge | nieuw

  // Mapping URL param → echte DB waarden
  const categorieMap: Record<string, string> = {
    // 'personenauto' matcht meerdere categorieën — filter via NOT IN bedrijfswagen/motor
    // We gebruiken hier een speciale waarde die de OccasionsPage afhandelt
    personenauto: '__PERSONENAUTO__',
    bedrijfsauto: 'Bedrijfswagen',
    motor:        '__MOTOR__',         // Motorscooter + Trike
  };

  return {
    categorieFilter: bodytype ? (categorieMap[bodytype] ?? null) : null,
    brandstofFilter: fuel === 'elektrisch' ? 'Electro' : null,
    margeFilter:     type  === 'marge'     ? 'marge'   : null,
    occasionFilter:  type  === 'occasion',
  };
}