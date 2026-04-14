import { describe, it, expect } from "vitest";
import Calculator, { MatrixSpends } from "../src/utils/calculator";
import {
  Bill,
  Friend,
  Group,
  Item,
  MoneyReturn,
  Split,
} from "../src/context/AppContext";

// ── fixtures ──────────────────────────────────────────────────────────────────

const FRIENDS: Friend[] = [
  { id: 1, nick: "Alice", group_id: 0 },
  { id: 2, nick: "Bob", group_id: 0 },
  { id: 3, nick: "Carol", group_id: 0 },
];

const GROUPS: Group[] = [];

const BILLS: Bill[] = [
  { id: 10, title: "Dinner", token: "t1", paid_by: 1 },
  { id: 20, title: "Lunch", token: "t2", paid_by: 2 },
];

// item 100: price=30, quantity=1  (bill 10)
// item 101: price=20, quantity=2  (bill 10)
// item 200: price=60, quantity=1  (bill 20)
const ITEMS: Item[] = [
  { id: 100, title: "Pizza", price: 30, quantity: 1, bill_id: 10 },
  { id: 101, title: "Beer", price: 20, quantity: 2, bill_id: 10 },
  { id: 200, title: "Sushi", price: 60, quantity: 1, bill_id: 20 },
];

// item 100: Alice×1, Bob×1  → each pays 15
// item 101: Alice×1, Bob×1, Carol×2 → each unit = 40/4 = 10 → Alice 10, Bob 10, Carol 20
// item 200: Bob×1, Carol×1 → each pays 30
const SPLITS: Split[] = [
  { item_id: 100, friend_id: 1, quantity: 1 },
  { item_id: 100, friend_id: 2, quantity: 1 },
  { item_id: 101, friend_id: 1, quantity: 1 },
  { item_id: 101, friend_id: 2, quantity: 1 },
  { item_id: 101, friend_id: 3, quantity: 2 },
  { item_id: 200, friend_id: 2, quantity: 1 },
  { item_id: 200, friend_id: 3, quantity: 1 },
];

const MONEY_RETURNS: MoneyReturn[] = [];

function makeCalculator(
  overrides: {
    bills?: Bill[];
    items?: Item[];
    friends?: Friend[];
    groups?: Group[];
    splits?: Split[];
    moneyReturns?: MoneyReturn[];
  } = {},
) {
  return new Calculator(
    overrides.bills ?? BILLS,
    overrides.items ?? ITEMS,
    overrides.friends ?? FRIENDS,
    overrides.groups ?? GROUPS,
    overrides.splits ?? SPLITS,
    overrides.moneyReturns ?? MONEY_RETURNS,
  );
}

// ── getTotalSplit ─────────────────────────────────────────────────────────────

describe("getTotalSplit", () => {
  it("returns 0 when no splits exist for the item", () => {
    const ab = makeCalculator({ splits: [] });
    expect(ab.getTotalSplit(100)).toBe(0);
  });

  it("returns the sum of quantities across all friends", () => {
    const ab = makeCalculator();
    expect(ab.getTotalSplit(100)).toBe(2); // Alice×1 + Bob×1
    expect(ab.getTotalSplit(101)).toBe(4); // Alice×1 + Bob×1 + Carol×2
    expect(ab.getTotalSplit(200)).toBe(2); // Bob×1 + Carol×1
  });

  it("ignores splits for other items", () => {
    const ab = makeCalculator();
    expect(ab.getTotalSplit(999)).toBe(0);
  });
});

// ── getPersonSplit ────────────────────────────────────────────────────────────

describe("getPersonSplit", () => {
  it("returns 0 when the friend has no split on the item", () => {
    const ab = makeCalculator();
    expect(ab.getPersonSplit(200, 1)).toBe(0); // Alice not on sushi
  });

  it("returns the friend's quantity for the item", () => {
    const ab = makeCalculator();
    expect(ab.getPersonSplit(101, 3)).toBe(2); // Carol×2 on beer
  });

  it("returns 0 for an unknown item", () => {
    const ab = makeCalculator();
    expect(ab.getPersonSplit(999, 1)).toBe(0);
  });
});

// ── getPersonItemSpend ────────────────────────────────────────────────────────

