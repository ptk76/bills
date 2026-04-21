import React from "react";
import "./Navigation.css";

export type Page =
  | "home"
  | "bill"
  | "friends"
  | "groups"
  | "returns"
  | "stats"
  | "scan"
  | "add-return";

function Navigation(props: {
  onNavigate: (page: Page) => void;
}): React.JSX.Element {
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
