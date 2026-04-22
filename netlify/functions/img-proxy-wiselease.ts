import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  const { id, s = '320', n = '1' } = event.queryStringParameters || {};
  if (!id) return { statusCode: 400, body: "Missing id" };

  const imageUrl = `https://images.nederlandmobiel.nl/auto/${id}/${s}/${n}.jpg?download=true&platform=wiselease`;

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://www.nederlandmobiel.nl/",
      },
    });

    if (!response.ok) return { statusCode: 502, body: `Failed: ${response.status}` };

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 500, body: `Error: ${e}` };
  }
};

export { handler };