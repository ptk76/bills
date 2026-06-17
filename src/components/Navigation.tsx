import React from "react";
import "./Navigation.css";
import { OnNavigate } from "../App";
import { useI18n } from "../i18n/I18nContext";

function Navigation(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="navigation">
      <div onClick={() => props.onNavigate("home")}>{t("nav.bills")}</div>
      <div onClick={() => props.onNavigate("friends")}>{t("nav.friends")}</div>
      <div onClick={() => props.onNavigate("groups")}>{t("nav.tribes")}</div>
      {/* <div onClick={() => props.onNavigate("returns")}>{t("nav.returns")}</div> */}
      <div onClick={() => props.onNavigate("stats")}>{t("nav.debts")}</div>
    </div>
  );
}

export default Navigation;
