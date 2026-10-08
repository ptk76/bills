// Helpers for the receipt-scanning AI endpoint. Prompt asks a vision model to
// return structured JSON; parsing is defensive because small models often wrap
// the output in prose or omit fields.

export const RECEIPT_PROMPT = `
You are a receipt parser. Look at this image of a receipt and convert it into a plain text:
title:RECEIPT_TITLE
item:\tITEM_NAME\tITEM_QUANTITY\tITEM_PRICE
where:
- RECEIPT_TITLE is a name of the receipt, like a name of the restaurant, a store, there must only one line with the title
- ITEM_NAME is an item's name
- ITEM_QUANTITY is the quantity of the purchased item
- ITEM_PRICE is the price for the single item
There can be many lines with the prefix "item:"
`;

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
