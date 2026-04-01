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
  if (params.get("cmd") === "add") {
    const title = params.get("title");
    const token = params.get("token");
    if (!title || !token) return null;
    return `INSERT INTO bills (title, token) VALUES ("${title}", "${token}")`;
  }
  if (params.get("cmd") === "del") {
    const id = getNumber(params, "id");
    if (id === undefined) return null;
    return `DELETE FROM bills WHERE bills.id = ${id};`;
  }
  if (params.get("cmd") === "upd") {
    const id = getNumber(params, "id");
    console.log("UPD", id);
    if (id === undefined) return null;
    const title = params.get("title");
    const paid_by = getNumber(params, "paid_by");
    if (!title && paid_by === undefined) return null;

    const columns: string[] = [];
    if (title) columns.push(`title="${title}"`);
    if (paid_by !== undefined) columns.push(`paid_by=${paid_by}`);

    return `UPDATE bills SET ${columns.join(",")} WHERE bills.id = ${id};`;
  }

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
