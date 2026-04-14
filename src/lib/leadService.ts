const CRM_URL = 'https://nydjzahppdvlaeuywoln.supabase.co/functions/v1/create-lead-safe';
const CRM_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZGp6YWhwcGR2bGFldXl3b2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjczMDQsImV4cCI6MjA4MDM0MzMwNH0.RVaZs28LXSjxjKoccu4ZYMj6XqSG-hJjw0SD8tcdkWc';
const ORG_ID = '272847f8-a174-4e62-aa93-83e0dea182fe'; // Wiselease org in CRM

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
  vehicle_url?: string;
  calculator_data?: {
    looptijd: number;
    aanbetaling: number;
    maandbedrag: number;
    slottermijn: number;
    financieringsbedrag?: number;
    aankoopprijs?: number;
  };
  entry_point?: string;
  entry_point_detail?: string;
}

export function determineEntryPoint(context: {
  vehicleId?: string | number | null;
  vehicleSlug?: string | null;
  hasCalculatorData?: boolean;
  hasVergelijkerData?: boolean;
}): { entry_point: string; entry_point_detail: string | null } {
  if (context.vehicleId)
    return { entry_point: 'autopagina', entry_point_detail: context.vehicleSlug ?? window.location.pathname };
  if (context.hasVergelijkerData)
    return { entry_point: 'vergelijker', entry_point_detail: null };
  if (context.hasCalculatorData)
    return { entry_point: 'calculator', entry_point_detail: null };
  return { entry_point: 'contact_formulier', entry_point_detail: window.location.pathname };
}

export async function submitLead(data: LeadData): Promise<{ success: boolean; error?: string }> {
  try {
    const naam = data.naam || (data.voornaam && data.achternaam ? `${data.voornaam} ${data.achternaam}` : null);

    const ep = data.entry_point
      ? { entry_point: data.entry_point, entry_point_detail: data.entry_point_detail || null }
      : determineEntryPoint({
          vehicleId: data.vehicle_id ? String(data.vehicle_id) : null,
          vehicleSlug: data.vehicle_info || null,
          hasCalculatorData: !!data.calculator_data,
        });

    const res = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_ANON}`,
        'apikey': CRM_ANON,
      },
      body: JSON.stringify({
        organization_id: ORG_ID,
        naam,
        voornaam: data.voornaam || null,
        achternaam: data.achternaam || null,
        email: data.email || null,
        telefoon: data.telefoon || null,
        bericht: data.bericht || null,
        bedrijfsnaam: data.bedrijfsnaam || null,
        kvk_nummer: data.kvk_nummer || null,
        vehicle_info: data.vehicle_info || null,
        source: 'wiselease',
        type: data.type,
        entry_point: ep.entry_point,
        entry_point_detail: ep.entry_point_detail,
      }),
    });

    if (!res.ok) {
      console.error('CRM lead error:', await res.text());
      return { success: false, error: 'Er ging iets mis bij het versturen.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Lead submit exception:', err);
    return { success: false, error: 'Er ging iets mis. Probeer het later opnieuw.' };
  }
}
