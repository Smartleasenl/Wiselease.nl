const SUPABASE_URL = "https://jtntbwioxszeocumgvzk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bnRid2lveHN6ZW9jdW1ndnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDE3OTksImV4cCI6MjA4ODgxNzc5OX0.KyAoKAScDFID7zqlOQPgfW82MDzjkmdvBWZlqWYsJnc";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml({ title, description, imageUrl, pageUrl }: {
  title: string; description: string; imageUrl: string; pageUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Wiselease.nl" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <script>window.location.href = "${escapeHtml(pageUrl)}";</script>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;
}

const BOT_UA = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot|iframely|embed|preview|crawler|spider/i;

export default async (request: Request) => {
  // Geen bot: fetch de echte pagina (SPA)
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua)) {
    return fetch(request);
  }

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/auto\/(\d+)/);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const vehicleId = match[1];
  const pageUrl = request.url;

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