// English is the source of truth. Add a key here and TypeScript will require
// the same key in every other language's dictionary below.
export const en = {
  // Navigation
  "nav.bills": "Bills",
  "nav.friends": "Friends",
  "nav.tribes": "Tribes",
  "nav.returns": "Returns",
  "nav.debts": "Debts",

  // Shared
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.none": "None",
  "common.paidBy": "Paid by:",
  "common.unknown": "Unknown",
  "common.currency": "Currency:",

  // Home
  "home.title": "The Bills",
  "home.createBill": "Create Bill",
  "home.createBillFromCsv": "Create Bill from CSV",
  "home.payerNone": "NONE",
  "home.empty": "No bills yet. Create your first bill above!",
  "home.confirmDelete": "Are you sure you want to delete this bill?",

  // Bill details (About)
  "about.editTitle": "Edit Title",
  "about.totalPrice": "Total Price:",
  "about.peopleTotals": "People & Totals",
  "about.itemName": "Item name",
  "about.price": "Price",
  "about.quantity": "Quantity",
  "about.addItem": "Add Item",
  "about.noContacts":
    "No contacts available. Please add contacts on the Contact page first.",
  "about.editItem": "Edit Item",
  "about.splitWith": "Split with:",
  "about.noItems": "No items added yet. Add your first item above!",

  // Friends (Contact)
  "contact.title": "Friends",
  "contact.enterName": "Enter a name",
  "contact.addName": "Add Name",
  "contact.noTribe": "No Tribe",
  "contact.empty": "No names added yet. Add your first contact above!",
  "contact.confirmDelete": "Are you sure you want to delete this friend?",

  // Tribes (Groups)
  "groups.title": "Tribes",
  "groups.enterName": "Enter a name",
  "groups.addTribe": "Add Tribe",
  "groups.empty": "No tribes added yet. Add your first tribe above!",
  "groups.confirmDelete": "Are you sure you want to delete this tribe?",

  // CSV import (Scan)
  "scan.colName": "Name",
  "scan.colQuantity": "Qt.",
  "scan.colPrice": "Price",
  "scan.colTotal": "Total",
  "scan.addBill": "Add bill ({count} items)",

  // Money returns
  "returns.title": "Money Returns",
  "returns.needFriends":
    "You need at least 2 friends to record money returns. Please add friends on the Friends page.",
  "returns.recordReturn": "Record Return",
  "returns.empty": "No money returns recorded yet. Add one above!",
  "returns.confirmDelete":
    "Are you sure you want to delete this money return record?",

  // Add return
  "addReturn.title": "Return Money",
  "addReturn.description": "Description (optional):",
  "addReturn.descriptionPlaceholder": "e.g., Payment for dinner, Rent share",
  "addReturn.from": "From:",
  "addReturn.to": "To:",
  "addReturn.selectPerson": "Select person",
  "addReturn.amount": "Amount:",

  // Statistics
  "stats.title": "Payment Statistics",
  "stats.noBills": "No bills available. Create a bill to see statistics.",
  "stats.byTribes": "Total Debts by Tribes",
  "stats.byIndividuals": "Total Debts by Individuals",
  "stats.unknown": "UNKNOWN",
  "stats.payOff": "Pay off",
  "stats.noDebts": "No debts.",
  "stats.noDebtsToDisplay": "No debts to display.",
  "stats.breakdown": "Bills Breakdown",
  "stats.noDebtsForBill": "No debts for this bill.",
  "stats.noBillsWithPayment": "No bills with payment information available.",
  "stats.debtRepayment": "Debt repayment",
} as const;

export type TranslationKey = keyof typeof en;

