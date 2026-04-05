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
}

export interface Bill {
  id: number;
  title: string;
  token: string;
  paid_by: number | null;
}

export interface MoneyReturn {
  id: number;
  from_friend_id: number;
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
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: number, updates: Partial<Omit<Item, "id">>) => void;
  deleteItem: (id: number) => void;

  splits: Split[];
  toggleNameInItem: (itemId: number, name: number) => void;

  title: string;
  paidBy: number | null;
  setTitle: (title: string) => void;
  updatePaidBy: (friendId: number | null) => void;
  moneyReturns: MoneyReturn[];
  addMoneyReturn: (moneyReturn: Omit<MoneyReturn, "id">) => void;
  deleteMoneyReturn: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const queryDatabase = async (api: string): Promise<unknown[]> => {
  try {
    const friends = await fetch(api);
    return await friends.json();
  } catch (_) {}
  return [];
};

export const AppProvider: React.FC<{ children: ReactNode; token: string }> = ({
  children,
  token,
}) => {
  const [queryInProgress, setQueryInProgress] = useState<boolean>(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [currentBillId, setCurrentBillId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [moneyReturns, setMoneyReturns] = useState<MoneyReturn[]>([]);

  const initData = async () => {
    setFriends((await queryDatabase("/friends")) as Friend[]);
    const _bills = (await queryDatabase(`/bills?token=${token}`)) as Bill[];
    setBills(_bills);
    const currentBill = _bills[0] ? _bills[0].id : null;
    setCurrentBillId(currentBill);
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    // const i = (await queryDatabase(`/items?bill_id=${currentBill}`)) as Item[];
    const i = (await queryDatabase(`/items`)) as Item[];
    setItems((await queryDatabase(`/items?bill_id=${currentBill}`)) as Item[]);
    setSplits((await queryDatabase("/splits")) as Split[]);
    setQueryInProgress(false);
  };

  const loadItems = async () => {
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
  const title = currentBill?.title || "Items & Billing";
  const paidBy = currentBill?.paid_by || null;

  const createBill = async (billTitle: string) => {
    setQueryInProgress(true);
    const title = billTitle.trim() || "New Bill";
    await queryDatabase(`/bills?cmd=add&title=${title}&token=${token}`);
    const _bills = (await queryDatabase(`/bills?token=${token}`)) as Bill[];
    setBills(_bills);
    const currentBill = _bills[0] ? _bills[0].id : null;
    setCurrentBillId(currentBill);

    setQueryInProgress(false);
  };

  const deleteBill = async (billId: number) => {
    setQueryInProgress(true);
    await queryDatabase(`/bills?cmd=del&id=${billId}`);
    const _bills = (await queryDatabase(`/bills?token=${token}`)) as Bill[];
    setBills(_bills);
    const currentBill = _bills[0] ? _bills[0].id : null;
    setCurrentBillId(currentBill);
    setQueryInProgress(false);
  };

  const selectBill = (billId: number) => {
    setCurrentBillId(billId);
  };

  const updateBillTitle = async (newTitle: string) => {
    if (!currentBillId) return;
    setQueryInProgress(true);
    await queryDatabase(`/bills?id=${currentBillId}&cmd=upd&title=${newTitle}`);
    setBills((await queryDatabase(`/bills?token=${token}`)) as Bill[]);
    setQueryInProgress(false);
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
    setBills((await queryDatabase(`/bills?token=${token}`)) as Bill[]);
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    setQueryInProgress(false);
  };

  type Tables = "friends" | "items" | "bills" | "splits" | "returns";

  type QueryParams = {
    id?: number;
    cmd?: "add" | "del" | "upd";
    title?: string;
    price?: number;
    quantity?: number;
    bill_id?: number;
    item_id?: number;
    friend_id?: number;
  };

  const createQueryUrl = (table: Tables, parameters?: QueryParams) => {
    if (!parameters) return `/${table}`;
    const params = [];
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined) params.push(`${key}=${value}`);
    }
    return `/${table}?${params.join("&")}`;
  };

  const refreshItems = async () => {
    if (!currentBillId) return;
    setItems(
      (await queryDatabase(
        createQueryUrl("items", {
          bill_id: currentBillId,
        }),
      )) as Item[],
    );
  };

  const addItem = async (item: Omit<Item, "id">) => {
    setQueryInProgress(true);

    await queryDatabase(
      createQueryUrl("items", {
        cmd: "add",
        ...item,
      }),
    );
    await refreshItems();

    setQueryInProgress(false);
  };

  const updateItem = async (
    id: number,
    updates: Partial<Omit<Item, "id" | "bill_id">>,
  ) => {
    setQueryInProgress(true);

    await queryDatabase(
      createQueryUrl("items", {
        cmd: "upd",
        id: id,
        ...updates,
      }),
    );
    await refreshItems();

    setQueryInProgress(false);
  };

  const deleteItem = async (id: number) => {
    setQueryInProgress(true);

    await queryDatabase(
      createQueryUrl("items", {
        cmd: "del",
        id: id,
      }),
    );
    await refreshItems();

    setQueryInProgress(false);
  };

  const refreshSplits = async () => {
    setSplits((await queryDatabase(createQueryUrl("splits"))) as Split[]);
  };

  const toggleNameInItem = async (itemId: number, friendId: number) => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    const split = splits.find(
      (split) => split.friend_id === friendId && split.item_id === itemId,
    );
    const quantity = split ? (split.quantity + 1) % (item.quantity + 1) : 1;

    setQueryInProgress(true);

    await queryDatabase(
      createQueryUrl("splits", {
        item_id: itemId,
        friend_id: friendId,
        quantity: quantity,
      }),
    );
    await refreshSplits();

    setQueryInProgress(false);
  };

  const updatePaidBy = async (friendId: number | null) => {
    setQueryInProgress(true);
    await queryDatabase(
      `/bills?id=${currentBillId}&cmd=upd&paid_by=${friendId}`,
    );
    setBills((await queryDatabase(`/bills?token=${token}`)) as Bill[]);
    setQueryInProgress(false);
  };

  const addMoneyReturn = async (
    moneyReturn: Omit<MoneyReturn, "id" | "createdAt">,
  ) => {
    setQueryInProgress(true);
    await queryDatabase(
      `/returns?cmd=add&from_friend_id=${moneyReturn.from_friend_id}&to_friend_id=${moneyReturn.to_friend_id}&amount=${moneyReturn.amount}&title=${moneyReturn.title}`,
    );
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    setQueryInProgress(false);
  };

  const deleteMoneyReturn = async (id: number) => {
    setQueryInProgress(true);
    await queryDatabase(`/returns?cmd=del&id=${id}`);
    setMoneyReturns((await queryDatabase("/returns")) as MoneyReturn[]);
    setQueryInProgress(false);
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
        splits,
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
