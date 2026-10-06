// Helpers for the receipt-scanning AI endpoint. Prompt asks a vision model to
// return structured JSON; parsing is defensive because small models often wrap
// the output in prose or omit fields.

export const RECEIPT_PROMPT = `You are a receipt parser. Look at this image of a receipt and return ONLY a JSON object with no extra text and no markdown code fences, in exactly this shape:
{"total": 23.4, "items": [{"name": "Milk", "quantity": 1, "unit_price": 3.5, "total_price": 3.5}]}
Rules:
- "name" is the product name as printed on the receipt.
- "quantity" is a number (default 1 if not shown).
- "unit_price" and "total_price" are numbers, without currency symbols.
- Include every line item; skip totals, discounts and footer lines.
- If you cannot read any items, return {"total": null, "items": []}.`;

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ReceiptResult {
  description: string;
  items: ReceiptItem[] | null;
}

export function parseReceiptModelOutput(text: string): ReceiptResult {
  // Strip markdown fences and keep the first balanced {...} object so a chatty
  // response still parses.
  let raw = text.trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) raw = fenced[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return { description: text, items: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { description: text, items: null };
  }

  const itemsArray = Array.isArray(parsed) ? parsed : (parsed as any).items;
  if (!Array.isArray(itemsArray)) return { description: text, items: null };

  const items = itemsArray
    .map((item): ReceiptItem | null => {
      if (typeof item !== "object" || item === null) return null;
      const { name, quantity, unit_price, total_price } = item as Record<
        string,
        unknown
      >;
      const qty = Number(quantity);
      const unit = Number(unit_price);
      const total = Number(total_price);
      if (typeof name !== "string" || name === "") return null;
      if (isNaN(qty) || qty <= 0) return null;
      if (isNaN(unit) || isNaN(total)) return null;
      return { name, quantity: qty, unit_price: unit, total_price: total };
    })
    .filter((item): item is ReceiptItem => item !== null);

  return { description: text, items: items.length > 0 ? items : null };
}
