// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Statistics from "../src/pages/Statistics";
import { useAppContext } from "../src/context/AppContext";
import type { Friend, Bill, Item, Split } from "../src/context/AppContext";

vi.mock("../src/pages/Statistics.css", () => ({}));
vi.mock("../src/context/AppContext");

const mockUseAppContext = vi.mocked(useAppContext);

// ---------- fixtures ----------
const ALICE: Friend = { id: 1, nick: "Alice", group_id: 0 };
const BOB: Friend = { id: 2, nick: "Bob", group_id: 0 };

interface MoneyReturn {
  id: number;
  from_friend_id: number;
  to_friend_id: number;
  title: string;
  amount: number;
}

interface ContextOverrides {
  friends?: Friend[];
  bills?: Bill[];
  items?: Item[];
  splits?: Split[];
  moneyReturns?: MoneyReturn[];
}

function setup(overrides: ContextOverrides = {}) {
  mockUseAppContext.mockReturnValue({
    friends: [],
    bills: [],
    items: [],
    splits: [],
    moneyReturns: [],
    ...overrides,
  } as unknown as ReturnType<typeof useAppContext>);
  render(<Statistics />);
}

// ---------- tests ----------

describe("Statistics — empty state", () => {
  it("shows empty state message when there are no bills", () => {
    setup();
    expect(
      screen.getByText("No bills available. Create a bill to see statistics."),
    ).toBeInTheDocument();
  });

  it("renders the Payment Statistics heading", () => {
    setup();
    expect(screen.getByText("Payment Statistics")).toBeInTheDocument();
  });
});

describe("Statistics — no debts", () => {
  beforeEach(() => {
    setup({
      friends: [ALICE, BOB],
      bills: [{ id: 10, title: "Dinner", token: "t", paid_by: 1 }],
      items: [{ id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 }],
      splits: [], // no splits → no one owes anything
    });
  });

  it("shows 'No debts to display' in the total summary", () => {
    expect(screen.getByText("No debts to display.")).toBeInTheDocument();
  });

  it("renders Total Debts Summary section", () => {
    expect(screen.getByText("Total Debts Summary")).toBeInTheDocument();
  });
});

describe("Statistics — bill without paid_by", () => {
  it("does not include the bill in Bills Breakdown", () => {
    setup({
      friends: [ALICE, BOB],
      bills: [{ id: 10, title: "Dinner", token: "t", paid_by: null }],
      items: [{ id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 }],
      splits: [{ item_id: 100, friend_id: 2, quantity: 1 }],
    });
    expect(
      screen.getByText("No bills with payment information available."),
    ).toBeInTheDocument();
  });
});

describe("Statistics — single bill, one debtor", () => {
  // Alice paid; item price=20, qty=1; Alice and Bob split equally → Bob owes Alice 10
  beforeEach(() => {
    setup({
      friends: [ALICE, BOB],
      bills: [{ id: 10, title: "Dinner", token: "t", paid_by: 1 }],
      items: [{ id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 }],
      splits: [
        { item_id: 100, friend_id: 1, quantity: 1 },
        { item_id: 100, friend_id: 2, quantity: 1 },
      ],
    });
  });

  it("shows Bob as debtor in total summary", () => {
    const fromEls = screen.getAllByText("Bob");
    expect(fromEls.length).toBeGreaterThan(0);
  });

  it("shows Alice as creditor in total summary", () => {
    const toEls = screen.getAllByText("Alice");
    expect(toEls.length).toBeGreaterThan(0);
  });

  it("displays the correct debt amount (10.00 €)", () => {
    const amounts = screen.getAllByText("10.00 €");
    expect(amounts.length).toBeGreaterThan(0);
  });

  it("shows the bill title in Bills Breakdown", () => {
    expect(screen.getByText("Dinner")).toBeInTheDocument();
  });

  it("shows the bill total (20.00 €) in Bills Breakdown", () => {
    expect(screen.getByText("20.00 €")).toBeInTheDocument();
  });

  it("shows 'Paid by: Alice' label", () => {
    expect(screen.getByText("Paid by: Alice")).toBeInTheDocument();
  });
});

describe("Statistics — item with quantity > 1", () => {
  // price=5, qty=4, total=20; Alice and Bob each take 2 parts → Bob owes Alice 10
  it("calculates Bob's share from item quantity", () => {
    setup({
      friends: [ALICE, BOB],
      bills: [{ id: 10, title: "Lunch", token: "t", paid_by: 1 }],
      items: [{ id: 100, title: "Sushi", price: 5, quantity: 4, bill_id: 10 }],
      splits: [
        { item_id: 100, friend_id: 1, quantity: 2 },
        { item_id: 100, friend_id: 2, quantity: 2 },
      ],
    });
    const amounts = screen.getAllByText("10.00 €");
    expect(amounts.length).toBeGreaterThan(0);
  });
});

