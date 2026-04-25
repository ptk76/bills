import React from "react";
import { Bill, useAppContext } from "../context/AppContext";
import "./Home.css";
import { OnNavigate } from "../App";
import Warning from "../widgets/Warning";
import { isBillValid } from "../utils/validator";

function Home(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const {
    currency,
    friends,
    items,
    bills,
    splits,
    createBill,
    deleteBill,
    selectBill,
  } = useAppContext();

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
    if (confirm("Are you sure you want to delete this bill?")) {
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
        <h2>The Bills</h2>

        <div className="create-bill-form">
          <button onClick={handleCreateBill} className="create-bill-button">
            Create Bill
          </button>
          <button
            onClick={handleCreateBillFromCsv}
            className="create-bill-from-csv-button"
          >
            Create Bill from CSV
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
                      {total.toFixed(2)} {currency}
                    </div>
                  </div>
                  <div className="bill-info">
                    <div className="bill-stats">
                      <span className="stat-item">
                        Paid by:{" "}
                        <strong>
                          {paidBy(bill) ?? (
                            <strong className="paid-by-none">NONE</strong>
                          )}
                        </strong>
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteBill(bill.id, e)}
                      className="delete-bill-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No bills yet. Create your first bill above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
