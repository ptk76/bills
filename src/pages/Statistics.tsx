import React from "react";
import { Friend, Group, useAppContext } from "../context/AppContext";
import "./Statistics.css";
import Calculator, { Debt } from "../utils/calculator";
import { OnNavigate } from "../App";
import { areBillsValid, isBillValid } from "../utils/validator";
import Warning from "../widgets/Warning";
import Currency from "../widgets/Currency";
import { useT } from "../i18n/I18nContext";
import MoneyReturns from "./MoneyReturns";
import ItemDiv from "../widgets/ItemDiv";

interface DebtNicks {
  from: string;
  fromId: number;
  to: string | null;
  toId: number | null;
  amount: number;
  currency: string | null;
}

function Statistics(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { friends, groups, bills, items, splits, moneyReturns } =
    useAppContext();
  const t = useT();

  // Calculate how much each person owes for a specific bill
  const calculateBillDebts = (billId: number): DebtNicks[] => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || !bill.paid_by) return [];

    const payer = friends.find((f) => f.id === bill.paid_by);
    if (!payer) return [];

    const debts: DebtNicks[] = [];

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
          currency: bill.currency,
        });
      }
    });

    return debts;
  };

  const GROUP_OFFSET = 100000;
  const getGroupDebts = (): DebtNicks[] => {
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
        currency: moneyReturn.currency,
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

    const groupTotal: Debt[] = total.map((debt) => ({
      from: friendToGroup(debt.from)!,
      to: friendToGroup(debt.to),
      amount: debt.amount,
      currency: debt.currency,
    }));

    const aggregatedDebts = calc.aggregateDebts(groupTotal);
    const balancedDebts = calc.balanceDebts(aggregatedDebts);

    const idToName = (id: number | null) => {
      if (id === null) return null;
      const record: Group | Friend | undefined =
        id > GROUP_OFFSET
          ? groups.find((group) => group.id === id - GROUP_OFFSET)
          : friends.find((friend) => friend.id == id);

      if (!record) return null;

      return "surname" in record ? record.surname : record.nick;
    };

    const spendNicks: DebtNicks[] = calc
      .clearData(balancedDebts)
      .map((spend) => ({
        from: idToName(spend.from) ?? "???",
        fromId: spend.from,
        to: idToName(spend.to),
        toId: spend.to,
        amount: spend.amount,
        currency: spend.currency,
      }));

    return spendNicks;
  };

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
    currency: string | null,
    amount: number,
  ) => {
    props.onNavigate("add-return", {
      addReturn: {
        title: t("stats.debtRepayment"),
        from,
        to,
        currency,
        amount,
      },
    });
  };

  const handleWarning = (billId: number) => {
    props.onNavigate("bill", {
      bill: { id: billId },
    });
  };

  return (
    <div className="statistics-container">
      <div className="statistics-section">
        <div className="header">
          {!areBillsValid(bills, items, splits) && (
            <div className="warning" onClick={() => props.onNavigate("home")}>
              <Warning />
            </div>
          )}
          <h2>{t("stats.title")}</h2>
        </div>

        {bills.length === 0 ? (
          <div className="empty-state">
            <p>{t("stats.noBills")}</p>
          </div>
        ) : (
          <>
            <h3>{t("stats.byTribes")}</h3>
            {groupDebts.length > 0 ? (
              <>
                {groupDebts.map((debt, index) => (
                  <ItemDiv
                    id={index}
                    onClick={() => {}}
                    warning={!!!debt.to}
                    currency={debt.currency}
                    amount={debt.amount}
                    title={debt.from}
                    subtitle={"→ " + (debt.to ?? t("stats.unknown"))}
                    onButtonClick={() =>
                      handlePaidOff(
                        debt.fromId >= GROUP_OFFSET ? null : debt.fromId,
                        debt.toId && debt.toId >= GROUP_OFFSET
                          ? null
                          : debt.toId,
                        debt.currency,
                        debt.amount,
                      )
                    }
                    buttonTitle={t("stats.payOff")}
                  />
                ))}
              </>
            ) : (
              <p className="no-debts-message">{t("stats.noDebts")}</p>
            )}

            <MoneyReturns onNavigate={props.onNavigate} />
            {/* Per-Bill Breakdown */}
            <h3>{t("stats.breakdown")}</h3>
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
                        {!isBillValid(bill, items, splits) && (
                          <div
                            className="warning"
                            onClick={() => handleWarning(bill.id)}
                          >
                            <Warning />
                          </div>
                        )}
                        <h4>{bill.title}</h4>
                        {payer && (
                          <span className="bill-payer">
                            {t("common.paidBy")} <strong>{payer.nick}</strong>
                          </span>
                        )}
                        <span className="bill-total">
                          <Currency
                            currency={bill.currency}
                            amount={billTotal}
                          />
                        </span>
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
                                <Currency
                                  currency={debt.currency}
                                  amount={debt.amount}
                                />
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-debts-message">
                          {t("stats.noDebtsForBill")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-bills-message">
                {t("stats.noBillsWithPayment")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;
