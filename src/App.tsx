import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Statistics from "./pages/Statistics";
import MoneyReturns from "./pages/MoneyReturns";
import "./App.css";

function App(): React.JSX.Element {
  const { queryInProgress } = useAppContext();
  return (
    <Router>
      <div className="app">
        <Navigation />
        <div className="loader-container">
          {queryInProgress && <div className="loader"></div>}
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/money-returns" element={<MoneyReturns />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
