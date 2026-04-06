import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import styles from "./Groups.module.css";

function Groups(): React.JSX.Element {
  const { groups, addGroup, deleteGroup } = useAppContext();
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddName = () => {
    addGroup(inputValue);
    setInputValue("");
  };

  const handleDeleteName = (id: number) => {
    if (confirm("Are you sure you want to delete this money return record?")) {
      deleteGroup(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddName();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["name-list-section"]}>
        <h2>Tribes</h2>

        <div className={styles["add-name-form"]}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a name"
            className={styles["name-input"]}
          />
          <button onClick={handleAddName} className={styles["add-button"]}>
            Add Tribe
          </button>
        </div>

        {groups.length > 0 ? (
          <ul className={styles["names-list"]}>
            {groups.map((grp) => (
              <li key={grp.id} className={styles["name-item"]}>
                <span className={styles["name-text"]}>{grp.surname}</span>
                <button
                  onClick={() => handleDeleteName(grp.id)}
                  className={styles["delete-button"]}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles["empty-message"]}>
            No names added yet. Add your first contact above!
          </p>
        )}
      </div>
    </div>
  );
}

export default Groups;
