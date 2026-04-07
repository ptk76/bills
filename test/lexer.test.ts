import { describe, it, expect } from "vitest";
import { splitLineByLastTwo } from "../src/utils/lexer";

describe("splitLineByLastTwo", () => {
  describe("empty / blank input", () => {
    it("returns failure for empty string", () => {
      expect(splitLineByLastTwo("")).toEqual({ name: "", success: false });
    });

    it("returns failure for delimiter-only string", () => {
      expect(splitLineByLastTwo(",,,")).toEqual({ name: "", success: false });
    });
  });

  describe("1 part", () => {
    it("returns name-only with success false", () => {
      expect(splitLineByLastTwo("Burger")).toEqual({
        name: "Burger",
        success: false,
      });
    });
  });

  describe("2 parts", () => {
    it("returns name + total_price with success false", () => {
      expect(splitLineByLastTwo("Burger,12.50")).toEqual({
        name: "Burger",
        total_price: "12.50",
        success: false,
      });
    });
  });

  describe("3 parts", () => {
    it("calculates unit_price and returns success true when numbers are valid", () => {
      const result = splitLineByLastTwo("Burger,2,10.00");
      expect(result).toEqual({
        name: "Burger",
        quantity: "2",
        unit_price: "5",
        total_price: "10.00",
        success: true,
      });
    });

    it("handles decimal quantity", () => {
      const result = splitLineByLastTwo("Fries,0.5,3.00");
      expect(result.unit_price).toBe("6");
      expect(result.success).toBe(true);
    });

    it("returns success false when quantity is non-numeric", () => {
      const result = splitLineByLastTwo("Burger,two,10.00");
      expect(result.success).toBe(false);
      expect(result.unit_price).toBe("NaN");
    });

    it("returns success false when total_price is non-numeric", () => {
      const result = splitLineByLastTwo("Burger,2,ten");
      expect(result.success).toBe(false);
      expect(result.unit_price).toBe("NaN");
    });

    it("returns success false when both last two parts are non-numeric", () => {
      const result = splitLineByLastTwo("Burger,two,ten");
      expect(result.success).toBe(false);
    });
  });

  describe("4+ parts", () => {
    it("uses unit_price directly from input (no calculation)", () => {
      expect(splitLineByLastTwo("Combo Meal,2,5.00,10.00")).toEqual({
        name: "Combo Meal",
        quantity: "2",
        unit_price: "5.00",
        total_price: "10.00",
        success: true,
      });
    });

    it("joins extra name parts with the delimiter", () => {
      const result = splitLineByLastTwo("Big,Tasty,Burger,3,4.00,12.00");
      expect(result.name).toBe("Big,Tasty,Burger");
      expect(result.quantity).toBe("3");
      expect(result.unit_price).toBe("4.00");
      expect(result.total_price).toBe("12.00");
      expect(result.success).toBe(true);
    });
  });

  describe("custom delimiter", () => {
    it("splits by semicolon", () => {
      expect(splitLineByLastTwo("Burger;2;10.00", ";")).toEqual({
        name: "Burger",
        quantity: "2",
        unit_price: "5",
        total_price: "10.00",
        success: true,
      });
    });

    it("splits by tab", () => {
      const result = splitLineByLastTwo("Soda\t3\t6.00", "\t");
      expect(result.name).toBe("Soda");
      expect(result.quantity).toBe("3");
      expect(result.success).toBe(true);
    });
  });
});