describe("getPersonItemSpend", () => {
  it("returns 0 when item does not exist", () => {
    const ab = makeCalculator();
    expect(ab.getPersonItemSpend(999, 1)).toBe(0);
  });

  it("returns 0 when totalSplit is 0 (nobody claimed the item)", () => {
    const ab = makeCalculator({ splits: [] });
    expect(ab.getPersonItemSpend(100, 1)).toBe(0);
  });

  it("returns 0 when the friend has no share", () => {
    const ab = makeCalculator();
    expect(ab.getPersonItemSpend(200, 1)).toBe(0); // Alice not on sushi
  });

  it("splits evenly between two friends", () => {
    const ab = makeCalculator();
    // item 100: price=30, qty=1, totalSplit=2, Alice=1 → 30*1*1/2 = 15
    expect(ab.getPersonItemSpend(100, 1)).toBeCloseTo(15);
    expect(ab.getPersonItemSpend(100, 2)).toBeCloseTo(15);
  });

  it("splits proportionally when shares differ", () => {
    const ab = makeCalculator();
    // item 101: price=20, qty=2 → total=40; splits: Alice=1, Bob=1, Carol=2 → total=4
    expect(ab.getPersonItemSpend(101, 1)).toBeCloseTo(10); // 40*1/4
    expect(ab.getPersonItemSpend(101, 2)).toBeCloseTo(10);
    expect(ab.getPersonItemSpend(101, 3)).toBeCloseTo(20); // 40*2/4
  });
});

// ── getPersonBillSpend ────────────────────────────────────────────────────────

describe("getPersonBillSpend", () => {
  it("returns 0 for a bill with no items", () => {
    const ab = makeCalculator({ items: [] });
    expect(ab.getPersonBillSpend(10, 1)).toBe(0);
  });

  it("sums item spends for the person across the bill", () => {
    const ab = makeCalculator();
    // Bill 10: Alice pays 15 (pizza) + 10 (beer) = 25
    expect(ab.getPersonBillSpend(10, 1)).toBeCloseTo(25);
    // Bill 10: Bob pays 15 + 10 = 25
    expect(ab.getPersonBillSpend(10, 2)).toBeCloseTo(25);
    // Bill 10: Carol pays 0 + 20 = 20
    expect(ab.getPersonBillSpend(10, 3)).toBeCloseTo(20);
  });

  it("only counts items belonging to the requested bill", () => {
    const ab = makeCalculator();
    // Bill 20: Bob pays 30, Carol pays 30, Alice pays 0
    expect(ab.getPersonBillSpend(20, 1)).toBeCloseTo(0);
    expect(ab.getPersonBillSpend(20, 2)).toBeCloseTo(30);
    expect(ab.getPersonBillSpend(20, 3)).toBeCloseTo(30);
  });
});

// ── getPersonTotalSpend ───────────────────────────────────────────────────────

describe("getPersonTotalSpend", () => {
  it("returns one entry per bill", () => {
    const ab = makeCalculator();
    expect(ab.getPersonTotalSpend(1)).toHaveLength(BILLS.length);
  });

  it("sets 'from' to the friend and 'to' to the bill payer", () => {
    const ab = makeCalculator();
    const spends = ab.getPersonTotalSpend(1);
    expect(spends[0]).toMatchObject({ from: 1, to: 1 }); // bill 10 paid by Alice
    expect(spends[1]).toMatchObject({ from: 1, to: 2 }); // bill 20 paid by Bob
  });

  it("carries correct amounts", () => {
    const ab = makeCalculator();
    const spends = ab.getPersonTotalSpend(3); // Carol
    const bill10entry = spends.find((s) => s.to === 1)!;
    const bill20entry = spends.find((s) => s.to === 2)!;
    expect(bill10entry.amount).toBeCloseTo(20); // Carol's share of dinner
    expect(bill20entry.amount).toBeCloseTo(30); // Carol's share of lunch
  });
});

// ── getTotalSpend ─────────────────────────────────────────────────────────────

describe("getTotalSpend", () => {
  it("returns entries for every friend × bill combination", () => {
    const ab = makeCalculator();
    expect(ab.getTotalSpend()).toHaveLength(FRIENDS.length * BILLS.length);
  });

  it("returns empty array when there are no friends", () => {
    const ab = makeCalculator({ friends: [] });
    expect(ab.getTotalSpend()).toEqual([]);
  });
});

// ── aggregateDebts ────────────────────────────────────────────────────────────

