export interface RateConfig {
  min_bedrag: number;
  max_bedrag: number | null;
  basis_rente: number;
  looptijd_24_opslag: number;
  looptijd_36_opslag: number;
  looptijd_48_opslag: number;
  looptijd_60_opslag: number;
  looptijd_72_opslag: number;
}

let cachedConfig: RateConfig[] | null = null;

export async function getRateConfig(): Promise<RateConfig[]> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('https://nydjzahppdvlaeuywoln.supabase.co/functions/v1/get-calculator-config');
    const { config } = await res.json();
    cachedConfig = config;
    return config;
  } catch {
    return [];
  }
}

export function berekenRente(
  financieringsbedrag: number,
  looptijdMaanden: number,
  config: RateConfig[]
): number {
  if (!config.length || financieringsbedrag <= 0) return 8.99;

  const rij = config.find(r =>
    financieringsbedrag >= r.min_bedrag &&
    (r.max_bedrag === null || financieringsbedrag <= r.max_bedrag)
  );
  if (!rij) return 8.99;

  const opslagKey = `looptijd_${looptijdMaanden}_opslag` as keyof RateConfig;
  const opslag = typeof rij[opslagKey] === 'number' ? (rij[opslagKey] as number) : 0;

  return Math.round((rij.basis_rente + opslag) * 100) / 100;
}
