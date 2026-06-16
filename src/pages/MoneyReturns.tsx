import React from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./MoneyReturns.module.css";
import { OnNavigate } from "../App";
import Currency from "../widgets/Currency";
import { useT } from "../i18n/I18nContext";

function MoneyReturns(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { currency, friends, moneyReturns, deleteMoneyReturn } =
    useAppContext();
  const t = useT();

  const handleDelete = (id: number) => {
    if (confirm(t("returns.confirmDelete"))) {
      deleteMoneyReturn(id);
    }
  };

  const getFriendName = (friendId: number): string => {
    const friend = friends.find((f) => f.id === friendId);
    return friend ? friend.nick : t("common.unknown");
  };

  return (
    <div className={styles["money-returns-container"]}>
      <div className={styles["money-returns-section"]}>
        <h2>{t("returns.title")}</h2>

        {friends.length < 2 ? (
          <p className={styles["warning-message"]}>{t("returns.needFriends")}</p>
        ) : (
          <>
            <div className={styles["add-return-form"]}>
              <button
                onClick={() => props.onNavigate("add-return")}
                className={styles["add-return-button"]}
              >
                {t("returns.recordReturn")}
              </button>
            </div>

            {moneyReturns.length > 0 ? (
              <div className={styles["returns-list"]}>
                {moneyReturns.map((moneyReturn) => (
                  <div key={moneyReturn.id} className={styles["return-card"]}>
                    <div className={styles["return-header"]}>
                      {moneyReturn.title && (
                        <div className={styles["return-description"]}>
                          {moneyReturn.title}
                        </div>
                      )}
                      <div className={styles["return-people"]}>
                        <span className={styles["from-person"]}>
                          {getFriendName(moneyReturn.from_friend_id)}
                        </span>
                        <span className={styles["arrow"]}>→</span>
                        <span className={styles["to-person"]}>
                          {getFriendName(moneyReturn.to_friend_id)}
                        </span>
                      </div>
                    </div>

                    <div className={styles["return-amount"]}>
                      <Currency
                        currency={moneyReturn.currency}
                        amount={moneyReturn.amount}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(moneyReturn.id)}
                      className={styles["delete-return-button"]}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles["empty-state"]}>
                <p>{t("returns.empty")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MoneyReturns;
