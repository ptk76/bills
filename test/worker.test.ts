import { describe, it, expect } from "vitest";
import { prepareSqlQuery } from "../worker/sql";

const BASE = "https://example.com";
const p = (path: string) => prepareSqlQuery(`${BASE}${path}`);

// ---------- unknown route ----------

describe("unknown route", () => {
  it("returns null for an unrecognised path", () => {
    expect(p("/unknown")).toBeNull();
  });
});

// ---------- /friends ----------

describe("/friends", () => {
  it("returns SELECT for no cmd", () => {
    expect(p("/friends")).toBe("SELECT * FROM friends");
  });

  it("cmd=del with id returns DELETE", () => {
    expect(p("/friends?cmd=del&id=7")).toBe(
      "DELETE FROM friends WHERE friends.id = 7;",
    );
  });

  it("cmd=del without id returns null", () => {
    expect(p("/friends?cmd=del")).toBeNull();
  });

  it("cmd=del with non-numeric id returns null", () => {
    expect(p("/friends?cmd=del&id=abc")).toBeNull();
  });

  it("cmd=add with nick returns INSERT", () => {
    expect(p("/friends?cmd=add&nick=Alice")).toBe(
      'INSERT INTO friends (nick) VALUES ("Alice")',
    );
  });

  it("cmd=upd with id and group_id returns UPDATE", () => {
    expect(p("/friends?cmd=upd&id=3&group_id=5")).toBe(
      "UPDATE friends SET group_id=5 WHERE id = 3;",
    );
  });

  it("cmd=upd with id and no group_id sets group_id to null", () => {
    expect(p("/friends?cmd=upd&id=3")).toBe(
      "UPDATE friends SET group_id=null WHERE id = 3;",
    );
  });

  it("cmd=upd without id returns null", () => {
    expect(p("/friends?cmd=upd")).toBeNull();
  });
});

// ---------- /groups ----------

describe("/groups", () => {
  it("returns SELECT for no cmd", () => {
    expect(p("/groups")).toBe("SELECT * FROM groups");
  });

  it("cmd=del with id returns DELETE", () => {
    expect(p("/groups?cmd=del&id=2")).toBe("DELETE FROM groups WHERE id = 2;");
  });

  it("cmd=del without id returns null", () => {
    expect(p("/groups?cmd=del")).toBeNull();
  });

  it("cmd=add with surname returns INSERT", () => {
    expect(p("/groups?cmd=add&surname=Smith")).toBe(
      'INSERT INTO groups (surname) VALUES ("Smith")',
    );
  });
});

// ---------- /bills ----------

describe("/bills", () => {
  it("returns SELECT all for no cmd and no token", () => {
    expect(p("/bills")).toBe("SELECT * FROM bills");
  });

  it("returns SELECT by token when token is present", () => {
    expect(p("/bills?token=abc123")).toBe(
      'SELECT * FROM bills WHERE bills.token = "abc123"',
    );
  });

  it("cmd=add with title and token returns INSERT RETURNING id", () => {
    expect(p("/bills?cmd=add&title=Dinner&token=tok1")).toBe(
      'INSERT INTO bills (title, token) VALUES ("Dinner", "tok1") RETURNING id',
    );
  });

  it("cmd=add without title returns null", () => {
    expect(p("/bills?cmd=add&token=tok1")).toBeNull();
  });

  it("cmd=add without token returns null", () => {
    expect(p("/bills?cmd=add&title=Dinner")).toBeNull();
  });

  it("cmd=del with id returns DELETE", () => {
    expect(p("/bills?cmd=del&id=10")).toBe(
      "DELETE FROM bills WHERE bills.id = 10;",
    );
  });

  it("cmd=del without id returns null", () => {
    expect(p("/bills?cmd=del")).toBeNull();
  });

  it("cmd=upd with id and title returns UPDATE with title column", () => {
    expect(p("/bills?cmd=upd&id=10&title=Lunch")).toBe(
      'UPDATE bills SET title="Lunch" WHERE bills.id = 10;',
    );
  });

  it("cmd=upd with id and paid_by returns UPDATE with paid_by column", () => {
    expect(p("/bills?cmd=upd&id=10&paid_by=3")).toBe(
      "UPDATE bills SET paid_by=3 WHERE bills.id = 10;",
    );
  });

  it("cmd=upd with id, title, and paid_by returns UPDATE with both columns", () => {
    expect(p("/bills?cmd=upd&id=10&title=Lunch&paid_by=3")).toBe(
      'UPDATE bills SET title="Lunch",paid_by=3 WHERE bills.id = 10;',
    );
  });

  it("cmd=upd without id returns null", () => {
    expect(p("/bills?cmd=upd&title=Lunch")).toBeNull();
  });

  it("cmd=upd with id but no title or paid_by returns null", () => {
    expect(p("/bills?cmd=upd&id=10")).toBeNull();
  });
});

// ---------- /returns ----------

