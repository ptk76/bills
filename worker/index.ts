function getNumber(searchParams: URLSearchParams, name: string) {
  if (searchParams.has(name)) {
    const int = parseInt(searchParams.get(name)!);
    if (!isNaN(int)) return int;
  }
  return undefined;
}

function prepareSqlQuery(urlStr: string) {
  const url = new URL(urlStr);
  if (url.pathname.startsWith("/friends")) {
    const cmd = url.searchParams.get("cmd");
    if (cmd === "del") {
      const id = getNumber(url.searchParams, "id");
      if (id === undefined) return null;
      return `
        DELETE FROM friends WHERE friends.id = ${id};
        DELETE FROM splits WHERE splits.friend_id = ${id};
        DELETE FROM returns WHERE returns.from_friend_id = ${id} OR returns.to_friend_id = ${id};
        UPDATE bills SET paid_by = NULL WHERE paid_by = ${id};
      `;
    }
    if (cmd === "add") {
      const nick = url.searchParams.get("nick");
      if (nick === undefined) return null;
      return `INSERT INTO friends (nick) VALUES ("${nick}")`;
    }

    return "SELECT * FROM friends";
  }

  if (url.pathname.startsWith("/bills")) {
    return "SELECT * FROM bills";
  }

  if (url.pathname.startsWith("/returns")) {
    return "SELECT * FROM returns";
  }

  if (url.pathname.startsWith("/items")) {
    let bill_id = 0;
    if (url.searchParams.has("bill_id")) {
      const id = parseInt(url.searchParams.get("bill_id")!);
      if (!isNaN(id)) bill_id = id;
    }
    return `SELECT * FROM items WHERE items.bill_id=${bill_id}`;
  }
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
