import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export interface Friend {
  id: number;
  nick: string;
}

export interface Split {
  id: number;
  item_id: number;
  friend_id: number;
  quantity: number;
}

export interface Item {
  id: number;
  title: string;
  price: number;
  quantity: number;
  bill_id: number;
  split_id: number;
}

export interface Bill {
  id: number;
  title: string;
  paidBy: number | null;
}

export interface MoneyReturn {
  id: number;
  from_friend_it: number;
  to_friend_id: number;
  title: string;
  amount: number;
}

interface AppContextType {
  queryInProgress: boolean;
  bills: Bill[];
  currentBillId: number | null;
  currentBill: Bill | null;
  createBill: (title: string) => void;
  deleteBill: (billId: number) => void;
  selectBill: (billId: number) => void;
  updateBillTitle: (title: string) => void;

  friends: Friend[];
  addFriend: (name: string) => void;
  deleteFriend: (id: number) => void;

  items: Item[];
  addItem: (item: Omit<Item, "id" | "split_id">) => void;
  updateItem: (id: number, updates: Partial<Omit<Item, "id">>) => void;
  deleteItem: (id: number) => void;
  toggleNameInItem: (itemId: number, name: number) => void;
  title: string;
  paidBy: number | null;
  setTitle: (title: string) => void;
  updatePaidBy: (friendId: number | null) => void;
  moneyReturns: MoneyReturn[];
  addMoneyReturn: (moneyReturn: Omit<MoneyReturn, "id" | "createdAt">) => void;
  deleteMoneyReturn: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// const STORAGE_KEYS = {
//   FRIENDS: "bill-manager-friends",
//   BILLS: "bill-manager-bills",
//   CURRENT_BILL_ID: "bill-manager-current-bill-id",
//   MONEY_RETURNS: "bill-manager-money-returns",
// };

// const saveToLocalStorage = (key: string, value: any): void => {
//   try {
//     localStorage.setItem(key, JSON.stringify(value));
//   } catch (error) {
//     console.error(`Error saving ${key} to localStorage:`, error);
//   }
// };

const queryDatabase = async (api: string): Promise<unknown[]> => {
  try {
    const friends = await fetch(api);
    return await friends.json();
  } catch (_) {}
  return [];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [queryInProgress, setQueryInProgress] = useState<boolean>(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentBillId, setCurrentBillId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [moneyReturns, setMoneyReturns] = useState<MoneyReturn[]>([]);

  const initData = async () => {
    setFriends((await queryDatabase("/friends")) as Friend[]);
    const _bills = (await queryDatabase("/bills")) as Bill[];
    setBills(_bills);
    const currentBill = _bills[0] ? _bills[0].id : null;
    setCurrentBillId(currentBill);
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    const i = (await queryDatabase(`/items?bill_id=${currentBill}`)) as Item[];
    console.log("init ITEMS", i);
    setItems((await queryDatabase(`/items?bill_id=${currentBill}`)) as Item[]);
    setQueryInProgress(false);
  };

  const loadItems = async () => {
    console.log("currentBillId", currentBillId);
    const i = (await queryDatabase(
      `/items?bill_id=${currentBillId}`,
    )) as Item[];
    console.log("ITEMS", i);
    setItems(
      (await queryDatabase(`/items?bill_id=${currentBillId}`)) as Item[],
    );
  };

  useEffect(() => {
    initData();
  }, []);

  // Save friends to localStorage whenever they change
  useEffect(() => {
    // saveToLocalStorage(STORAGE_KEYS.FRIENDS, friends);
  }, [friends]);

  // Save bills to localStorage whenever they change
  useEffect(() => {
    // saveToLocalStorage(STORAGE_KEYS.BILLS, bills);
  }, [bills]);

  // Save current bill ID to localStorage whenever it changes
  useEffect(() => {
    // saveToLocalStorage(STORAGE_KEYS.CURRENT_BILL_ID, currentBillId);
    loadItems();
  }, [currentBillId]);

  // Save money returns to localStorage whenever they change
  useEffect(() => {
    // saveToLocalStorage(STORAGE_KEYS.MONEY_RETURNS, moneyReturns);
  }, [moneyReturns]);

  const currentBill = bills.find((b) => b.id === currentBillId) || null;
  // const names = friends || [];
  // const items = currentBill?.items || [];
  const title = currentBill?.title || "Items & Billing";
  const paidBy = currentBill?.paidBy || null;

  const createBill = (billTitle: string) => {
    const newBill: Bill = {
      id: -1,
      title: billTitle.trim() || "New Bill",
      paidBy: null,
    };
    setBills([...bills, newBill]);
    setCurrentBillId(newBill.id);
  };

  const deleteBill = (billId: number) => {
    setBills(bills.filter((b) => b.id !== billId));
    if (currentBillId === billId) {
      setCurrentBillId(bills.length > 1 ? bills[0].id : null);
    }
  };

  const selectBill = (billId: number) => {
    setCurrentBillId(billId);
  };

  const updateBillTitle = (newTitle: string) => {
    if (!currentBillId) return;
    setBills(
      bills.map((bill) =>
        bill.id === currentBillId ? { ...bill, title: newTitle } : bill,
      ),
    );
  };

  const setTitle = (newTitle: string) => {
    updateBillTitle(newTitle);
  };

  const addFriend = async (name: string) => {
    if (name.trim() === "") return;
    setQueryInProgress(true);

    await queryDatabase(`/friends?cmd=add&nick=${name}`);
    setFriends((await queryDatabase("/friends")) as Friend[]);
    setQueryInProgress(false);
  };

  const deleteFriend = async (friendId: number) => {
    setQueryInProgress(true);
    queryDatabase(`/friends?cmd=del&id=${friendId}`);
    setFriends((await queryDatabase("/friends")) as Friend[]);
    setBills((await queryDatabase("/bills")) as Bill[]);
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    setQueryInProgress(false);
  };

  const addItem = (item: Omit<Item, "id" | "split_id">) => {
    // TODO
    // const newItem: Item = {
    //   ...item,
    //   id: Date.now().toString(),
    // };
    // // If no bill exists or no bill is selected, create a default bill
    // if (!currentBillId || bills.length === 0) {
    //   const newBill: Bill = {
    //     id: Date.now().toString(),
    //     title: "My Bill",
    //     paidBy: "",
    //     items: [newItem],
    //     createdAt: Date.now(),
    //   };
    //   setBills([...bills, newBill]);
    //   setCurrentBillId(newBill.id);
    //   return;
    // }
    // setBills(
    //   bills.map((bill) =>
    //     bill.id === currentBillId
    //       ? { ...bill, items: [...bill.items, newItem] }
    //       : bill,
    //   ),
    // );
  };

  const updateItem = (
    id: number,
    updates: Partial<Omit<Item, "id" | "split_id">>,
  ) => {
    // TODO
    // if (!currentBillId) return;
    // setBills(
    //   bills.map((bill) =>
    //     bill.id === currentBillId
    //       ? {
    //           ...bill,
    //           items: bill.items.map((item) =>
    //             item.id === id ? { ...item, ...updates } : item,
    //           ),
    //         }
    //       : bill,
    //   ),
    // );
  };

  const deleteItem = (id: number) => {
    // TODO
    // if (!currentBillId) return;
    // setBills(
    //   bills.map((bill) =>
    //     bill.id === currentBillId
    //       ? { ...bill, items: bill.items.filter((item) => item.id !== id) }
    //       : bill,
    //   ),
    // );
  };

  const toggleNameInItem = (itemId: number, friendId: number) => {
    // TODO
    // if (!currentBillId) return;
    // setBills(
    //   bills.map((bill) =>
    //     bill.id === currentBillId
    //       ? {
    //           ...bill,
    //           items: bill.items.map((item) => {
    //             if (item.id === itemId) {
    //               if (
    //                 !item.checkedNames.find(
    //                   (split) => split.friendId === friendId,
    //                 )
    //               ) {
    //                 item.checkedNames.push({ friendId: friendId, quantity: 0 });
    //               }
    //             }
    //             return item.id === itemId
    //               ? {
    //                   ...item,
    //                   checkedNames: item.checkedNames.map((split) =>
    //                     split.friendId === friendId
    //                       ? {
    //                           ...split,
    //                           quantity:
    //                             (split.quantity + 1) % (item.quantity + 1),
    //                         }
    //                       : split,
    //                   ),
    //                 }
    //               : item;
    //           }),
    //         }
    //       : bill,
    //   ),
    // );
  };

  // const toggleNameInItem = (itemId: string, friendId: string) => {
  //   if (!currentBillId) return;
  //   console.log("TOGGLE", itemId, friendId);
  //   setBills(
  //     bills.map((bill) =>
  //       bill.id === currentBillId
  //         ? {
  //             ...bill,
  //             items: bill.items.map((item) =>
  //               item.id === itemId
  //                 ? {
  //                     ...item,
  //                     checkedNames: item.checkedNames.map((split) =>
  //                       split.friendId === friendId
  //                         ? {
  //                             ...split,
  //                             quantity: (split.quantity + 1) % item.quantity,
  //                           }
  //                         : split,
  //                     ),
  //                   }
  //                 : item,
  //             ),
  //           }
  //         : bill,
  //     ),
  //   );
  // };

  const updatePaidBy = (friendId: number | null) => {
    // TODO
    // setBills(
    //   bills.map((bill) =>
    //     bill.id === currentBillId ? { ...bill, paidBy: friendId } : bill,
    //   ),
    // );
  };

  const addMoneyReturn = (
    moneyReturn: Omit<MoneyReturn, "id" | "createdAt">,
  ) => {
    // TODO
    // const newMoneyReturn: MoneyReturn = {
    //   ...moneyReturn,
    //   id: Date.now().toString(),
    //   createdAt: Date.now(),
    // };
    // setMoneyReturns([...moneyReturns, newMoneyReturn]);
  };

  const deleteMoneyReturn = (id: number) => {
    // TODO
    // setMoneyReturns(moneyReturns.filter((mr) => mr.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        queryInProgress,
        bills,
        currentBillId,
        currentBill,
        createBill,
        deleteBill,
        selectBill,
        updateBillTitle,
        friends,
        addFriend,
        deleteFriend,
        items,
        addItem,
        updateItem,
        deleteItem,
        toggleNameInItem,
        title,
        paidBy,
        setTitle,
        updatePaidBy,
        moneyReturns,
        addMoneyReturn,
        deleteMoneyReturn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
