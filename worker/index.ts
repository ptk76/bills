import { prepareSqlQuery } from "./sql";
import { RECEIPT_PROMPT } from "./receipt";

// The static frontend may live on a different origin than this worker, so the
// AI endpoint answers OPTIONS preflight and its responses carry CORS headers.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const textResp = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // POST /ai: describe a receipt photo and parse its line items.
    if (request.method === "POST") {
      try {
        const imageBuffer = await request.arrayBuffer();
        const imageBytes = [...new Uint8Array(imageBuffer)];

        // Moondream expects the image as a base64 data URL.
        const contentType = request.headers.get("Content-Type") || "image/jpeg";
        let binary = "";
        for (const byte of imageBytes) binary += String.fromCharCode(byte);
        const image = `data:${contentType};base64,${btoa(binary)}`;
        const output = (await env.AI.run("@cf/moondream/moondream3.1-9B-A2B", {
          task: "query",
          image,
          question: RECEIPT_PROMPT,
          reasoning: false, // skip reasoning trace for cleaner output
          stream: false,
        })) as any;
        const text = output.result.answer;
        return textResp(text);
      } catch (error) {
        console.info("ERROR", error);
        return json({ error: String(error) }, 500);
      }
    }

    const sqlQuery = prepareSqlQuery(request.url);
    if (!sqlQuery) return new Response(null, { status: 404 });

    const stmt = env.DB.prepare(sqlQuery);
    const { results } = await stmt.all();
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
} satisfies ExportedHandler<Env>;
