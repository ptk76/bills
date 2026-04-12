import React, { useState } from "react";
import { useAppContext } from "./context/AppContext";
import Navigation, { Page } from "./components/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Statistics from "./pages/Statistics";
import MoneyReturns from "./pages/MoneyReturns";
import "./App.css";
import Scan from "./pages/Scan";
import Groups from "./pages/Groups";
import Token from "./components/Token";

function App(): React.JSX.Element {
  const { queryInProgress } = useAppContext();
  const [menu, setMenu] = useState<Page>("home");
  return (
    <div className="app">
      <Navigation onNavigate={(page) => setMenu(page)} />
      <div className="loader-container">
        <Token />
        {queryInProgress && <div className="loader"></div>}
      </div>
      <div className="content">
        {menu === "home" && (
          <div>{<Home onNavigate={(page) => setMenu(page)} />} </div>
        )}
        {menu === "bill" && <div>{<About />} </div>}
        {menu === "scan" && (
          <div>{<Scan onNavigate={(page) => setMenu(page)} />} </div>
        )}
        {menu === "friends" && <div>{<Contact />} </div>}
        {menu === "groups" && <div>{<Groups />} </div>}
        {menu === "returns" && <div>{<MoneyReturns />} </div>}
        {menu === "stats" && <div>{<Statistics />} </div>}
      </div>
    </div>
  );
}

export default App;
