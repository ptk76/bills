import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./Contact.module.css";
import { useT } from "../i18n/I18nContext";

function Contact(): React.JSX.Element {
  const { friends, groups, addFriend, deleteFriend, updateFriend } =
    useAppContext();
  const t = useT();
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddName = () => {
    addFriend(inputValue);
    setInputValue("");
  };

  const handleDeleteName = (id: number) => {
    if (confirm(t("contact.confirmDelete"))) {
      deleteFriend(id);
    }
  };

  const handleSetGroup = (id: number, group_id: number | null) => {
    updateFriend(id, group_id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddName();
    }
  };

  return (
    <div className={styles["contact-container"]}>
      <div className={styles["name-list-section"]}>
        <h2>{t("contact.title")}</h2>

        <div className={styles["add-name-form"]}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("contact.enterName")}
            className={styles["name-input"]}
          />
          <button onClick={handleAddName} className={styles["add-button"]}>
            {t("contact.addName")}
          </button>
        </div>

        {friends.length > 0 ? (
          <ul className={styles["names-list"]}>
            {friends.map((friend) => (
              <li key={friend.id} className={styles["name-item"]}>
                <span className={styles["name-text"]}>{friend.nick}</span>
                <select
                  id="from-friend"
                  value={friend.group_id ?? "null"}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    handleSetGroup(friend.id, isNaN(val) ? null : val);
                  }}
                  className={styles["select"]}
                >
                  <option value="null">{t("contact.noTribe")}</option>
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.surname}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteName(friend.id)}
                  className={styles["delete-button"]}
                >
                  {t("common.delete")}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles["empty-message"]}>{t("contact.empty")}</p>
        )}
      </div>
    </div>
  );
}

export default Contact;
