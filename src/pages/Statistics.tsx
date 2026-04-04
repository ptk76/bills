import React from "react";
import { useAppContext } from "../context/AppContext";
import "./Statistics.css";

interface Debt {
  from: string;
  to: string;
  amount: number;
}

function Statistics(): React.JSX.Element {
  const { friends, bills, items, splits, moneyReturns } = useAppContext();

  // Calculate how much each person owes for a specific bill
  const calculateBillDebts = (billId: number): Debt[] => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || !bill.paid_by) return [];

    const payer = friends.find((f) => f.id === bill.paid_by);
    if (!payer) return [];

    const debts: Debt[] = [];

    // Calculate each person's share
    friends.forEach((friend) => {
      if (friend.id === bill.paid_by) return; // Skip the payer

      const personTotal = items.reduce((total, item) => {
        if (item.bill_id !== billId) return total;

        const allSplit = splits.reduce(
          (sum, split) =>
            split.item_id === item.id ? sum + split.quantity : sum,
          0,
        );
        if (allSplit === 0) return total;

        const friendSplit = splits.find(
          (split) => split.friend_id === friend.id && split.item_id === item.id,
        );
        const friendParts = friendSplit?.quantity ?? 0;

        return total + (item.price * item.quantity * friendParts) / allSplit;
      }, 0);

      if (personTotal > 0) {
        debts.push({
          from: friend.nick,
          to: payer.nick,
          amount: personTotal,
        });
      }
    });

    return debts;
  };

  // Calculate total debts across all bills with netting
  const calculateTotalDebts = (): Debt[] => {
    // First, collect all debts in a map: person1 -> person2 -> amount
    const debtMatrix = new Map<string, Map<string, number>>();

    bills.forEach((bill) => {
      if (!bill.paid_by) return;

      const payer = friends.find((f) => f.id === bill.paid_by);
      if (!payer) return;

      friends.forEach((friend) => {
        if (friend.id === bill.paid_by) return;

        const personTotal = items.reduce((total, item) => {
          if (item.bill_id !== bill.id) return total;
          const allSplit = splits.reduce(
            (sum, split) =>
              split.item_id === item.id ? sum + split.quantity : sum,
            0,
          );
          if (allSplit === 0) return total;
          const friendSplit = splits.find(
            (split) =>
              split.friend_id === friend.id && split.item_id === item.id,
          );
          const friendParts = friendSplit?.quantity ?? 0;

          return total + (item.price * item.quantity * friendParts) / allSplit;
        }, 0);

        if (personTotal > 0) {
          // friend owes payer
          if (!debtMatrix.has(friend.nick)) {
            debtMatrix.set(friend.nick, new Map());
          }
          const friendDebts = debtMatrix.get(friend.nick)!;
          friendDebts.set(
            payer.nick,
            (friendDebts.get(payer.nick) || 0) + personTotal,
          );
        }
      });
    });

    // Now process money returns to reduce debts
    moneyReturns.forEach((moneyReturn) => {
      const fromFriend = friends.find(
        (f) => f.id === moneyReturn.from_friend_id,
      );
      const toFriend = friends.find((f) => f.id === moneyReturn.to_friend_id);

      if (!fromFriend || !toFriend) return;

      // Money return means fromFriend paid back toFriend
      // This reduces what fromFriend owes toFriend
      if (!debtMatrix.has(fromFriend.nick)) {
        debtMatrix.set(fromFriend.nick, new Map());
      }
      const fromDebts = debtMatrix.get(fromFriend.nick)!;
      const currentDebt = fromDebts.get(toFriend.nick) || 0;
      fromDebts.set(toFriend.nick, currentDebt - moneyReturn.amount);
    });

    // Now calculate net debts
    const netDebts: Debt[] = [];
    const processedPairs = new Set<string>();

    debtMatrix.forEach((owedTo, person1) => {
      owedTo.forEach((amount1, person2) => {
        const pairKey = [person1, person2].sort().join("-");
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        // Check if person2 also owes person1
        const reverseAmount = debtMatrix.get(person2)?.get(person1) || 0;

        // Calculate net debt
        const netAmount = amount1 - reverseAmount;

        if (Math.abs(netAmount) > 0.01) {
          // Use small threshold to avoid floating point issues
          if (netAmount > 0) {
            // person1 owes person2
            netDebts.push({ from: person1, to: person2, amount: netAmount });
          } else {
            // person2 owes person1
            netDebts.push({ from: person2, to: person1, amount: -netAmount });
          }
        }
      });
    });

    return netDebts.sort((a, b) => b.amount - a.amount);
  };

  const totalDebts = calculateTotalDebts();
  const billsWithDebts = bills.filter(
    (bill) =>
      bill.paid_by &&
      items.reduce(
        (total, item) => (item.bill_id === bill.id ? total + 1 : total),
        0,
      ) > 0,
  );

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
                      <span className="debt-amount">
                        {debt.amount.toFixed(2)} €
                      </span>
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
                    const payer = friends.find((f) => f.id === bill.paid_by);
                    const billTotal = items.reduce(
                      (total, item) =>
                        item.bill_id === bill.id
                          ? total + item.price * item.quantity
                          : total,
                      0,
                    );

                    return (
                      <div key={bill.id} className="bill-breakdown-card">
                        <div className="bill-breakdown-header">
                          <h4>{bill.title}</h4>
                          <div className="bill-breakdown-info">
                            <span className="bill-total">
                              {billTotal.toFixed(2)} €
                            </span>
                            {payer && (
                              <span className="bill-payer">
                                Paid by: {payer.nick}
                              </span>
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
