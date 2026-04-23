import React from "react";
import "./Navigation.css";
import { OnNavigate } from "../App";

function Navigation(props: { onNavigate: OnNavigate }): React.JSX.Element {
  return (
    <div className="navigation">
      <div onClick={() => props.onNavigate("home")}>Bills</div>
      <div onClick={() => props.onNavigate("friends")}>Friends</div>
      <div onClick={() => props.onNavigate("groups")}>Tribes</div>
      <div onClick={() => props.onNavigate("returns")}>Returns</div>
      <div onClick={() => props.onNavigate("stats")}>Debts</div>
    </div>
  );
}

export default Navigation;
