import React from "react";
import { Friend, Group, useAppContext } from "../context/AppContext";
import "./Statistics.css";
import Calculator, { TotalSpend } from "../utils/calculator";
import { OnNavigate } from "../App";

interface Debt {
  from: string;
  fromId: number;
  to: string | null;
  toId: number | null;
  amount: number;
}

function Statistics(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { currency, friends, groups, bills, items, splits, moneyReturns } =
    useAppContext();

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
          fromId: friend.id,
          to: payer.nick,
          toId: payer.id,
          amount: personTotal,
        });
      }
    });

    return debts;
  };

  const getBalansedDebts = (): Debt[] => {
    const calc = new Calculator(
      bills,
      items,
      friends,
      groups,
      splits,
      moneyReturns,
    );
    const total = calc.getTotalSpend();
    // add returns to spends in order to deduct them automatically
    moneyReturns.forEach((moneyReturn) => {
      total.push({
        from: moneyReturn.to_friend_id,
        to: moneyReturn.from_friend_id,
        amount: moneyReturn.amount,
      });
    });
    const aggregatedDebts = calc.aggregateDebts(total);
    const balancedDebts = calc.balanceDebts(aggregatedDebts);

    const spendIds: TotalSpend[] = [];

    balancedDebts.forEach((value, from) => {
      value.forEach((amount, to) => {
        spendIds.push({ from, to, amount });
      });
    });

    const idToNick = (friend_id: number | null) => {
      if (friend_id === null) return null;

      const friend = friends.find((friend) => friend.id == friend_id);
      if (!friend) return null;
      return friend.nick;
    };

    const spendNicks: Debt[] = spendIds.map((spend) => ({
      from: idToNick(spend.from) ?? "???",
      fromId: spend.from,
      to: idToNick(spend.to),
      toId: spend.to,
      amount: spend.amount,
    }));

    return spendNicks;
  };

  const GROUP_OFFSET = 100000;
  const getGroupDebts = (): Debt[] => {
    const calc = new Calculator(
      bills,
      items,
      friends,
      groups,
      splits,
      moneyReturns,
    );
    const total = calc.getTotalSpend();
    // add returns to spends in order to deduct them automatically
    moneyReturns.forEach((moneyReturn) => {
      total.push({
        from: moneyReturn.to_friend_id,
        to: moneyReturn.from_friend_id,
        amount: moneyReturn.amount,
      });
    });

    const friendToGroup = (friend_id: number | null) => {
      if (friend_id === null) return null;

      const friend: Friend | undefined = friends.find(
        (friend) => friend.id == friend_id,
      );
      if (!friend) return null;
      if (friend.group_id === null) return friend.id;
      return Number(friend.group_id) + GROUP_OFFSET;
    };

    const groupTotal: TotalSpend[] = total.map((debt) => ({
      from: friendToGroup(debt.from)!,
      to: friendToGroup(debt.to),
      amount: debt.amount,
    }));

    const aggregatedDebts = calc.aggregateDebts(groupTotal);
    const balancedDebts = calc.balanceDebts(aggregatedDebts);

    const spendIds: TotalSpend[] = [];

    balancedDebts.forEach((value, from) => {
      value.forEach((amount, to) => {
        spendIds.push({ from, to, amount });
      });
    });

    const idToName = (id: number | null) => {
      if (id === null) return null;
      const record: Group | Friend | undefined =
        id > GROUP_OFFSET
          ? groups.find((group) => group.id === id - GROUP_OFFSET)
          : friends.find((friend) => friend.id == id);

      if (!record) return null;

      return "surname" in record ? record.surname : record.nick;
    };

    const spendNicks: Debt[] = spendIds.map((spend) => ({
      from: idToName(spend.from) ?? "???",
      fromId: spend.from,
      to: idToName(spend.to),
      toId: spend.to,
      amount: spend.amount,
    }));

    return spendNicks;
  };

  const balansedDebts = getBalansedDebts();
  const groupDebts = getGroupDebts();
  const billsWithDebts = bills.filter(
    (bill) =>
      bill.paid_by &&
      items.reduce(
        (total, item) => (item.bill_id === bill.id ? total + 1 : total),
        0,
      ) > 0,
  );

  const handlePaidOff = (
    from: number | null,
    to: number | null,
    amount: number,
  ) => {
    props.onNavigate("add-return", {
      addReturn: { title: "Debt repayment", from, to, amount },
    });
  };

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
            <div className="total-summary-section">
              <h3>Total Debts by Tribes</h3>
              {groupDebts.length > 0 ? (
                <div className="debts-list">
                  {groupDebts.map((debt, index) => (
                    <div key={index} className="debt-item total-debt">
                      <div className="debt-info">
                        <span className="debt-from">{debt.from}</span>
                        <span className="debt-arrow">→</span>
                        {debt.to && <span className="debt-to">{debt.to}</span>}
                        {!debt.to && (
                          <span className="debt-to unknown">UNKNOWN</span>
                        )}
                      </div>
                      <span className="debt-amount">
                        {debt.amount.toFixed(2)} {currency}
                      </span>
                      {debt.to !== null && (
                        <button
                          onClick={() =>
                            handlePaidOff(
                              debt.fromId >= GROUP_OFFSET ? null : debt.fromId,
                              debt.toId && debt.toId >= GROUP_OFFSET
                                ? null
                                : debt.toId,
                              debt.amount,
                            )
                          }
                          className="paid_off"
                        >
                          Paid off
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-debts-message">No debts.</p>
              )}
            </div>

            <div className="total-summary-section">
              <h3>Total Debts by Individuals</h3>
              {balansedDebts.length > 0 ? (
                <div className="debts-list">
                  {balansedDebts.map((debt, index) => (
                    <div key={index} className="debt-item total-debt">
                      <div className="debt-info">
                        <span className="debt-from">{debt.from}</span>
                        <span className="debt-arrow">→</span>
                        {debt.to && <span className="debt-to">{debt.to}</span>}
                        {!debt.to && (
                          <span className="debt-to unknown">UNKNOWN</span>
                        )}
                      </div>
                      <span className="debt-amount">
                        {debt.amount.toFixed(2)} {currency}
                      </span>
                      {debt.to !== null && (
                        <button
                          onClick={() =>
                            handlePaidOff(debt.fromId, debt.toId, debt.amount)
                          }
                          className="paid_off"
                        >
                          Paid off
                        </button>
                      )}
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
                              {billTotal.toFixed(2)} {currency}
                            </span>
                            {payer && (
                              <span className="bill-payer">
                                Paid by: <strong>{payer.nick}</strong>
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
                                  {debt.amount.toFixed(2)} {currency}
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
