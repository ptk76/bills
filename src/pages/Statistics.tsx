import React from "react";
import { useAppContext } from "../context/AppContext";
import "./Statistics.css";

interface Debt {
  from: string;
  to: string;
  amount: number;
}

function Statistics(): React.JSX.Element {
  const { friends, bills } = useAppContext();

  // Calculate how much each person owes for a specific bill
  const calculateBillDebts = (billId: string): Debt[] => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || !bill.paidBy) return [];

    const payer = friends.find((f) => f.id === bill.paidBy);
    if (!payer) return [];

    const debts: Debt[] = [];

    // Calculate each person's share
    friends.forEach((friend) => {
      if (friend.id === bill.paidBy) return; // Skip the payer

      const personTotal = bill.items.reduce((total, item) => {
        const allSplit = item.checkedNames.reduce(
          (sum, split) => sum + split.quantity,
          0,
        );
        const friendSplit = item.checkedNames.find(
          (split) => split.friendId === friend.id,
        );
        const friendParts = friendSplit?.quantity ?? 0;

        if (allSplit === 0) return total;
        return total + (item.price * item.quantity * friendParts) / allSplit;
      }, 0);

      if (personTotal > 0) {
        debts.push({
          from: friend.name,
          to: payer.name,
          amount: personTotal,
        });
      }
    });

    return debts;
  };

  // Calculate total debts across all bills
  const calculateTotalDebts = (): Debt[] => {
    const debtMap = new Map<string, number>();

    bills.forEach((bill) => {
      if (!bill.paidBy) return;

      const payer = friends.find((f) => f.id === bill.paidBy);
      if (!payer) return;

      friends.forEach((friend) => {
        if (friend.id === bill.paidBy) return;

        const personTotal = bill.items.reduce((total, item) => {
          const allSplit = item.checkedNames.reduce(
            (sum, split) => sum + split.quantity,
            0,
          );
          const friendSplit = item.checkedNames.find(
            (split) => split.friendId === friend.id,
          );
          const friendParts = friendSplit?.quantity ?? 0;

          if (allSplit === 0) return total;
          return total + (item.price * item.quantity * friendParts) / allSplit;
        }, 0);

        if (personTotal > 0) {
          const key = `${friend.name}→${payer.name}`;
          debtMap.set(key, (debtMap.get(key) || 0) + personTotal);
        }
      });
    });

    const debts: Debt[] = [];
    debtMap.forEach((amount, key) => {
      const [from, to] = key.split("→");
      debts.push({ from, to, amount });
    });

    return debts.sort((a, b) => b.amount - a.amount);
  };

  const totalDebts = calculateTotalDebts();
  const billsWithDebts = bills.filter((bill) => bill.paidBy && bill.items.length > 0);

  return (
    <div className="statistics-container">
      <div className="statistics-section">
        <h2>Payment Statistics</h2>

        {bills.length === 0 ? (
          <div className="empty-state">
            <p>No bills available. Create a bill to see statistics.</p>
          </div>
        ) : (
          <>
            {/* Total Summary */}
            <div className="total-summary-section">
              <h3>Total Debts Summary</h3>
              {totalDebts.length > 0 ? (
                <div className="debts-list">
                  {totalDebts.map((debt, index) => (
                    <div key={index} className="debt-item total-debt">
                      <div className="debt-info">
                        <span className="debt-from">{debt.from}</span>
                        <span className="debt-arrow">→</span>
                        <span className="debt-to">{debt.to}</span>
                      </div>
                      <span className="debt-amount">{debt.amount.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-debts-message">No debts to display.</p>
              )}
            </div>

            {/* Per-Bill Breakdown */}
            <div className="bills-breakdown-section">
              <h3>Bills Breakdown</h3>
              {billsWithDebts.length > 0 ? (
                <div className="bills-breakdown-list">
                  {billsWithDebts.map((bill) => {
                    const billDebts = calculateBillDebts(bill.id);
                    const payer = friends.find((f) => f.id === bill.paidBy);
                    const billTotal = bill.items.reduce(
                      (total, item) => total + item.price * item.quantity,
                      0,
                    );

                    return (
                      <div key={bill.id} className="bill-breakdown-card">
                        <div className="bill-breakdown-header">
                          <h4>{bill.title}</h4>
                          <div className="bill-breakdown-info">
                            <span className="bill-total">{billTotal.toFixed(2)} €</span>
                            {payer && (
                              <span className="bill-payer">Paid by: {payer.name}</span>
                            )}
                          </div>
                        </div>
                        {billDebts.length > 0 ? (
                          <div className="debts-list">
                            {billDebts.map((debt, index) => (
                              <div key={index} className="debt-item">
                                <div className="debt-info">
                                  <span className="debt-from">{debt.from}</span>
                                  <span className="debt-arrow">→</span>
                                  <span className="debt-to">{debt.to}</span>
                                </div>
                                <span className="debt-amount">
                                  {debt.amount.toFixed(2)} €
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-debts-message">
                            No debts for this bill.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-bills-message">
                  No bills with payment information available.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;
