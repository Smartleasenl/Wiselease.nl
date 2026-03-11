export interface Vehicle {
  id: number;
  external_id?: string;
  merk: string;
  model: string;
  uitvoering: string;
  categorie: string;
  verkoopprijs: number;
  maandprijs: number;
  btw_marge: string;
  bouwjaar_year: number;
  kmstand: number;
  brandstof: string;
  transmissie: string;
  vermogen: number;
  motorinhoud?: string;
  kleur: string;
  deuren: number;
  small_picture: string;
  aanbieder_naam: string;
  aanbieder_postcode?: string;
  aanbieder_plaats: string;
  aanbieder_lat?: number;
  aanbieder_lng?: number;
  omschrijving?: string;
  link?: string;
  kenteken?: string;
  nap?: string;
}

export interface VehicleDetail extends Vehicle {
  images: string[];
  opties: string[];
}

export interface SearchParams {
  merk?: string;
  model?: string;
  categorie?: string;
  categorie_not?: string;
  categorie_in?: string;
  brandstof?: string;
  transmissie?: string;
  kleur?: string;
  btw_marge?: string;
  budget_min?: number;
  budget_max?: number;
  jaar_min?: number;
  jaar_max?: number;
  kmstand_min?: number;
  kmstand_max?: number;
  vermogen_min?: number;
  vermogen_max?: number;
  opties?: string[] | string;
  zoek?: string;
  sort?: 'maandprijs_laag' | 'maandprijs_hoog' | 'prijs_laag' | 'prijs_hoog' | 'jaar_nieuw' | 'jaar_oud' | 'km_laag' | 'km_hoog' | 'nieuwste';
  page?: number;
  per_page?: number;
}

export interface SearchResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FiltersResponse {
  merken: string[];
  brandstoffen: string[];
  transmissies: string[];
  categorieen: string[];   // ← geen ë, plain ASCII
  kleuren: string[];       // ← nieuw toegevoegd
  ranges?: {
    minJaar: number;
    maxJaar: number;
    maxKm: number;
    maxVermogen: number;
  };
}

export interface ModelOption {
  model: string;
  count: number;
} 