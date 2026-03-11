import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import "./Contact.css";

function Contact(): React.JSX.Element {
  const { names, addName, deleteName } = useAppContext();
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddName = () => {
    addName(inputValue);
    setInputValue("");
  };

  const handleDeleteName = (index: number) => {
    deleteName(index);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddName();
    }
  };

  return (
    <div className="contact-container">
      <div className="name-list-section">
        <h2>Friends</h2>

        <div className="add-name-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a name"
            className="name-input"
          />
          <button onClick={handleAddName} className="add-button">
            Add Name
          </button>
        </div>

        {names.length > 0 ? (
          <ul className="names-list">
            {names.map((name, index) => (
              <li key={index} className="name-item">
                <span className="name-text">{name}</span>
                <button
                  onClick={() => handleDeleteName(index)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">
            No names added yet. Add your first contact above!
          </p>
        )}
      </div>
    </div>
  );
}

export default Contact;
