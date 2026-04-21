import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./AddReturn.module.css";
import { Page } from "../components/Navigation";

function AddReturn(props: {
  onNavigate: (page: Page) => void;
}): React.JSX.Element {
  const { currency, friends, addMoneyReturn } = useAppContext();
  const [fromFriendId, setFromFriendId] = useState<number | null>(null);
  const [toFriendId, setToFriendId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const handleAddReturn = () => {
    if (
      !fromFriendId ||
      !toFriendId ||
      fromFriendId === toFriendId ||
      amount === 0 ||
      amount === null
    )
      return;

    addMoneyReturn({
      from_friend_id: fromFriendId,
      to_friend_id: toFriendId,
      amount: amount,
      title: title ? title.trim() : "Monkey",
    });
    setFromFriendId(null);
    setToFriendId(null);
    setAmount(null);
    setTitle(null);
    props.onNavigate("returns");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddReturn();
    }
  };

  const onClose = () => {
    props.onNavigate("returns");
  };
  return (
    <div className={styles["money-returns-container"]}>
      <div className={styles["money-returns-section"]}>
        <div className={styles.header}>
          <h2>Return Money</h2>
          <div className={styles.close} onClick={onClose}>
            ✕
          </div>
        </div>
        {friends.length < 2 ? (
          <p className={styles["warning-message"]}>
            You need at least 2 friends to record money returns. Please add
            friends on the Friends page.
          </p>
        ) : (
          <div className={styles["add-return-form"]}>
            <div className={styles["form-row"]}>
              <div className={styles["form-row"]}>
                <div
                  className={styles["form-group"] + " " + styles["full-width"]}
                >
                  <label htmlFor="description">Description (optional):</label>
                  <input
                    id="description"
                    type="text"
                    value={title ?? ""}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Payment for dinner, Rent share"
                    className={styles["description-input"]}
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="from-friend">From:</label>
                <select
                  id="from-friend"
                  value={fromFriendId ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFromFriendId(isNaN(val) ? null : val);
                  }}
                  className={styles["friend-select"]}
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="to-friend">To:</label>
                <select
                  id="to-friend"
                  value={toFriendId ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setToFriendId(isNaN(val) ? null : val);
                  }}
                  className={styles["friend-select"]}
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="amount">Amount ({currency}):</label>
                <input
                  id="amount"
                  type="number"
                  value={amount ?? ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAmount(isNaN(val) ? 0 : val);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={styles["amount-input"]}
                />
              </div>
            </div>

            <button
              onClick={handleAddReturn}
              className={styles["add-return-button"]}
              disabled={
                !fromFriendId ||
                !toFriendId ||
                !amount ||
                fromFriendId === toFriendId
              }
            >
              Record Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddReturn;
