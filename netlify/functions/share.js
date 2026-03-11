// netlify/functions/share.js
const SUPABASE_URL = 'https://bcjbghqrdlzwxgfuuxss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamJnaHFyZGx6d3hnZnV1eHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUzNDksImV4cCI6MjA4NzY5MTM0OX0.TboqxP8kTiJgouaO5zZJdvbki07HK6M0FPj6uo5uG-M';

export default async (req) => {
  const url = new URL(req.url);
  const vehicleId = url.searchParams.get('id');

  if (!vehicleId) {
    return new Response('Missing id', { status: 400 });
  }

  // Voertuig ophalen uit Supabase
  let vehicle = null;
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/vehicles?id=eq.${vehicleId}&select=id,merk,model,uitvoering,verkoopprijs,external_id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );
    const data = await resp.json();
    vehicle = data?.[0];
  } catch (e) {
    console.error('Supabase fetch failed:', e);
  }

  if (!vehicle) {
    return new Response(null, {
      status: 302,
      headers: { Location: 'https://smartlease.nl/aanbod' }
    });
  }

  const siteUrl = 'https://smartlease.nl';
  const title = `${vehicle.merk} ${vehicle.model}`;
  const price = vehicle.verkoopprijs
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(vehicle.verkoopprijs)
    : '';
  const description = price ? `${title} - ${price} p/m | Smartlease.nl` : `${title} | Smartlease.nl`;

  const slug = `${vehicle.merk}-${vehicle.model}`
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const pageUrl = `${siteUrl}/auto/${vehicle.id}/${encodeURIComponent(slug)}`;

  // OG image via Supabase Edge Function (vaste IPs gewhitelisted bij nederlandmobiel.nl)
  const imageUrl = vehicle.external_id
    ? `${SUPABASE_URL}/functions/v1/og-image?id=${vehicle.external_id}&s=640&n=1&apikey=${SUPABASE_ANON_KEY}`
    : '';

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)} - Smartlease.nl</title>
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Smartlease.nl" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  ${imageUrl ? `<meta property="og:image" content="${esc(imageUrl)}" />
  <meta property="og:image:width" content="640" />
  <meta property="og:image:height" content="480" />
  <meta property="og:image:type" content="image/jpeg" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  ${imageUrl ? `<meta name="twitter:image" content="${esc(imageUrl)}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${esc(pageUrl)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
</head>
<body>
  <p>Doorsturen naar <a href="${esc(pageUrl)}">${esc(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    }
  });
};

export const config = {
  path: '/share'
};