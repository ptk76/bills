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
  if (params.size === 0) return "SELECT * FROM returns";

  if (params.get("cmd") === "add") {
    const from_friend_id = getNumber(params, "from_friend_id");
    const to_friend_id = getNumber(params, "to_friend_id");
    if (!from_friend_id || !to_friend_id) return null;

    const amount = getNumber(params, "amount");
    if (amount === undefined || amount === 0) return null;
    const title = params.get("title") ?? null;
    return `INSERT INTO returns (from_friend_id, to_friend_id, title, amount) VALUES (${from_friend_id}, ${to_friend_id}, "${title}", ${amount})`;
  }

  const id = getNumber(params, "id");
  if (id === undefined) return null;

  if (params.get("cmd") === "del") {
    return `DELETE FROM returns WHERE returns.id = ${id};`;
  }
  if (params.get("cmd") === "upd") {
    const from_friend_id = getNumber(params, "from_friend_id");
    const to_friend_id = getNumber(params, "friend_id");
    const title = params.get("title");
    const amount = getNumber(params, "amount");

    const columns: string[] = [];
    if (from_friend_id !== undefined)
      columns.push(`from_friend_id="${from_friend_id}"`);
    if (to_friend_id !== undefined)
      columns.push(`to_friend_id=${to_friend_id}`);
    if (title !== undefined) columns.push(`title=${title}`);
    if (amount !== undefined) columns.push(`amount=${amount}`);

    return `UPDATE returns SET ${columns.join(",")} WHERE returns.id = ${id};`;
  }
  return null;
}

function items(params: URLSearchParams) {
  if (params.get("cmd") === "add") {
    const title = params.get("title");
    const price = getNumber(params, "price");
    const quantity = getNumber(params, "quantity");
    const bill_id = getNumber(params, "bill_id");
    if (
      title === undefined ||
      price === undefined ||
      quantity == undefined ||
      bill_id == undefined
    )
      return null;
    return `INSERT INTO items (title, price, quantity, bill_id) VALUES ("${title}", ${price}, ${quantity}, ${bill_id})`;
  }
  if (params.get("cmd") === "del") {
    const id = getNumber(params, "id");
    if (id === undefined) return null;
    return `DELETE FROM items WHERE items.id = ${id};`;
  }
  if (params.get("cmd") === "upd") {
    const id = getNumber(params, "id");
    if (id === undefined) return null;

    const title = params.get("title");
    const price = getNumber(params, "price");
    const quantity = getNumber(params, "quantity");

    const columns: string[] = [];
    if (title) columns.push(`title="${title}"`);
    if (price !== undefined) columns.push(`price=${price}`);
    if (quantity !== undefined) columns.push(`quantity=${quantity}`);

    return `UPDATE items SET ${columns.join(",")} WHERE items.id = ${id};`;
  }

  const bill_id = getNumber(params, "bill_id");
  if (bill_id === undefined) return null;
  return `SELECT * FROM items WHERE items.bill_id=${bill_id}`;
}

function splits(params: URLSearchParams) {
  if (params.size === 0) return `SELECT * FROM splits`;
  const item_id = getNumber(params, "item_id");
  const friend_id = getNumber(params, "friend_id");
  const quantity = getNumber(params, "quantity");
  if (item_id === undefined || friend_id == undefined || quantity === undefined)
    return null;

  console.log("SPLIT", params);
  if (quantity === 0)
    return `DELETE FROM splits WHERE splits.item_id=${item_id} AND splits.friend_id=${friend_id}`;

  return `
  INSERT INTO splits (item_id, friend_id, quantity)
  VALUES (${item_id}, ${friend_id}, ${quantity})
  ON CONFLICT (item_id, friend_id) DO UPDATE
  SET quantity = ${quantity};
  `;
}

function prepareSqlQuery(urlStr: string) {
  const url = new URL(urlStr);
  if (url.pathname.startsWith("/friends")) return friends(url.searchParams);
  if (url.pathname.startsWith("/bills")) return bills(url.searchParams);
  if (url.pathname.startsWith("/returns")) return returns(url.searchParams);
  if (url.pathname.startsWith("/items")) return items(url.searchParams);
  if (url.pathname.startsWith("/splits")) return splits(url.searchParams);
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
