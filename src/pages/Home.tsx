import React from "react";
import { Bill, useAppContext } from "../context/AppContext";
import "./Home.css";
import { OnNavigate } from "../App";
import Warning from "../widgets/Warning";
import { isBillValid } from "../utils/validator";
import Currency from "../widgets/Currency";
import { useT } from "../i18n/I18nContext";

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

  const handleDeleteBill = (billId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
          <div className="bills-list">
            {bills.map((bill) => {
              const total = calculateBillTotal(bill.id);
              return (
                <div
                  key={bill.id}
                  className={`bill-card`}
                  onClick={() => handleSelectBill(bill.id)}
                >
                  <div className="bill-header">
                    {!isBillValid(bill, items, splits) && <Warning />}
                    <h3>{bill.title}</h3>
                    <div className="billTotal">
                      <Currency currency={bill.currency} amount={total} />
                    </div>
                  </div>
                  <div className="bill-info">
                    <div className="bill-stats">
                      <span className="stat-item">
                        {t("common.paidBy")}{" "}
                        <strong>
                          {paidBy(bill) ?? (
                            <strong className="paid-by-none">
                              {t("home.payerNone")}
                            </strong>
                          )}
                        </strong>
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteBill(bill.id, e)}
                      className="delete-bill-button"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
