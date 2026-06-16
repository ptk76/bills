import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./AddReturn.module.css";
import { OnNavigate, PageData } from "../App";
import { CurrencyDropdown } from "../widgets/Currency";
import { useT } from "../i18n/I18nContext";

function AddReturn(props: {
  onNavigate: OnNavigate;
  data: PageData;
}): React.JSX.Element {
  const { friends, addMoneyReturn } = useAppContext();
  const t = useT();
  const [fromFriendId, setFromFriendId] = useState<number | null>(null);
  const [toFriendId, setToFriendId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (props.data && props.data.addReturn) {
      setTitle(props.data.addReturn.title);
      setFromFriendId(props.data.addReturn.from);
      setToFriendId(props.data.addReturn.to);
      setCurrency(props.data.addReturn.currency);
      setAmount(props.data.addReturn.amount);
    }
  }, []);

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
      currency: currency,
    });
    setFromFriendId(null);
    setToFriendId(null);
    setAmount(null);
    setTitle(null);
    props.onNavigate("back");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddReturn();
    }
  };

  const onClose = () => {
    props.onNavigate("back");
  };
  return (
    <div className={styles["money-returns-container"]}>
      <div className={styles["money-returns-section"]}>
        <div className={styles.header}>
          <h2>{t("addReturn.title")}</h2>
          <div className={styles.close} onClick={onClose}>
            ✕
          </div>
        </div>
        {friends.length < 2 ? (
          <p className={styles["warning-message"]}>{t("returns.needFriends")}</p>
        ) : (
          <div className={styles["add-return-form"]}>
            <div className={styles["form-row"]}>
              <div className={styles["form-row"]}>
                <div
                  className={styles["form-group"] + " " + styles["full-width"]}
                >
                  <label htmlFor="description">
                    {t("addReturn.description")}
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={title ?? ""}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t("addReturn.descriptionPlaceholder")}
                    className={styles["description-input"]}
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="from-friend">{t("addReturn.from")}</label>
                <select
                  id="from-friend"
                  value={fromFriendId ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFromFriendId(isNaN(val) ? null : val);
                  }}
                  className={styles["friend-select"]}
                >
                  <option value="">{t("addReturn.selectPerson")}</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="to-friend">{t("addReturn.to")}</label>
                <select
                  id="to-friend"
                  value={toFriendId ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setToFriendId(isNaN(val) ? null : val);
                  }}
                  className={styles["friend-select"]}
                >
                  <option value="">{t("addReturn.selectPerson")}</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="amount">{t("addReturn.amount")}</label>
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
              <div className={styles["form-group"]}>
                <label htmlFor="amount">{t("common.currency")}</label>
                <CurrencyDropdown currency={currency} onChange={setCurrency} />
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
              {t("returns.recordReturn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddReturn;
