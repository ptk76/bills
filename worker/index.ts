function getNumber(params: URLSearchParams, name: string) {
  if (params.has(name)) {
    const int = parseInt(params.get(name)!);
    if (!isNaN(int)) return int;
  }
  return undefined;
}

function friends(params: URLSearchParams) {
  const cmd = params.get("cmd");
  if (cmd === "del") {
    const id = getNumber(params, "id");
    if (id === undefined) return null;
    return `DELETE FROM friends WHERE friends.id = ${id};`;
  }
  if (cmd === "add") {
    const nick = params.get("nick");
    if (nick === undefined) return null;
    return `INSERT INTO friends (nick) VALUES ("${nick}")`;
  }

  return "SELECT * FROM friends";
}

function bills(params: URLSearchParams) {
  return "SELECT * FROM bills";
}

function returns(params: URLSearchParams) {
  return "SELECT * FROM returns";
}

function items(params: URLSearchParams) {
  if (params.has("bill_id")) {
    const id = parseInt(params.get("bill_id")!);
    if (!isNaN(id)) return `SELECT * FROM items WHERE items.bill_id=${id}`;
  }
  return null;
}

function prepareSqlQuery(urlStr: string) {
  const url = new URL(urlStr);
  if (url.pathname.startsWith("/friends")) return friends(url.searchParams);
  if (url.pathname.startsWith("/bills")) return bills(url.searchParams);
  if (url.pathname.startsWith("/returns")) return returns(url.searchParams);
  if (url.pathname.startsWith("/items")) return items(url.searchParams);
  return null;
}

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
