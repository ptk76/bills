import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";

function Navigation(): React.JSX.Element {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <Link to="/">Bills</Link>
        </li>
        <li>
          <Link to="/contact">Friends</Link>
        </li>
        <li>
          <Link to="/statistics">Statistics</Link>
        </li>
        <li>
          <Link to="/money-returns">Returns</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
