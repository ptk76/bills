import { describe, expect, it } from "vitest";
import { parseReceiptModelOutput } from "../worker/receipt";

describe("parseReceiptModelOutput", () => {
  it("parses a clean JSON response", () => {
    const output =
      '{"total": 12.4, "items": [{"name": "Milk", "quantity": 1, "unit_price": 3.5, "total_price": 3.5}, {"name": "Bread", "quantity": 2, "unit_price": 2.2, "total_price": 4.4}]}';
    const result = parseReceiptModelOutput(output);
    expect(result.items).toEqual([
      { name: "Milk", quantity: 1, unit_price: 3.5, total_price: 3.5 },
      { name: "Bread", quantity: 2, unit_price: 2.2, total_price: 4.4 },
    ]);
  });

  it("strips markdown code fences", () => {
    const output =
      '```json\n{"total": 5, "items": [{"name": "Coffee", "quantity": 1, "unit_price": 5, "total_price": 5}]}\n```';
    const result = parseReceiptModelOutput(output);
    expect(result.items).toHaveLength(1);
    expect(result.items![0].name).toBe("Coffee");
  });

  it("drops invalid rows but keeps valid ones", () => {
    const output =
      '{"total": 9, "items": [{"name": "Valid", "quantity": 1, "unit_price": 4, "total_price": 4}, {"name": "", "quantity": 1, "unit_price": 4, "total_price": 4}, {"name": "ZeroQty", "quantity": 0, "unit_price": 4, "total_price": 4}]}';
    const result = parseReceiptModelOutput(output);
    expect(result.items).toHaveLength(1);
    expect(result.items![0].name).toBe("Valid");
  });

  it("returns null items for prose output", () => {
    const result = parseReceiptModelOutput("This is a receipt from a store.");
    expect(result.items).toBeNull();
    expect(result.description).toBe("This is a receipt from a store.");
  });
});
