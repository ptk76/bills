import React, { useState } from "react";
import { useAppContext } from "./context/AppContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Statistics from "./pages/Statistics";
import MoneyReturns from "./pages/MoneyReturns";
import "./App.css";
import Scan from "./pages/Scan";
import Groups from "./pages/Groups";
import Token from "./components/Token";
import AddReturn from "./pages/AddReturn";

export type PageData = {
  addReturn?: {
    title: string;
    from: number | null;
    to: number | null;
    amount: number;
  };
  bill?: {
    id: number;
  };
};

export type Page =
  | "back"
  | "home"
  | "bill"
  | "friends"
  | "groups"
  | "returns"
  | "stats"
  | "scan"
  | "add-return";

export type OnNavigate = (page: Page, data?: PageData) => void;

function App(): React.JSX.Element {
  const { queryInProgress } = useAppContext();
  const [menu, setMenu] = useState<Page>("home");
  const [historyMenu, setHistoryMenu] = useState<Page[]>(["home"]);
  const [pageData, setPageData] = useState<PageData>({});

  const navigateTo: OnNavigate = (page, data) => {
    if (page === historyMenu[historyMenu.length - 1]) return;
    const HISTORY_MAX_LENGTH = 3;
    const newHistory = [...historyMenu];

    if (page === "back") {
      newHistory.pop();
      const navTo = newHistory.pop() ?? "home";
      setMenu(navTo);
      newHistory.push(navTo);
      setHistoryMenu(newHistory);
    } else {
      if (newHistory.length === HISTORY_MAX_LENGTH) newHistory.shift();
      newHistory.push(page);
      setHistoryMenu(newHistory);
      setMenu(page);
    }
    setPageData(data ?? {});
  };

  return (
    <div className="app">
      <Navigation onNavigate={navigateTo} />
      <div className="loader-container">
        <Token />
        {queryInProgress && <div className="loader"></div>}
      </div>
      <div className="content">
        {menu === "home" && <Home onNavigate={navigateTo} />}
        {menu === "bill" && <About onNavigate={navigateTo} data={pageData} />}
        {menu === "scan" && <div>{<Scan onNavigate={navigateTo} />} </div>}
        {menu === "friends" && <div>{<Contact />} </div>}
        {menu === "groups" && <div>{<Groups />} </div>}
        {menu === "returns" && (
          <div>{<MoneyReturns onNavigate={navigateTo} />} </div>
        )}
        {menu === "add-return" && (
          <div>{<AddReturn onNavigate={navigateTo} data={pageData} />} </div>
        )}
        {menu === "stats" && (
          <div>{<Statistics onNavigate={navigateTo} />} </div>
        )}
      </div>
    </div>
  );
}

export default App;
