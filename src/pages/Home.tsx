import React, { useRef, useState } from "react";
import { Bill, useAppContext } from "../context/AppContext";
import "./Home.css";
import { OnNavigate } from "../App";
import { isBillValid } from "../utils/validator";
import { useT } from "../i18n/I18nContext";
import ItemDiv from "../widgets/ItemDiv";

type AiStatus = {
  status: "idle" | "uploading" | "done" | "error";
  message?: string;
};

type ReceiptItem = {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

function Home(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const {
    friends,
    items,
    bills,
    splits,
    createBill,
    createFullBill,
    deleteBill,
    selectBill,
  } = useAppContext();
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>({ status: "idle" });

  const handleCreateBill = async () => {
    const billId = await createBill("Monkey");
    if (billId !== undefined) {
      selectBill(billId);
      props.onNavigate("bill");
    }
  };

  const handleSelectBill = (billId: number) => {
    selectBill(billId);
    props.onNavigate("bill");
  };

  const handleCreateBillFromCsv = () => {
    props.onNavigate("scan");
  };

  const handleScanPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;

    setAiStatus({ status: "uploading", message: t("home.scanPhotoUploading") });
    try {
      // Send a picture of the receipt to the worker for AI analysis.
      const response = await fetch("/ai", {
        method: "POST",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as {
        description?: string;
        items?: ReceiptItem[] | null;
      };

      const validItems = (data.items ?? []).filter(
        (item) =>
          item.name !== "" &&
          !isNaN(Number(item.quantity)) &&
          Number(item.quantity) > 0 &&
          !isNaN(Number(item.unit_price)),
      );

      if (validItems.length > 0) {
        await createFullBill(
          "Monkey",
          validItems.map((item) => ({
            title: item.name,
            quantity: Number(item.quantity),
            price: Number(item.unit_price),
          })),
        );
        props.onNavigate("home");
        return;
      }

      // No parseable items: still surface what the model read.
      setAiStatus({
        status: "done",
        message: data.description ?? t("home.scanPhotoError"),
      });
    } catch (error) {
      console.error("Photo upload failed:", error);
      setAiStatus({ status: "error", message: t("home.scanPhotoError") });
    }
  };

  const handleDeleteBill = (billId: number) => {
    if (confirm(t("home.confirmDelete"))) {
      deleteBill(billId);
    }
  };

  const calculateBillTotal = (billId: number): number => {
    return items.reduce(
      (total, item) =>
        total + (item.bill_id === billId ? item.price * item.quantity : 0),
      0,
    );
  };

  const paidBy = (bill: Bill) => {
    if (bill.paid_by === null) return null;
    const friend = friends.find((friend) => friend.id === bill.paid_by);
    if (!friend) return null;

    return friend.nick;
  };

  return (
    <div className="home-container">
      <div className="bills-section">
        <h2>{t("home.title")}</h2>

        <div className="create-bill-form">
          <button onClick={handleCreateBill} className="create-bill-button">
            {t("home.createBill")}
          </button>
          <button
            onClick={handleCreateBillFromCsv}
            className="create-bill-from-csv-button"
          >
            {t("home.createBillFromCsv")}
          </button>
          <button
            onClick={handleScanPhotoClick}
            className="create-bill-from-photo-button"
            disabled={aiStatus.status === "uploading"}
          >
            {t("home.scanPhoto")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            hidden
          />
        </div>

        {aiStatus.status !== "idle" && (
          <div className={`ai-status ai-status-${aiStatus.status}`}>
            {aiStatus.status === "uploading"
              ? t("home.scanPhotoUploading")
              : aiStatus.message}
          </div>
        )}

        {bills.length > 0 ? (
          <>
            {bills.map((bill) => {
              const total = calculateBillTotal(bill.id);
              return (
                <ItemDiv
                  key={bill.id}
                  id={bill.id}
                  onClick={handleSelectBill}
                  warning={!isBillValid(bill, items, splits)}
                  title={bill.title}
                  currency={bill.currency}
                  amount={total}
                  subtitle={
                    t("common.paidBy") +
                    " " +
                    (paidBy(bill) ?? t("home.payerNone"))
                  }
                  onButtonClick={handleDeleteBill}
                  buttonTitle={t("common.delete")}
                />
              );
            })}
          </>
        ) : (
          <div className="empty-state">
            <p>{t("home.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
