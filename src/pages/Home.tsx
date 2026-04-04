import React, { useEffect, useState } from "react";
import { Bill, Item, useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home(): React.JSX.Element {
  const {
    friends,
    items,
    splits,
    bills,
    currentBillId,
    createBill,
    deleteBill,
    selectBill,
  } = useAppContext();
  const [billTitle, setBillTitle] = useState<string>("");
  const navigate = useNavigate();

  const handleCreateBill = () => {
    if (billTitle.trim() !== "") {
      createBill(billTitle);
      setBillTitle("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateBill();
    }
  };

  const handleSelectBill = (billId: number) => {
    selectBill(billId);
    navigate("/about");
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

  const countPeople = (billId: number) => {
    const billItems = items.filter((item) => item.bill_id === billId);
    const billSplits = splits.filter(
      (split) =>
        billItems.find((item) => item.id === split.item_id) &&
        split.quantity !== 0,
    );
    return billSplits.length;
  };

  const countItems = (billId: number) => {
    return items.reduce(
      (total, item) => total + (item.bill_id === billId ? 1 : 0),
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
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter bill title (e.g., Dinner Party, Trip to Paris)"
            className="bill-title-input"
          />
          <button onClick={handleCreateBill} className="create-bill-button">
            Create Bill
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
                    <h3>{bill.title}</h3>
                    <button
                      onClick={(e) => handleDeleteBill(bill.id, e)}
                      className="delete-bill-button"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="bill-info">
                    <div className="bill-stats">
                      <span className="stat-item">
                        <strong>{countItems(bill.id)}</strong> items
                      </span>
                      <span className="stat-item">
                        <strong>{countPeople(bill.id)}</strong> people
                      </span>
                      <span className="stat-item">
                        Paid by:{" "}
                        <strong>
                          {paidBy(bill) ?? (
                            <strong className="paid-by-none">NONE</strong>
                          )}
                        </strong>
                      </span>
                    </div>
                    <div className="bill-total">{total.toFixed(2)} €</div>
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
