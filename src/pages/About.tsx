import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import "./About.css";

function About(): React.JSX.Element {
  const {
    names,
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleNameInItem,
    title,
    setTitle,
  } = useAppContext();
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handleAddItem = () => {
    if (itemName.trim() !== "" && itemPrice.trim() !== "") {
      const price = parseFloat(itemPrice);
      if (!isNaN(price) && price > 0) {
        addItem({
          name: itemName.trim(),
          price: price,
          checkedNames: [],
        });
        setItemName("");
        setItemPrice("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  const startEditing = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setEditingItemId(itemId);
      setEditName(item.name);
      setEditPrice(item.price.toString());
    }
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditName("");
    setEditPrice("");
  };

  const saveEdit = () => {
    if (editingItemId && editName.trim() !== "" && editPrice.trim() !== "") {
      const price = parseFloat(editPrice);
      if (!isNaN(price) && price > 0) {
        updateItem(editingItemId, {
          name: editName.trim(),
          price: price,
        });
        cancelEditing();
      }
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const calculateItemTotal = (itemId: string): number => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.checkedNames.length === 0) return 0;
    return item.price / item.checkedNames.length;
  };

  const calculatePersonTotal = (personName: string): number => {
    let total = 0;
    items.forEach((item) => {
      if (item.checkedNames.includes(personName)) {
        total += item.price / item.checkedNames.length;
      }
    });
    return total;
  };

  const calculateTotalPrice = (): number => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const startEditingTitle = () => {
    setTempTitle(title);
    setEditingTitle(true);
  };

  const saveTitleEdit = () => {
    if (tempTitle.trim() !== "") {
      setTitle(tempTitle.trim());
      setEditingTitle(false);
    }
  };

  const cancelTitleEdit = () => {
    setTempTitle("");
    setEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitleEdit();
    } else if (e.key === "Escape") {
      cancelTitleEdit();
    }
  };

  return (
    <div className="about-container">
      <div className="items-section">
        <div className="title-header">
          {editingTitle ? (
            <div className="title-edit-mode">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyPress={handleTitleKeyPress}
                className="title-input"
                autoFocus
              />
              <div className="title-actions">
                <button onClick={saveTitleEdit} className="save-button">
                  Save
                </button>
                <button onClick={cancelTitleEdit} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="title-view-mode">
              <h2>{title}</h2>
              <button onClick={startEditingTitle} className="edit-title-button">
                Edit Title
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="total-price-section">
            <div className="total-price-content">
              <span className="total-price-label">Total Price:</span>
              <span className="total-price-amount">
                ${calculateTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {names.length > 0 && (
          <div className="names-summary-section">
            <h3>People & Totals</h3>
            <div className="names-summary-list">
              {names.map((name, index) => {
                const total = calculatePersonTotal(name);
                return (
                  <div
                    key={index}
                    className={`person-summary-item ${selectedPerson === name ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedPerson(selectedPerson === name ? null : name)
                    }
                  >
                    <div className="person-info">
                      <input
                        type="radio"
                        checked={selectedPerson === name}
                        onChange={() => setSelectedPerson(name)}
                        className="person-radio"
                      />
                      <span className="person-name">{name}</span>
                    </div>
                    <span className="person-total">${total.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="add-item-form">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Item name"
            className="item-name-input"
          />
          <input
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Price"
            min="0"
            step="0.01"
            className="item-price-input"
          />
          <button onClick={handleAddItem} className="add-item-button">
            Add Item
          </button>
        </div>

        {names.length === 0 && (
          <p className="warning-message">
            No contacts available. Please add contacts on the Contact page
            first.
          </p>
        )}

        {items.length > 0 ? (
          <div className="items-list">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                {editingItemId === item.id ? (
                  // Edit mode
                  <div className="edit-mode">
                    <div className="edit-header">
                      <h3>Edit Item</h3>
                    </div>
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        placeholder="Item name"
                        className="edit-name-input"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        placeholder="Price"
                        min="0"
                        step="0.01"
                        className="edit-price-input"
                      />
                    </div>
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-button">
                        Save
                      </button>
                      <button onClick={cancelEditing} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="item-header">
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p className="item-price">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="item-actions">
                        <button
                          onClick={() => startEditing(item.id)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="delete-item-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {names.length > 0 && (
                      <div className="names-checkboxes">
                        <h4>Split with:</h4>
                        <div className="checkbox-list">
                          {names.map((name, index) => (
                            <label key={index} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={item.checkedNames.includes(name)}
                                onChange={() => toggleNameInItem(item.id, name)}
                              />
                              <span className="checkbox-name">{name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.checkedNames.length > 0 && (
                      <div className="item-summary">
                        <p className="split-info">
                          Split between {item.checkedNames.length}{" "}
                          {item.checkedNames.length === 1 ? "person" : "people"}
                        </p>
                        <p className="per-person">
                          ${calculateItemTotal(item.id).toFixed(2)} per person
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">
            No items added yet. Add your first item above!
          </p>
        )}
      </div>
    </div>
  );
}

export default About;
