import { prepareSqlQuery } from "./sql";
import { RECEIPT_PROMPT, parseReceiptModelOutput } from "./receipt";

// The static frontend may live on a different origin than this worker, so the
// AI endpoint answers OPTIONS preflight and its responses carry CORS headers.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Moondream streams its output as SSE "data: {"response": ...}" events.
async function readAiStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const parsed = JSON.parse(line.slice(5).trim());
        if (typeof parsed.response === "string") text += parsed.response;
      } catch {
        // ignore non-JSON keep-alive frames
      }
    }
  }
  return text;
}

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
          image,
          prompt: RECEIPT_PROMPT,
        })) as unknown;
        const text =
          output instanceof ReadableStream
            ? await readAiStream(output)
            : String(output);
        console.info("TEXT", text);
        return json(parseReceiptModelOutput(text));
      } catch (error) {
        return json({ error: String(error) }, 500);
      }
    }

    const sqlQuery = prepareSqlQuery(request.url);
    console.log("QUERY", sqlQuery);
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
