import React from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./MoneyReturns.module.css";
import { OnNavigate } from "../App";
import { useT } from "../i18n/I18nContext";
import ItemDiv from "../widgets/ItemDiv";

function MoneyReturns(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { friends, moneyReturns, deleteMoneyReturn } = useAppContext();
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
    <div className={styles["money-returns-container2"]}>
      <div className={styles["money-returns-section2"]}>
        <h3>{t("returns.title")}</h3>

        {friends.length < 2 ? (
          <p className={styles["warning-message"]}>
            {t("returns.needFriends")}
          </p>
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
                  <ItemDiv
                    id={moneyReturn.id}
                    onClick={() => {}}
                    warning={false}
                    subtitle={moneyReturn.title}
                    currency={moneyReturn.currency}
                    amount={moneyReturn.amount}
                    title={
                      getFriendName(moneyReturn.from_friend_id) +
                      "→" +
                      getFriendName(moneyReturn.to_friend_id)
                    }
                    onButtonClick={handleDelete}
                    buttonTitle={t("common.delete")}
                  />
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
