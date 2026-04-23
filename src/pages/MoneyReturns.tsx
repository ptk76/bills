import React from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./MoneyReturns.module.css";
import { OnNavigate } from "../App";

function MoneyReturns(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { currency, friends, moneyReturns, deleteMoneyReturn } =
    useAppContext();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this money return record?")) {
      deleteMoneyReturn(id);
    }
  };

  const getFriendName = (friendId: number): string => {
    const friend = friends.find((f) => f.id === friendId);
    return friend ? friend.nick : "Unknown";
  };

  return (
    <div className={styles["money-returns-container"]}>
      <div className={styles["money-returns-section"]}>
        <h2>Money Returns</h2>

        {friends.length < 2 ? (
          <p className={styles["warning-message"]}>
            You need at least 2 friends to record money returns. Please add
            friends on the Friends page.
          </p>
        ) : (
          <>
            <div className={styles["add-return-form"]}>
              <button
                onClick={() => props.onNavigate("add-return")}
                className={styles["add-return-button"]}
              >
                Record Return
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
                      {moneyReturn.amount.toFixed(2)} {currency}
                    </div>
                    <button
                      onClick={() => handleDelete(moneyReturn.id)}
                      className={styles["delete-return-button"]}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles["empty-state"]}>
                <p>No money returns recorded yet. Add one above!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MoneyReturns;
