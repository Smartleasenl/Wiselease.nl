import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OfferteEmailData {
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  bedrijfsnaam: string;
  kvk_nummer: string;
  bericht?: string;
  vehicle_info: string;
  vehicle_price?: number;
  calculator?: {
    looptijd: number;
    aanbetaling: number;
    maandbedrag: number;
    slottermijn: number;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: OfferteEmailData = await req.json();

    const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .section-title { color: #0ea5e9; font-weight: bold; margin-bottom: 15px; font-size: 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 600; }
    .highlight { background: #ecfeff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .highlight-value { font-size: 24px; font-weight: bold; color: #06b6d4; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bedankt voor je aanvraag!</h1>
    </div>
    <div class="content">
      <p>Beste ${data.voornaam},</p>
      <p>Bedankt voor je interesse in <strong>${data.vehicle_info}</strong>. We hebben je aanvraag ontvangen en zullen binnen 1 werkdag contact met je opnemen met een offerte op maat.</p>

      <div class="section">
        <div class="section-title">Voertuig</div>
        <div class="info-row">
          <span class="info-label">Auto</span>
          <span class="info-value">${data.vehicle_info}</span>
        </div>
        ${data.vehicle_price ? `
        <div class="info-row">
          <span class="info-label">Vraagprijs</span>
          <span class="info-value">${formatPrice(data.vehicle_price)}</span>
        </div>
        ` : ''}
      </div>

      ${data.calculator ? `
      <div class="section">
        <div class="section-title">Jouw lease berekening</div>
        <div class="info-row">
          <span class="info-label">Looptijd</span>
          <span class="info-value">${data.calculator.looptijd} maanden</span>
        </div>
        <div class="info-row">
          <span class="info-label">Aanbetaling</span>
          <span class="info-value">${formatPrice(data.calculator.aanbetaling)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Slottermijn</span>
          <span class="info-value">${formatPrice(data.calculator.slottermijn)}</span>
        </div>
        <div class="highlight">
          <div class="info-label">Maandbedrag</div>
          <div class="highlight-value">${formatPrice(data.calculator.maandbedrag)} p/m</div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Jouw gegevens</div>
        <div class="info-row">
          <span class="info-label">Naam</span>
          <span class="info-value">${data.voornaam} ${data.achternaam}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Bedrijf</span>
          <span class="info-value">${data.bedrijfsnaam}</span>
        </div>
        <div class="info-row">
          <span class="info-label">KvK nummer</span>
          <span class="info-value">${data.kvk_nummer}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${data.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefoon</span>
          <span class="info-value">${data.telefoon}</span>
        </div>
        ${data.bericht ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
          <span class="info-label">Opmerking</span>
          <p style="margin-top: 8px;">${data.bericht}</p>
        </div>
        ` : ''}
      </div>

      <p>Heb je nog vragen? Neem gerust contact met ons op:</p>
      <p>
        <strong>Telefoon:</strong> 085 - 80 08 777<br>
        <strong>Email:</strong> info@smartlease.nl<br>
        <strong>WhatsApp:</strong> +31 6 13669328
      </p>

      <div class="footer">
        <p>Met vriendelijke groet,<br><strong>Team Smartlease</strong></p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          Deze email is verstuurd naar ${data.email}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; margin-bottom: 10px; }
    .highlight { background: #ecfeff; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚗 Nieuwe offerte aanvraag</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>Klantgegevens</h3>
        <div class="value">${data.voornaam} ${data.achternaam}</div>
        <div class="label">Email</div>
        <div class="value">${data.email}</div>
        <div class="label">Telefoon</div>
        <div class="value">${data.telefoon}</div>
        <div class="label">Bedrijf</div>
        <div class="value">${data.bedrijfsnaam} (KvK: ${data.kvk_nummer})</div>
        ${data.bericht ? `
        <div class="label" style="margin-top: 15px;">Opmerking</div>
        <div class="value">${data.bericht}</div>
        ` : ''}
      </div>

      <div class="section">
        <h3>Voertuig</h3>
        <div class="value">${data.vehicle_info}</div>
        ${data.vehicle_price ? `
        <div class="label">Vraagprijs</div>
        <div class="value">${formatPrice(data.vehicle_price)}</div>
        ` : ''}
      </div>

      ${data.calculator ? `
      <div class="section">
        <h3>Lease berekening</h3>
        <div class="label">Looptijd</div>
        <div class="value">${data.calculator.looptijd} maanden</div>
        <div class="label">Aanbetaling</div>
        <div class="value">${formatPrice(data.calculator.aanbetaling)}</div>
        <div class="label">Slottermijn</div>
        <div class="value">${formatPrice(data.calculator.slottermijn)}</div>
        <div class="highlight">
          <div class="label">Maandbedrag</div>
          <div style="font-size: 20px; font-weight: bold; color: #06b6d4;">${formatPrice(data.calculator.maandbedrag)} p/m</div>
        </div>
      </div>
      ` : ''}

      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        Neem zo snel mogelijk contact op met de klant om de offerte te bespreken.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Smartlease <noreply@smartlease.nl>",
        to: [data.email],
        subject: `Bevestiging offerte aanvraag - ${data.vehicle_info}`,
        html: customerEmailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const error = await customerEmailResponse.text();
      console.error("Failed to send customer email:", error);
    }

    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Smartlease Notificaties <noreply@smartlease.nl>",
        to: ["info@smartlease.nl"],
        subject: `Nieuwe offerte aanvraag: ${data.vehicle_info}`,
        html: adminEmailHtml,
        reply_to: data.email,
      }),
    });

    if (!adminEmailResponse.ok) {
      const error = await adminEmailResponse.text();
      console.error("Failed to send admin email:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Emails sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