describe("/returns", () => {
  it("returns SELECT for no params", () => {
    expect(p("/returns")).toBe("SELECT * FROM returns");
  });

  it("cmd=add with all required fields returns INSERT", () => {
    expect(
      p("/returns?cmd=add&from_friend_id=1&to_friend_id=2&amount=50&title=cash"),
    ).toBe(
      'INSERT INTO returns (from_friend_id, to_friend_id, title, amount) VALUES (1, 2, "cash", 50)',
    );
  });

  it("cmd=add with no title inserts null as title", () => {
    expect(
      p("/returns?cmd=add&from_friend_id=1&to_friend_id=2&amount=50"),
    ).toBe(
      'INSERT INTO returns (from_friend_id, to_friend_id, title, amount) VALUES (1, 2, "null", 50)',
    );
  });

  it("cmd=add without from_friend_id returns null", () => {
    expect(p("/returns?cmd=add&to_friend_id=2&amount=50")).toBeNull();
  });

  it("cmd=add without to_friend_id returns null", () => {
    expect(p("/returns?cmd=add&from_friend_id=1&amount=50")).toBeNull();
  });

  it("cmd=add with amount=0 returns null", () => {
    expect(
      p("/returns?cmd=add&from_friend_id=1&to_friend_id=2&amount=0"),
    ).toBeNull();
  });

  it("cmd=add without amount returns null", () => {
    expect(
      p("/returns?cmd=add&from_friend_id=1&to_friend_id=2"),
    ).toBeNull();
  });

  it("cmd=del with id returns DELETE", () => {
    expect(p("/returns?cmd=del&id=5")).toBe(
      "DELETE FROM returns WHERE returns.id = 5;",
    );
  });

  it("non-add cmd without id returns null", () => {
    expect(p("/returns?cmd=del")).toBeNull();
  });

  it("cmd=upd with id and fields returns UPDATE", () => {
    const sql = p(
      "/returns?cmd=upd&id=5&from_friend_id=1&friend_id=2&amount=30&title=updated",
    );
    expect(sql).toContain("UPDATE returns SET");
    expect(sql).toContain("WHERE returns.id = 5");
    expect(sql).toContain("amount=30");
  });
});

// ---------- /items ----------

describe("/items", () => {
  it("returns SELECT for no cmd", () => {
    expect(p("/items")).toBe("SELECT * FROM items");
  });

  it("cmd=add with all required fields returns INSERT", () => {
    expect(
      p("/items?cmd=add&title=Pizza&price=12&quantity=2&bill_id=10"),
    ).toBe(
      'INSERT INTO items (title, price, quantity, bill_id) VALUES ("Pizza", 12, 2, 10)',
    );
  });

  it("cmd=add without title returns null", () => {
    expect(p("/items?cmd=add&price=12&quantity=2&bill_id=10")).toBeNull();
  });

  it("cmd=add without price returns null", () => {
    expect(
      p("/items?cmd=add&title=Pizza&quantity=2&bill_id=10"),
    ).toBeNull();
  });

  it("cmd=add without quantity returns null", () => {
    expect(
      p("/items?cmd=add&title=Pizza&price=12&bill_id=10"),
    ).toBeNull();
  });

  it("cmd=add without bill_id returns null", () => {
    expect(
      p("/items?cmd=add&title=Pizza&price=12&quantity=2"),
    ).toBeNull();
  });

  it("cmd=del with id returns DELETE", () => {
    expect(p("/items?cmd=del&id=99")).toBe(
      "DELETE FROM items WHERE items.id = 99;",
    );
  });

  it("cmd=del without id returns null", () => {
    expect(p("/items?cmd=del")).toBeNull();
  });

  it("cmd=upd with id and title returns UPDATE with title", () => {
    expect(p("/items?cmd=upd&id=5&title=Burger")).toBe(
      'UPDATE items SET title="Burger" WHERE items.id = 5;',
    );
  });

  it("cmd=upd with id, price, and quantity returns UPDATE with both", () => {
    expect(p("/items?cmd=upd&id=5&price=8&quantity=3")).toBe(
      "UPDATE items SET price=8,quantity=3 WHERE items.id = 5;",
    );
  });

  it("cmd=upd without id returns null", () => {
    expect(p("/items?cmd=upd&title=Burger")).toBeNull();
  });
});

// ---------- /splits ----------

describe("/splits", () => {
  it("returns SELECT for no params", () => {
    expect(p("/splits")).toBe("SELECT * FROM splits");
  });

  it("quantity=0 returns DELETE", () => {
    expect(p("/splits?item_id=10&friend_id=2&quantity=0")).toBe(
      "DELETE FROM splits WHERE splits.item_id=10 AND splits.friend_id=2",
    );
  });

  it("quantity>0 returns INSERT ... ON CONFLICT ... DO UPDATE", () => {
    const sql = p("/splits?item_id=10&friend_id=2&quantity=3");
    expect(sql).toContain("INSERT INTO splits (item_id, friend_id, quantity)");
    expect(sql).toContain("VALUES (10, 2, 3)");
    expect(sql).toContain("ON CONFLICT (item_id, friend_id) DO UPDATE");
    expect(sql).toContain("SET quantity = 3");
  });

  it("missing item_id returns null", () => {
    expect(p("/splits?friend_id=2&quantity=1")).toBeNull();
  });

  it("missing friend_id returns null", () => {
    expect(p("/splits?item_id=10&quantity=1")).toBeNull();
  });

  it("missing quantity returns null", () => {
    expect(p("/splits?item_id=10&friend_id=2")).toBeNull();
  });
});
