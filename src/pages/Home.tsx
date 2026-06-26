import React from "react";
import { Bill, useAppContext } from "../context/AppContext";
import "./Home.css";
import { OnNavigate } from "../App";
import { isBillValid } from "../utils/validator";
import { useT } from "../i18n/I18nContext";
import ItemDiv from "../widgets/ItemDiv";

function Home(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { friends, items, bills, splits, createBill, deleteBill, selectBill } =
    useAppContext();
  const t = useT();

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
        </div>

        {bills.length > 0 ? (
          <>
            {bills.map((bill) => {
              const total = calculateBillTotal(bill.id);
              return (
                <ItemDiv
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
