// @vitest-environment jsdom
import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AppProvider,
  useAppContext,
  Friend,
  Bill,
  Item,
  Split,
} from "../src/context/AppContext";

// ---------- fetch mock ----------
const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonRes(data: unknown): Response {
  return { json: () => Promise.resolve(data) } as unknown as Response;
}

// ---------- fixtures ----------
const FRIENDS: Friend[] = [{ id: 1, nick: "Alice", group_id: 0 }];
const BILLS: Bill[] = [
  { id: 10, title: "Dinner", token: "test-token", paid_by: null },
];
const ITEMS: Item[] = [
  { id: 100, title: "Pizza", price: 20, quantity: 2, bill_id: 10 },
];
const SPLITS: Split[] = [{ item_id: 100, friend_id: 1, quantity: 1 }];

function setupFetch(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    "/friends": FRIENDS,
    "/groups": [],
    "/bills": BILLS,
    "/returns": [],
    "/items": ITEMS,
    "/splits": SPLITS,
    ...overrides,
  };
  mockFetch.mockImplementation((url: string) => {
    const path = url.split("?")[0];
    return Promise.resolve(jsonRes(path in base ? base[path] : []));
  });
}

// ---------- helpers ----------
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider token="test-token">{children}</AppProvider>
);

async function mountAndWait() {
  const hook = renderHook(() => useAppContext(), { wrapper });
  await waitFor(() =>
    expect(hook.result.current.queryInProgress).toBe(false),
  );
  return hook;
}

// ---------- tests ----------

describe("useAppContext", () => {
  it("throws when used outside AppProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => renderHook(() => useAppContext())).toThrow(
      "useAppContext must be used within an AppProvider",
    );
    consoleError.mockRestore();
  });
});

describe("AppProvider — initial data load", () => {
  beforeEach(() => setupFetch());

  it("sets queryInProgress to false after init", async () => {
    const { result } = await mountAndWait();
    expect(result.current.queryInProgress).toBe(false);
  });

  it("populates friends from /friends", async () => {
    const { result } = await mountAndWait();
    expect(result.current.friends).toEqual(FRIENDS);
  });

  it("populates bills from /bills", async () => {
    const { result } = await mountAndWait();
    expect(result.current.bills).toEqual(BILLS);
  });

  it("sets currentBillId to the first bill's id", async () => {
    const { result } = await mountAndWait();
    expect(result.current.currentBillId).toBe(10);
  });

  it("sets currentBill to the first bill object", async () => {
    const { result } = await mountAndWait();
    expect(result.current.currentBill).toEqual(BILLS[0]);
  });

  it("derives title from currentBill", async () => {
    const { result } = await mountAndWait();
    expect(result.current.title).toBe("Dinner");
  });

  it("derives paidBy from currentBill (null)", async () => {
    const { result } = await mountAndWait();
    expect(result.current.paidBy).toBeNull();
  });

  it("populates items from /items", async () => {
    const { result } = await mountAndWait();
    expect(result.current.items).toEqual(ITEMS);
  });

  it("populates splits from /splits", async () => {
    const { result } = await mountAndWait();
    expect(result.current.splits).toEqual(SPLITS);
  });

  it("uses fallback title when no bills exist", async () => {
    setupFetch({ "/bills": [] });
    const { result } = await mountAndWait();
    expect(result.current.currentBillId).toBeNull();
    expect(result.current.currentBill).toBeNull();
    expect(result.current.title).toBe("Items & Billing");
  });

  it("derives paidBy from currentBill when set", async () => {
    setupFetch({
      "/bills": [{ id: 10, title: "Dinner", token: "test-token", paid_by: 1 }],
    });
    const { result } = await mountAndWait();
    expect(result.current.paidBy).toBe(1);
  });
});

describe("selectBill", () => {
  const TWO_BILLS: Bill[] = [
    { id: 10, title: "Dinner", token: "test-token", paid_by: null },
    { id: 20, title: "Lunch", token: "test-token", paid_by: 1 },
  ];

  beforeEach(() => setupFetch({ "/bills": TWO_BILLS }));

  it("updates currentBillId synchronously", async () => {
    const { result } = await mountAndWait();
    act(() => result.current.selectBill(20));
    expect(result.current.currentBillId).toBe(20);
  });

  it("updates currentBill to the selected bill", async () => {
    const { result } = await mountAndWait();
    act(() => result.current.selectBill(20));
    expect(result.current.currentBill?.title).toBe("Lunch");
  });

  it("updates derived paidBy from the selected bill", async () => {
    const { result } = await mountAndWait();
    act(() => result.current.selectBill(20));
    expect(result.current.paidBy).toBe(1);
  });
});

describe("addFriend", () => {
  beforeEach(() => setupFetch());

  it("does not call fetch for an empty name", async () => {
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.addFriend(""));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not call fetch for a whitespace-only name", async () => {
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.addFriend("   "));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls /friends?cmd=add with the trimmed name", async () => {
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.addFriend("Bob"));
    const urls: string[] = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(
      urls.some((u) => u.includes("cmd=add") && u.includes("nick=Bob")),
    ).toBe(true);
  });

  it("refreshes friends after adding", async () => {
    const { result } = await mountAndWait();
    const updated: Friend[] = [
      ...FRIENDS,
      { id: 2, nick: "Bob", group_id: 0 },
    ];
    setupFetch({ "/friends": updated });
    await act(() => result.current.addFriend("Bob"));
    expect(result.current.friends).toEqual(updated);
  });
});

describe("toggleNameInItem", () => {
  it("does nothing when itemId is not found", async () => {
    setupFetch();
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.toggleNameInItem(999, 1));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("sends quantity=1 when no existing split", async () => {
    setupFetch({ "/splits": [] });
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.toggleNameInItem(100, 1));
    const urls: string[] = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes("quantity=1"))).toBe(true);
  });

  it("increments split quantity when below item.quantity", async () => {
    // existing split quantity=1, item.quantity=2 → next=(1+1)%(2+1)=2
    setupFetch({ "/splits": [{ item_id: 100, friend_id: 1, quantity: 1 }] });
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.toggleNameInItem(100, 1));
    const urls: string[] = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes("quantity=2"))).toBe(true);
  });

  it("wraps quantity back to 0 when it reaches item.quantity", async () => {
    // existing split quantity=2, item.quantity=2 → next=(2+1)%(2+1)=0
    setupFetch({ "/splits": [{ item_id: 100, friend_id: 1, quantity: 2 }] });
    const { result } = await mountAndWait();
    mockFetch.mockClear();
    await act(() => result.current.toggleNameInItem(100, 1));
    const urls: string[] = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes("quantity=0"))).toBe(true);
  });
});