describe("Statistics — net debts across two bills", () => {
  // Bill 10: Alice paid; Bob owes Alice 10
  // Bill 20: Bob paid; Alice owes Bob 15
  // Net: Alice owes Bob 5
  beforeEach(() => {
    setup({
      friends: [ALICE, BOB],
      bills: [
        { id: 10, title: "Dinner", token: "t", paid_by: 1 },
        { id: 20, title: "Lunch", token: "t", paid_by: 2 },
      ],
      items: [
        { id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 },
        { id: 200, title: "Sushi", price: 30, quantity: 1, bill_id: 20 },
      ],
      splits: [
        { item_id: 100, friend_id: 1, quantity: 1 },
        { item_id: 100, friend_id: 2, quantity: 1 },
        { item_id: 200, friend_id: 1, quantity: 1 },
        { item_id: 200, friend_id: 2, quantity: 1 },
      ],
    });
  });

  it("shows the net debt of 5.00 €", () => {
    expect(screen.getByText("5.00 €")).toBeInTheDocument();
  });

  it("shows Alice and Bob in the total summary", () => {
    const summarySection = screen
      .getByText("Total Debts Summary")
      .closest("div")!;
    expect(summarySection.textContent).toContain("Alice");
    expect(summarySection.textContent).toContain("Bob");
  });

  it("does not show raw individual debts in total summary (only net)", () => {
    // Raw would be 10 and 15; net is 5 — neither 10.00 € nor 15.00 € appear in summary
    const summarySection = screen
      .getByText("Total Debts Summary")
      .closest("div")!;
    expect(summarySection.textContent).not.toContain("10.00 €");
    expect(summarySection.textContent).not.toContain("15.00 €");
  });
});

describe("Statistics — money returns", () => {
  const baseContext: ContextOverrides = {
    friends: [ALICE, BOB],
    bills: [{ id: 10, title: "Dinner", token: "t", paid_by: 1 }],
    items: [{ id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 }],
    splits: [
      { item_id: 100, friend_id: 1, quantity: 1 },
      { item_id: 100, friend_id: 2, quantity: 1 },
    ],
    // Bob owes Alice 10
  };

  it("reduces debt by the returned amount", () => {
    setup({
      ...baseContext,
      moneyReturns: [
        {
          id: 1,
          from_friend_id: 2,
          to_friend_id: 1,
          title: "partial",
          amount: 4,
        },
      ],
    });
    // Bob paid back 4 → still owes 6
    expect(screen.getByText("6.00 €")).toBeInTheDocument();
  });

  it("shows no debt when money return fully covers the bill debt", () => {
    setup({
      ...baseContext,
      moneyReturns: [
        {
          id: 1,
          from_friend_id: 2,
          to_friend_id: 1,
          title: "full",
          amount: 10,
        },
      ],
    });
    expect(screen.getByText("No debts to display.")).toBeInTheDocument();
  });

  it("does not cancel Bob's debt when the return is Alice→Bob (wrong direction)", () => {
    // from_friend_id=1 (Alice), to_friend_id=2 (Bob) means Alice paid Bob back.
    // debtMatrix["Alice"]["Bob"] = 0 - 10 = -10 (Alice's phantom negative debt).
    // debtMatrix["Bob"]["Alice"] = 10 (Bob's real bill debt).
    // Net: Bob owes Alice 10 - (-10) = 20, so debt remains visible.
    setup({
      ...baseContext,
      moneyReturns: [
        {
          id: 1,
          from_friend_id: 1,
          to_friend_id: 2,
          title: "wrong way",
          amount: 10,
        },
      ],
    });
    expect(screen.queryByText("No debts to display.")).not.toBeInTheDocument();
  });
});

describe("Statistics — bills breakdown section", () => {
  it("shows per-bill individual debts (not netted)", () => {
    // Bill 10: Alice paid; Bob owes Alice 10
    // Bill 20: Bob paid; Alice owes Bob 15
    // Per-bill breakdown shows 10 and 15 separately
    setup({
      friends: [ALICE, BOB],
      bills: [
        { id: 10, title: "Dinner", token: "t", paid_by: 1 },
        { id: 20, title: "Lunch", token: "t", paid_by: 2 },
      ],
      items: [
        { id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 },
        { id: 200, title: "Sushi", price: 30, quantity: 1, bill_id: 20 },
      ],
      splits: [
        { item_id: 100, friend_id: 1, quantity: 1 },
        { item_id: 100, friend_id: 2, quantity: 1 },
        { item_id: 200, friend_id: 1, quantity: 1 },
        { item_id: 200, friend_id: 2, quantity: 1 },
      ],
    });
    const breakdownSection = screen
      .getByText("Bills Breakdown")
      .closest("div")!;
    expect(breakdownSection.textContent).toContain("10.00 €");
    expect(breakdownSection.textContent).toContain("15.00 €");
  });

  it("shows 'No debts for this bill' when all items have no splits", () => {
    setup({
      friends: [ALICE, BOB],
      bills: [{ id: 10, title: "Dinner", token: "t", paid_by: 1 }],
      items: [{ id: 100, title: "Pizza", price: 20, quantity: 1, bill_id: 10 }],
      splits: [],
    });
    expect(screen.getByText("No debts for this bill.")).toBeInTheDocument();
  });
});