describe("aggregateDebts", () => {
  it("returns an empty map for empty input", () => {
    const ab = makeCalculator();
    expect(ab.aggregateDebts([])).toEqual(new Map());
  });

  it("filters out zero-amount entries", () => {
    const ab = makeCalculator();
    const result = ab.aggregateDebts([{ from: 1, to: 2, amount: 0 }]);
    expect(result.size).toBe(0);
  });

  it("filters out self-debts (from === to)", () => {
    const ab = makeCalculator();
    const result = ab.aggregateDebts([{ from: 1, to: 1, amount: 50 }]);
    expect(result.size).toBe(0);
  });

  it("aggregates multiple spends from the same person to the same payer", () => {
    const ab = makeCalculator();
    const result = ab.aggregateDebts([
      { from: 3, to: 2, amount: 10 },
      { from: 3, to: 2, amount: 20 },
    ]);
    expect(result.get(3)?.get(2)).toBeCloseTo(30);
  });

  it("keeps separate entries for different payers", () => {
    const ab = makeCalculator();
    const result = ab.aggregateDebts([
      { from: 3, to: 1, amount: 20 },
      { from: 3, to: 2, amount: 30 },
    ]);
    expect(result.get(3)?.get(1)).toBeCloseTo(20);
    expect(result.get(3)?.get(2)).toBeCloseTo(30);
  });

  it("handles null payer (nobody paid)", () => {
    const ab = makeCalculator();
    const result = ab.aggregateDebts([{ from: 1, to: null, amount: 25 }]);
    expect(result.get(1)?.get(null)).toBeCloseTo(25);
  });

  it("produces correct totals from full spend data", () => {
    const ab = makeCalculator();
    const spends = ab.getTotalSpend();
    const matrix = ab.aggregateDebts(spends);

    // Alice (1) paid bill 10; Bob/Carol owe her from bill 10.
    // Bob (2) paid bill 20; Alice/Carol owe him from bill 20.
    // Alice owes Bob 0 (her bill 20 share = 0).
    // Carol owes Alice 20 (bill 10) and Bob 30 (bill 20).
    expect(matrix.get(3)?.get(1)).toBeCloseTo(20);
    expect(matrix.get(3)?.get(2)).toBeCloseTo(30);
  });
});

// ── balanceDebts ──────────────────────────────────────────────────────────────

describe("balanceDebts", () => {
  it("returns an empty map for an empty matrix", () => {
    const ab = makeCalculator();
    expect(ab.balanceDebts(new Map())).toEqual(new Map());
  });

  it("handle properly non-spender", () => {
    // 1 spent no single penny
    const ab = makeCalculator();
    const matrix = new Map([[3, new Map<number | null, number>([[1, 20]])]]);
    const result = ab.balanceDebts(matrix);
    expect(result).toEqual(matrix);
  });

  it("equal opposing debts: 0 outcome", () => {
    const ab = makeCalculator();
    const matrix = new Map([
      [1, new Map<number | null, number>([[2, 50]])],
      [2, new Map<number | null, number>([[1, 50]])],
    ]);
    const result = ab.balanceDebts(matrix);
    expect(result.size).toBe(0);
  });

  it("nets off unequal opposing debts, leaving the larger side", () => {
    const ab = makeCalculator();
    // Bob owes Alice 80, Alice owes Bob 30 → net: Bob owes Alice 50
    const matrix = new Map([
      [2, new Map<number | null, number>([[1, 80]])],
      [1, new Map<number | null, number>([[2, 30]])],
    ]);
    const result = ab.balanceDebts(matrix);
    expect(result.get(2)?.get(1)).toBe(50);
  });

  it("keeps a null-payer debt unchanged", () => {
    const ab = makeCalculator();
    const matrix = new Map([[1, new Map<number | null, number>([[null, 25]])]]);
    const result = ab.balanceDebts(matrix);
    expect(result.get(1)?.get(null)).toBeCloseTo(25);
  });

  it.only("big test", () => {
    const ab = makeCalculator();
    const matrix: MatrixSpends = new Map([
      [
        1,
        new Map<number | null, number>([
          [3, 25],
          [4, 21],
        ]),
      ],
      [
        2,
        new Map<number | null, number>([
          [1, 45],
          [3, 30],
          [4, 21],
        ]),
      ],
      [
        3,
        new Map<number | null, number>([
          [1, 20],
          [4, 21],
          [null, 12],
        ]),
      ],
      [
        4,
        new Map<number | null, number>([
          [1, 20],
          [3, 30],
          [null, 12],
        ]),
      ],
      [
        5,
        new Map<number | null, number>([
          [1, 31],
          [3, 25],
          [4, 21],
        ]),
      ],
    ]);
    const expectedMatrix: MatrixSpends = new Map([
      [
        1,
        new Map<number | null, number>([
          [3, 5],
          [4, 1],
        ]),
      ],
      [
        2,
        new Map<number | null, number>([
          [1, 45],
          [3, 30],
          [4, 21],
        ]),
      ],
      [3, new Map<number | null, number>([[null, 12]])],
      [
        4,
        new Map<number | null, number>([
          [3, 9],
          [null, 12],
        ]),
      ],
      [
        5,
        new Map<number | null, number>([
          [1, 31],
          [3, 25],
          [4, 21],
        ]),
      ],
    ]);
    const result = ab.balanceDebts(matrix);
    expect(result).toEqual(expectedMatrix);
  });
});
