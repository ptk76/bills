import React from "react";
import "./Navigation.css";

export type Page = "home" | "bill" | "friends" | "returns" | "stats" | "scan";

function Navigation(props: {
  onNavigate: (page: Page) => void;
}): React.JSX.Element {
  return (
    <div className="navigation">
      <div onClick={() => props.onNavigate("home")}>Home</div>
      <div onClick={() => props.onNavigate("friends")}>Friends</div>
      <div onClick={() => props.onNavigate("returns")}>Returns</div>
      <div onClick={() => props.onNavigate("stats")}>Summary</div>
    </div>
  );
}

export default Navigation;
