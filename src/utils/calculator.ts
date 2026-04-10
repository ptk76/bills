import {
  Bill,
  Friend,
  Group,
  Item,
  MoneyReturn,
  Split,
} from "../context/AppContext";

export type TotalSpend = {
  from: number;
  to: number | null;
  amount: number;
};

export type MatrixSpends = Map<number, Map<number | null, number>>;

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

  public getPersonTotalSpend(friend_id: number): TotalSpend[] {
    const totalSpends: TotalSpend[] = this.bills.map((bill) => ({
      from: friend_id,
      to: bill.paid_by,
      amount: this.getPersonBillSpend(bill.id, friend_id),
    }));
    return totalSpends;
  }

  public getTotalSpend(): TotalSpend[] {
    const totalSpends: TotalSpend[] = [];

    this.friends.forEach((friend) => {
      totalSpends.push(...this.getPersonTotalSpend(friend.id));
    });
    return totalSpends;
  }

  public aggregateDebts(spends: TotalSpend[]) {
    const filteredSpends = spends.filter(
      (spend) => spend.amount !== 0 && spend.from !== spend.to,
    );
    const spendMatrix: MatrixSpends = new Map();

    filteredSpends.forEach((spend) => {
      const from = spendMatrix.get(spend.from);

      if (from) {
        const amount = from.get(spend.to);
        if (amount === undefined) {
          from.set(spend.to, spend.amount);
        } else {
          from.set(spend.to, amount + spend.amount);
        }
      } else {
        spendMatrix.set(spend.from, new Map([[spend.to, spend.amount]]));
      }
    });

    return spendMatrix;
  }

  public balanceDebts(spends: MatrixSpends) {
    const balancedDebts: MatrixSpends = new Map();

    const addDebt = (from: number, to: number | null, amount: number) => {
      const isFrom = balancedDebts.get(from);
      if (isFrom) isFrom.set(to, amount);
      else balancedDebts.set(from, new Map([[to, amount]]));
    };

    spends.forEach((value, from) => {
      value.forEach((amount, to) => {
        if (to == null) {
          addDebt(from, null, amount);
          return;
        }

        const toDebts = spends.get(to);
        if (!toDebts) {
          addDebt(from, to, amount);
          return;
        }

        const toFromAmount = toDebts.get(from);
        if (toFromAmount === undefined) {
          addDebt(from, to, amount);
          return;
        }

        const balance = amount - toFromAmount;
        if (balance > 0) {
          addDebt(from, to, balance);
        }
        // balance === 0 is ignored
        // balance < 0 will be/was balanced in balance > 0
      });
    });
    return balancedDebts;
  }
}

export default Calculator;
