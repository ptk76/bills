import { prepareSqlQuery } from "./sql";

export default {
  async fetch(request: Request, env: Env) {
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
