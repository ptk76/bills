export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/db/friends")) {
      const stmt = env.DB.prepare("SELECT * FROM friends");
      const { results } = await stmt.all();
      return new Response(JSON.stringify(results, null, 2), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/db/bills")) {
      const stmt = env.DB.prepare("SELECT * FROM bills");
      const { results } = await stmt.all();
      return new Response(JSON.stringify(results, null, 2), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/db/bill")) {
      let bill_id = 0;
      if (url.searchParams.has("id")) {
        const id = parseInt(url.searchParams.get("id")!);
        if (!isNaN(id)) bill_id = id;
      }
      console.log(url.searchParams.has);
      const stmt = env.DB.prepare(
        `SELECT * FROM items WHERE items.bill_id=${bill_id}`,
      );
      const { results } = await stmt.all();
      return new Response(JSON.stringify(results, null, 2), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
