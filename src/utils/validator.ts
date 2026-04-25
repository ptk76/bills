import { Bill, Item, Split } from "../context/AppContext";

export function isItemValid(item: Item, splits: Split[]) {
  const splitQuantity = splits.reduce(
    (total, split) => total + (split.item_id === item.id ? split.quantity : 0),
    0,
  );
  console.log("ITEM:", item.title, splitQuantity, splitQuantity > 0);
  return splitQuantity > 0;
}

export function areItemsValid(
  billId: number | null,
  items: Item[],
  splits: Split[],
) {
  if (!billId) return false;
  const billItems = items.filter((item) => item.bill_id === billId);
  if (billItems.length === 0) return false;

  for (const item of billItems) {
    if (!isItemValid(item, splits)) return false;
  }
  return true;
}

export function isBillValid(bill: Bill, items: Item[], splits: Split[]) {
  if (!bill.paid_by) return false;
  return areItemsValid(bill.id, items, splits);
}

export function areBillsValid(bills: Bill[], items: Item[], splits: Split[]) {
  for (const bill of bills) {
    if (!isBillValid(bill, items, splits)) return false;
  }
  return true;
}
