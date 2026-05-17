import {
  Bill,
  Friend,
  Group,
  Item,
  MoneyReturn,
  Split,
} from "../context/AppContext";

export type Debt = {
  from: number;
  to: number | null;
  amount: number;
  currency: string | null;
};

class Calculator {
  constructor(
    private bills: Bill[],
    private items: Item[],
    private friends: Friend[],
    private groups: Group[],
    private splits: Split[],
    private moneyReturns: MoneyReturn[],
  ) {}

  public getTotalSplit(item_id: number) {
    return this.splits.reduce(
      (total, split) =>
        total + (split.item_id === item_id ? split.quantity : 0),
      0,
    );
  }

  public getPersonSplit(item_id: number, friend_id: number) {
    return this.splits.reduce(
      (total, split) =>
        total +
        (split.item_id === item_id && split.friend_id === friend_id
          ? split.quantity
          : 0),
      0,
    );
  }

  public getPersonItemSpend(item_id: number, friend_id: number) {
    const item = this.items.find((item) => item.id === item_id);
    if (!item) return 0;

    const totalSplit = this.getTotalSplit(item_id);
    if (totalSplit === 0) return 0;

    const personSplit = this.getPersonSplit(item_id, friend_id);

    return (item.price * item.quantity * personSplit) / totalSplit;
  }

  public getPersonBillSpend(bill_id: number, friend_id: number) {
    return this.items.reduce(
      (total, item) =>
        total +
        (item.bill_id === bill_id
          ? this.getPersonItemSpend(item.id, friend_id)
          : 0),
      0,
    );
  }

  public getPersonTotalSpend(friend_id: number): Debt[] {
    const totalSpends: Debt[] = this.bills.map((bill) => ({
      from: friend_id,
      to: bill.paid_by,
      amount: this.getPersonBillSpend(bill.id, friend_id),
      currency: bill.currency,
    }));
    return totalSpends;
  }

  public getTotalSpend(): Debt[] {
    const totalSpends: Debt[] = [];

    this.friends.forEach((friend) => {
      totalSpends.push(...this.getPersonTotalSpend(friend.id));
    });
    return totalSpends;
  }

  public clearData(data: Debt[]) {
    return data.filter((d) => d.from !== d.to && d.amount !== 0);
  }

  private debtMatrixToDebts = (matrix: Debt3D) => {
    const debts: Debt[] = [];

    matrix.iterate((debt) => debts.push(debt));
    return debts;
  };

  public aggregateDebts(debts: Debt[]) {
    const debtMatrix = new Debt3D([]);

    debts.forEach((debt) => {
      if (debtMatrix.exists(debt)) {
        debtMatrix.update(debt);
      } else {
        debtMatrix.add(debt);
      }
    });

    return this.debtMatrixToDebts(debtMatrix);
  }

  public balanceDebts(debts: Debt[]) {
    const debtMatrix = new Debt3D(debts);

    const bDebts: Debt[] = [];
    debtMatrix.iterate((debt) => {
      if (debt.to === null) {
        bDebts.push(debt);
        return;
      }

      const oppositeAmount = debtMatrix.getAmount(
        debt.to,
        debt.from,
        debt.currency,
      );
      if (oppositeAmount === null) {
        bDebts.push(debt);
      } else if (debt.amount > oppositeAmount) {
        const balance = debt.amount - oppositeAmount;
        // balance in range <0, 0.005) is ignored
        // balance < 0 will be/was balanced in opposite comparison "balance > 0.005"
        if (balance >= 0.005)
          bDebts.push({
            from: debt.from,
            to: debt.to,
            currency: debt.currency,
            amount: debt.amount - oppositeAmount,
          });
      } else {
      }
    });
    return bDebts;
  }
}

type CurrencyAmount = Map<string | null, number>;
type ToDebt = Map<number | null, CurrencyAmount>;
type DebtMatrix = Map<number, ToDebt>;

class Debt3D {
  private matrix: DebtMatrix = new Map();
  constructor(debts: Debt[]) {
    debts.forEach((debt) => {
      if (this.exists(debt)) {
        this.update(debt);
      } else {
        this.add(debt);
      }
    });
  }

  exists = (debt: Debt) => {
    const from = this.matrix.get(debt.from);
    if (from) {
      const to = from.get(debt.to);
      if (to) {
        const amount = to.get(debt.currency);
        if (amount !== undefined) return true;
      }
    }
    return false;
  };

  add(debt: Debt) {
    const to = this.matrix.get(debt.from) ?? new Map<number, CurrencyAmount>();
    const currency = to.get(debt.to) ?? new Map<string | null, number>();
    const amount = currency.has(debt.currency)
      ? currency.get(debt.currency)!
      : debt.amount;

    currency.set(debt.currency, amount);
    to.set(debt.to, currency);
    this.matrix.set(debt.from, to);
  }

  update(debt: Debt) {
    const tos = this.matrix.get(debt.from);
    if (!tos) return;
    const currencies = tos.get(debt.to);
    if (!currencies) return;
    const existingAmount = currencies.get(debt.currency);
    if (existingAmount === undefined) return;
    currencies.set(debt.currency, existingAmount + debt.amount);
  }

  getAmount(from: number, to: number | null, currency: string | null) {
    if (this.matrix.has(from)) {
      const tos = this.matrix.get(from);
      if (tos) {
        const currencies = tos.get(to);
        if (currencies) {
          const amount = currencies.get(currency);
          if (amount) return amount;
        }
      }
    }
    return null;
  }

  iterate(fn: (debt: Debt) => void) {
    this.matrix.forEach((tos, from) => {
      tos.forEach((currencies, to) => {
        currencies.forEach((amount, currency) => {
          fn({ from, to, currency, amount });
        });
      });
    });
  }
}

export default Calculator;
