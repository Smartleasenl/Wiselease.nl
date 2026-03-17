export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  const match = url.pathname.match(/^\/auto\/(\d+)/);
  if (!match) return context.next();

  const vehicleId = match[1];

  // Haal voertuigdata op
  let vehicle: any = null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/vehicles?id=eq.${vehicleId}&select=id,merk,model,uitvoering,verkoopprijs,bouwjaar_year,kmstand,og_image_url,external_id&is_active=eq.true`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const data = await res.json();
    vehicle = data?.[0] ?? null;
  } catch (_) {}

  const pageUrl = request.url;

  if (!vehicle) {
    return new Response(buildHtml({
      title: "Wiselease.nl | Financial Lease",
      description: "Vind jouw ideale leaseauto bij Wiselease.nl.",
      imageUrl: "https://wiselease.nl/wiselease-logo.png",
      pageUrl,
    }), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const title = `${vehicle.merk} ${vehicle.model}${vehicle.uitvoering ? " – " + vehicle.uitvoering : ""} | Wiselease.nl`;

  const r = 8.99 / 100 / 12;
  const months = 72;
  const maandprijs = vehicle.verkoopprijs
    ? Math.round(
        (vehicle.verkoopprijs * 0.85 * r * Math.pow(1 + r, months) -
          vehicle.verkoopprijs * 0.15 * r) /
          (Math.pow(1 + r, months) - 1)
      )
    : null;

  const description = [
    vehicle.bouwjaar_year && `Bouwjaar ${vehicle.bouwjaar_year}`,
    vehicle.kmstand && `${vehicle.kmstand.toLocaleString("nl-NL")} km`,
    maandprijs && `Vanaf €${maandprijs},- p/m`,
  ].filter(Boolean).join(" · ");

  const imageUrl = vehicle.og_image_url ||
    `https://img.wiselease.nl/img.php?id=${vehicle.external_id}&s=1280&n=1`;

  return new Response(buildHtml({ title, description, imageUrl, pageUrl }), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

export const config = { path: "/auto/*" };