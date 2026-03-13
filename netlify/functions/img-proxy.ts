import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl || !imageUrl.startsWith("https://images.nederlandmobiel.nl/")) {
    return new Response("Invalid URL", { status: 400 });
  }

  const res = await fetch(imageUrl, {
    headers: {
      "Referer": "https://wiselease.nl/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "image/*",
    },
  });

  if (!res.ok) {
    return new Response(`Failed: ${res.status}`, { status: res.status });
  }

  const ct = res.headers.get("content-type") || "image/jpeg";
  const body = await res.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const config = { path: "/img-proxy" };