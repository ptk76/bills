import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export interface Friend {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  checkedNames: string[];
}

export interface Bill {
  id: string;
  title: string;
  paidBy: string | null;
  items: Item[];
  createdAt: number;
}

interface AppContextType {
  bills: Bill[];
  currentBillId: string | null;
  currentBill: Bill | null;
  createBill: (title: string) => void;
  deleteBill: (billId: string) => void;
  selectBill: (billId: string) => void;
  updateBillTitle: (title: string) => void;
  friends: Friend[];
  addFriend: (name: string) => void;
  deleteFriend: (id: string) => void;
  items: Item[];
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, updates: Partial<Omit<Item, "id">>) => void;
  deleteItem: (id: string) => void;
  toggleNameInItem: (itemId: string, name: string) => void;
  title: string;
  paidBy: string | null;
  setTitle: (title: string) => void;
  updatePaidBy: (friendId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FRIENDS: "bill-manager-friends",
  BILLS: "bill-manager-bills",
  CURRENT_BILL_ID: "bill-manager-current-bill-id",
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [friends, setFriends] = useState<Friend[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.FRIENDS, []),
  );
  const [bills, setBills] = useState<Bill[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.BILLS, []),
  );
  const [currentBillId, setCurrentBillId] = useState<string | null>(() =>
    loadFromLocalStorage(STORAGE_KEYS.CURRENT_BILL_ID, null),
  );

  // Save friends to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FRIENDS, friends);
  }, [friends]);

  // Save bills to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.BILLS, bills);
  }, [bills]);

  // Save current bill ID to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.CURRENT_BILL_ID, currentBillId);
  }, [currentBillId]);

  const currentBill = bills.find((b) => b.id === currentBillId) || null;
  // const names = friends || [];
  const items = currentBill?.items || [];
  const title = currentBill?.title || "Items & Billing";
  const paidBy = currentBill?.paidBy || null;

  const createBill = (billTitle: string) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      title: billTitle.trim() || "New Bill",
      paidBy: "",
      items: [],
      createdAt: Date.now(),
    };
    setBills([...bills, newBill]);
    setCurrentBillId(newBill.id);
  };

  const deleteBill = (billId: string) => {
    setBills(bills.filter((b) => b.id !== billId));
    if (currentBillId === billId) {
      setCurrentBillId(bills.length > 1 ? bills[0].id : null);
    }
  };

  const selectBill = (billId: string) => {
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

  const addFriend = (name: string) => {
    if (name.trim() === "") return;

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: name,
    };

    setFriends([...friends, newFriend]);
  };

  const deleteFriend = (friendId: string) => {
    setBills(
      bills.map((bill) => ({
        ...bill,
        items: bill.items.map((item) => ({
          ...item,
          checkedNames: item.checkedNames.filter((id) => id !== friendId),
        })),
      })),
    );
    setFriends(friends.filter((f) => f.id !== friendId));
  };

  const addItem = (item: Omit<Item, "id">) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
    };

    // If no bill exists or no bill is selected, create a default bill
    if (!currentBillId || bills.length === 0) {
      const newBill: Bill = {
        id: Date.now().toString(),
        title: "My Bill",
        paidBy: "",
        items: [newItem],
        createdAt: Date.now(),
      };
      setBills([...bills, newBill]);
      setCurrentBillId(newBill.id);
      return;
    }

    setBills(
      bills.map((bill) =>
        bill.id === currentBillId
          ? { ...bill, items: [...bill.items, newItem] }
          : bill,
      ),
    );
  };

  const updateItem = (id: string, updates: Partial<Omit<Item, "id">>) => {
    if (!currentBillId) return;
    setBills(
      bills.map((bill) =>
        bill.id === currentBillId
          ? {
              ...bill,
              items: bill.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item,
              ),
            }
          : bill,
      ),
    );
  };

  const deleteItem = (id: string) => {
    if (!currentBillId) return;
    setBills(
      bills.map((bill) =>
        bill.id === currentBillId
          ? { ...bill, items: bill.items.filter((item) => item.id !== id) }
          : bill,
      ),
    );
  };

  const toggleNameInItem = (itemId: string, name: string) => {
    if (!currentBillId) return;
    setBills(
      bills.map((bill) =>
        bill.id === currentBillId
          ? {
              ...bill,
              items: bill.items.map((item) => {
                if (item.id === itemId) {
                  const isChecked = item.checkedNames.includes(name);
                  return {
                    ...item,
                    checkedNames: isChecked
                      ? item.checkedNames.filter((n) => n !== name)
                      : [...item.checkedNames, name],
                  };
                }
                return item;
              }),
            }
          : bill,
      ),
    );
  };

  const updatePaidBy = (friendId: string | null) => {
    setBills(
      bills.map((bill) =>
        bill.id === currentBillId ? { ...bill, paidBy: friendId } : bill,
      ),
    );
  };

  return (
    <AppContext.Provider
      value={{
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
