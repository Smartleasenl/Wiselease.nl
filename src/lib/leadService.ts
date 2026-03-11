import { supabase } from './supabase';

export interface LeadData {
  type: 'contact' | 'offerte' | 'terugbelverzoek' | 'whatsapp';
  naam?: string;
  voornaam?: string;
  achternaam?: string;
  email?: string;
  telefoon?: string;
  bericht?: string;
  bedrijfsnaam?: string;
  kvk_nummer?: string;
  vehicle_id?: number;
  vehicle_info?: string;
  calculator_data?: {
    looptijd: number;
    aanbetaling: number;
    maandbedrag: number;
    slottermijn: number;
  };
}

export async function submitLead(data: LeadData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('leads').insert({
      type: data.type,
      naam: data.naam || (data.voornaam && data.achternaam ? `${data.voornaam} ${data.achternaam}` : null),
      voornaam: data.voornaam || null,
      achternaam: data.achternaam || null,
      email: data.email || null,
      telefoon: data.telefoon || null,
      bericht: data.bericht || null,
      bedrijfsnaam: data.bedrijfsnaam || null,
      kvk_nummer: data.kvk_nummer || null,
      vehicle_id: data.vehicle_id || null,
      vehicle_info: data.vehicle_info || null,
      calculator_data: data.calculator_data || null,
    });

    if (error) {
      console.error('Lead submit error:', error);
      return { success: false, error: 'Er ging iets mis bij het versturen.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Lead submit exception:', err);
    return { success: false, error: 'Er ging iets mis. Probeer het later opnieuw.' };
  }
}