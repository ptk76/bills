import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface Item {
  id: string;
  name: string;
  price: number;
  checkedNames: string[];
}

export interface Bill {
  id: string;
  title: string;
  names: string[];
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
  names: string[];
  addName: (name: string) => void;
  deleteName: (index: number) => void;
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id'>>) => void;
  deleteItem: (id: string) => void;
  toggleNameInItem: (itemId: string, name: string) => void;
  title: string;
  setTitle: (title: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BILLS: 'bill-manager-bills',
  CURRENT_BILL_ID: 'bill-manager-current-bill-id'
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

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.BILLS, [])
  );
  const [currentBillId, setCurrentBillId] = useState<string | null>(() =>
    loadFromLocalStorage(STORAGE_KEYS.CURRENT_BILL_ID, null)
  );

  // Save bills to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.BILLS, bills);
  }, [bills]);

  // Save current bill ID to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.CURRENT_BILL_ID, currentBillId);
  }, [currentBillId]);

  const currentBill = bills.find(b => b.id === currentBillId) || null;
  const names = currentBill?.names || [];
  const items = currentBill?.items || [];
  const title = currentBill?.title || 'Items & Billing';

  const createBill = (billTitle: string) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      title: billTitle.trim() || 'New Bill',
      names: [],
      items: [],
      createdAt: Date.now()
    };
    setBills([...bills, newBill]);
    setCurrentBillId(newBill.id);
  };

  const deleteBill = (billId: string) => {
    setBills(bills.filter(b => b.id !== billId));
    if (currentBillId === billId) {
      setCurrentBillId(bills.length > 1 ? bills[0].id : null);
    }
  };

  const selectBill = (billId: string) => {
    setCurrentBillId(billId);
  };

  const updateBillTitle = (newTitle: string) => {
    if (!currentBillId) return;
    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? { ...bill, title: newTitle }
        : bill
    ));
  };

  const setTitle = (newTitle: string) => {
    updateBillTitle(newTitle);
  };

  const addName = (name: string) => {
    if (name.trim() === '') return;

    // If no bill exists or no bill is selected, create a default bill
    if (!currentBillId || bills.length === 0) {
      const newBill: Bill = {
        id: Date.now().toString(),
        title: 'My Bill',
        names: [name.trim()],
        items: [],
        createdAt: Date.now()
      };
      setBills([...bills, newBill]);
      setCurrentBillId(newBill.id);
      return;
    }

    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? { ...bill, names: [...bill.names, name.trim()] }
        : bill
    ));
  };

  const deleteName = (index: number) => {
    if (!currentBillId) return;
    const nameToDelete = currentBill!.names[index];
    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? {
            ...bill,
            names: bill.names.filter((_, i) => i !== index),
            items: bill.items.map(item => ({
              ...item,
              checkedNames: item.checkedNames.filter(n => n !== nameToDelete)
            }))
          }
        : bill
    ));
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString()
    };

    // If no bill exists or no bill is selected, create a default bill
    if (!currentBillId || bills.length === 0) {
      const newBill: Bill = {
        id: Date.now().toString(),
        title: 'My Bill',
        names: [],
        items: [newItem],
        createdAt: Date.now()
      };
      setBills([...bills, newBill]);
      setCurrentBillId(newBill.id);
      return;
    }

    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? { ...bill, items: [...bill.items, newItem] }
        : bill
    ));
  };

  const updateItem = (id: string, updates: Partial<Omit<Item, 'id'>>) => {
    if (!currentBillId) return;
    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? {
            ...bill,
            items: bill.items.map(item =>
              item.id === id ? { ...item, ...updates } : item
            )
          }
        : bill
    ));
  };

  const deleteItem = (id: string) => {
    if (!currentBillId) return;
    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? { ...bill, items: bill.items.filter(item => item.id !== id) }
        : bill
    ));
  };

  const toggleNameInItem = (itemId: string, name: string) => {
    if (!currentBillId) return;
    setBills(bills.map(bill =>
      bill.id === currentBillId
        ? {
            ...bill,
            items: bill.items.map(item => {
              if (item.id === itemId) {
                const isChecked = item.checkedNames.includes(name);
                return {
                  ...item,
                  checkedNames: isChecked
                    ? item.checkedNames.filter(n => n !== name)
                    : [...item.checkedNames, name]
                };
              }
              return item;
            })
          }
        : bill
    ));
  };

  return (
    <AppContext.Provider value={{
      bills,
      currentBillId,
      currentBill,
      createBill,
      deleteBill,
      selectBill,
      updateBillTitle,
      names,
      addName,
      deleteName,
      items,
      addItem,
      updateItem,
      deleteItem,
      toggleNameInItem,
      title,
      setTitle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