// Polish translations. Typed as a full map of every key, so a missing or
// stray key is a compile error.
export const pl: Record<TranslationKey, string> = {
  // Navigation
  "nav.bills": "Rachunki",
  "nav.friends": "Znajomi",
  "nav.tribes": "Plemiona",
  "nav.returns": "Zwroty",
  "nav.debts": "Długi",

  // Shared
  "common.save": "Zapisz",
  "common.cancel": "Anuluj",
  "common.edit": "Edytuj",
  "common.delete": "Usuń",
  "common.none": "Brak",
  "common.paidBy": "Zapłacone przez:",
  "common.unknown": "Nieznany",
  "common.currency": "Waluta:",

  // Home
  "home.title": "Rachunki",
  "home.createBill": "Utwórz rachunek",
  "home.createBillFromCsv": "Utwórz rachunek z CSV",
  "home.payerNone": "BRAK",
  "home.empty": "Brak rachunków. Utwórz swój pierwszy rachunek powyżej!",
  "home.confirmDelete": "Czy na pewno chcesz usunąć ten rachunek?",

  // Bill details (About)
  "about.editTitle": "Edytuj tytuł",
  "about.totalPrice": "Cena całkowita:",
  "about.peopleTotals": "Osoby i sumy",
  "about.itemName": "Nazwa pozycji",
  "about.price": "Cena",
  "about.quantity": "Ilość",
  "about.addItem": "Dodaj pozycję",
  "about.noContacts":
    "Brak dostępnych kontaktów. Najpierw dodaj kontakty na stronie Znajomi.",
  "about.editItem": "Edytuj pozycję",
  "about.splitWith": "Podziel z:",
  "about.noItems":
    "Nie dodano jeszcze pozycji. Dodaj pierwszą pozycję powyżej!",

  // Friends (Contact)
  "contact.title": "Znajomi",
  "contact.enterName": "Wprowadź imię",
  "contact.addName": "Dodaj imię",
  "contact.noTribe": "Brak plemienia",
  "contact.empty": "Nie dodano jeszcze imion. Dodaj pierwszy kontakt powyżej!",
  "contact.confirmDelete": "Czy na pewno chcesz usunąć tego znajomego?",

  // Tribes (Groups)
  "groups.title": "Plemiona",
  "groups.enterName": "Wprowadź nazwę",
  "groups.addTribe": "Dodaj plemię",
  "groups.empty": "Nie dodano jeszcze plemion. Dodaj pierwsze plemię powyżej!",
  "groups.confirmDelete": "Czy na pewno chcesz usunąć to plemię?",

  // CSV import (Scan)
  "scan.colName": "Nazwa",
  "scan.colQuantity": "Il.",
  "scan.colPrice": "Cena",
  "scan.colTotal": "Suma",
  "scan.addBill": "Dodaj rachunek ({count} pozycji)",

  // Money returns
  "returns.title": "Zwroty pieniędzy",
  "returns.needFriends":
    "Potrzebujesz co najmniej 2 znajomych, aby zapisać zwroty pieniędzy. Dodaj znajomych na stronie Znajomi.",
  "returns.recordReturn": "Zapisz zwrot",
  "returns.empty": "Nie zapisano jeszcze żadnych zwrotów. Dodaj jeden powyżej!",
  "returns.confirmDelete": "Czy na pewno chcesz usunąć ten zapis zwrotu?",

  // Add return
  "addReturn.title": "Zwróć pieniądze",
  "addReturn.description": "Opis (opcjonalnie):",
  "addReturn.descriptionPlaceholder":
    "np. Płatność za kolację, Udział w czynszu",
  "addReturn.from": "Od:",
  "addReturn.to": "Do:",
  "addReturn.selectPerson": "Wybierz osobę",
  "addReturn.amount": "Kwota:",

  // Statistics
  "stats.title": "Statystyki płatności",
  "stats.noBills": "Brak rachunków. Utwórz rachunek, aby zobaczyć statystyki.",
  "stats.byTribes": "Łączne długi według plemion",
  "stats.byIndividuals": "Łączne długi według osób",
  "stats.unknown": "NIEZNANY",
  "stats.payOff": "Spłać",
  "stats.noDebts": "Brak długów.",
  "stats.noDebtsToDisplay": "Brak długów do wyświetlenia.",
  "stats.breakdown": "Podział rachunków",
  "stats.noDebtsForBill": "Brak długów dla tego rachunku.",
  "stats.noBillsWithPayment": "Brak rachunków z informacją o płatności.",
  "stats.debtRepayment": "Spłata długu",
};

export const translations = { en, pl } as const;

export type Lang = keyof typeof translations;
