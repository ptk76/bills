import React, { useState } from "react";
import { Item, useAppContext } from "../context/AppContext";
import styles from "./Scan.module.css";
import { splitLineByLastTwo } from "../utils/lexer";
import { Page } from "../components/Navigation";

type BillRow = {
  name: string;
  quantityStr: string;
  quantity: number;
  priceStr: string;
  price: number;
  totalPrice: string;
  valid: boolean;
};

function Csv(props: { onNavigate: (page: Page) => void }): React.JSX.Element {
  const { createFullBill } = useAppContext();
  const [bill, setBill] = useState<BillRow[]>([]);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  const handleAddFullBill = async () => {
    const validBill = bill.filter((row) => row.valid);
    const items: Omit<Item, "id" | "bill_id">[] = validBill.map((row) => ({
      title: row.name,
      quantity: row.quantity,
      price: row.price,
    }));
    createFullBill(title, items);
    props.onNavigate("home");
  };

  const parseTextToBIll = (text: string) => {
    const rows = text.split("\n");

    const parsedBill: BillRow[] = rows.map((row) => {
      const split = splitLineByLastTwo(row, ",");
      return {
        name: split.name,
        quantityStr: split.quantity ?? "?",
        quantity: parseFloat(split.quantity ?? ""),
        priceStr: split.unit_price ?? "?",
        price: parseFloat(split.unit_price ?? ""),
        totalPrice: split.total_price ?? "?",
        valid:
          split.success &&
          !isNaN(parseFloat(split.quantity ?? "")) &&
          !isNaN(parseFloat(split.unit_price ?? "")) &&
          !isNaN(parseFloat(split.total_price ?? "")),
      } satisfies BillRow;
    });
    if (parsedBill.length > 0) setBill(parsedBill);
  };

  const countValidItems = () => {
    return bill.reduce((total, raw) => total + (raw.valid ? 1 : 0), 0);
  };
  const startEditingTitle = () => {
    setEditingTitle(true);
  };

  const saveTitleEdit = () => {
    // if (title.trim() !== "") {
    // }
    setEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    // setTempTitle("");
    setEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitleEdit();
    } else if (e.key === "Escape") {
      cancelTitleEdit();
    }
  };

  const showParsedBill = () => {
    if (bill.length === 0) return <></>;
    return bill.map((row, idx) => {
      return (
        <div className={styles["table-row"]} key={row.name + idx}>
          <div className={styles["valid-column"]}>{row.valid ? "" : "⛔"}</div>
          <div className={styles["name-column"]}>{row.name}</div>
          <div className={styles["quantity-column"]}>{row.quantityStr}</div>
          <div className={styles["unit-price-column"]}>{row.priceStr}</div>
          <div className={styles["total-price-column"]}>{row.totalPrice}</div>
        </div>
      );
    });
  };

  return (
    <div className={styles["about-container"]}>
      <div className={styles["items-section"]}>
        <div className={styles["title-header"]}>
          {editingTitle ? (
            <div className={styles["title-edit-mode"]}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleTitleKeyPress}
                className={styles["title-input"]}
                autoFocus
              />
              <div className={styles["title-actions"]}>
                <button
                  onClick={saveTitleEdit}
                  className={styles["save-button"]}
                >
                  Save
                </button>
                <button
                  onClick={cancelTitleEdit}
                  className={styles["cancel-button"]}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles["title-view-mode"]}>
              <h2>{title ? title : "Monkey"}</h2>
              <button
                onClick={startEditingTitle}
                className={styles["edit-title-button"]}
              >
                Edit Title
              </button>
            </div>
          )}
        </div>

        <div className={styles["parsed-card"]}>
          <div className={styles["table-header"]}>
            <div className={styles["valid-column"]}></div>
            <div className={styles["name-column"]}>Name</div>
            <div className={styles["quantity-column"]}>Qt.</div>
            <div className={styles["unit-price-column"]}>Price</div>
            <div className={styles["total-price-column"]}>Total</div>
          </div>
          {showParsedBill()}
        </div>

        <div className={styles["add-item-form"]}>
          <textarea
            rows={20}
            // value={`itemName`}
            onChange={(e) => parseTextToBIll(e.target.value)}
            placeholder="Item name"
            className={styles["item-name-input"]}
          />
        </div>
        <button
          onClick={handleAddFullBill}
          className={styles["add-bill-button"]}
          disabled={countValidItems() === 0 || editingTitle}
        >
          Add bill ({countValidItems()} items)
        </button>
      </div>
    </div>
  );
}

export default Csv;
