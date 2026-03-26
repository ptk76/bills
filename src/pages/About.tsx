import React, { useState } from "react";
import { Item, useAppContext } from "../context/AppContext";
import "./About.css";

function About(): React.JSX.Element {
  const {
    friends,
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleNameInItem,
    title,
    setTitle,
    paidBy,
    updatePaidBy,
  } = useAppContext();
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<string>("1");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<string>("1");
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>("");

  const handleAddItem = () => {
    if (itemName.trim() !== "" && itemPrice.trim() !== "") {
      const price = parseFloat(itemPrice);
      const quantity = parseInt(itemQuantity);
      if (!isNaN(price) && price > 0) {
        addItem({
          name: itemName.trim(),
          price: price,
          quantity: quantity,
          checkedNames: [],
        });
        setItemName("");
        setItemPrice("");
        setItemQuantity("1");
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
      setEditQuantity(item.quantity.toString());
    }
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditName("");
    setEditPrice("");
    setEditQuantity("");
  };

  const saveEdit = () => {
    if (editingItemId && editName.trim() !== "" && editPrice.trim() !== "") {
      const price = parseFloat(editPrice);
      const quantity = parseInt(editQuantity);
      if (!isNaN(price) && price > 0) {
        updateItem(editingItemId, {
          name: editName.trim(),
          price: price,
          quantity: quantity,
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

  const calculatePersonTotal = (friendId: string): number => {
    const personSplits = items.reduce((prev, item) => {
      const allSplit = item.checkedNames.reduce(
        (prev, split) => prev + split.quantity,
        0,
      );
      const friendSplit = item.checkedNames.reduce(
        (prev, split) =>
          split.friendId === friendId ? prev + split.quantity : prev,
        0,
      );
      if (allSplit === 0) return prev;
      return prev + (item.price * item.quantity * friendSplit) / allSplit;
    }, 0);

    return personSplits;
  };

  const calculateTotalPrice = (): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
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

  const calculateItemSplitByFriend = (item: Item, friendId: string) => {
    const totalParts = item.checkedNames.reduce(
      (sum, split) => sum + split.quantity,
      0,
    );
    const friendSplit = item.checkedNames.find(
      (split) => split.friendId === friendId,
    );
    const friendParts = friendSplit?.quantity ?? 0;

    return friendParts !== 0
      ? ((item.price * item.quantity) / totalParts) * friendParts
      : 0;
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
                {calculateTotalPrice().toFixed(2)} €
              </span>
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="names-summary-section">
            <h3>People & Totals</h3>
            <div className="names-summary-list">
              {friends.map((friend) => {
                const total = calculatePersonTotal(friend.id);
                return (
                  <div
                    key={friend.id}
                    className={`person-summary-item ${paidBy === friend.id ? "selected" : ""}`}
                    onClick={() => {
                      updatePaidBy(friend.id ? friend.id : null);
                    }}
                  >
                    <div className="person-info">
                      <input
                        type="radio"
                        checked={paidBy === friend.id}
                        onChange={() => updatePaidBy(friend.id)}
                        className="person-radio"
                      />
                      <span className="person-name">{friend.name}</span>
                    </div>
                    <span className="person-total">{total.toFixed(2)} €</span>
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
          <input
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Quantity"
            min="1"
            max="100"
            step="1"
            className="item-price-input"
          />
          <button onClick={handleAddItem} className="add-item-button">
            Add Item
          </button>
        </div>

        {friends.length === 0 && (
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
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        placeholder="Quantity"
                        min="1"
                        max="100"
                        step="1"
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
                    <div className="item-price-container">
                      <p className="item-price">{item.price.toFixed(2)} € </p>
                      <p className="item-quantity">x {item.quantity}</p>
                      <p className="item-price-total">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>

                    {friends.length > 0 && (
                      <div className="names-checkboxes">
                        <h4>Split with:</h4>
                        <div className="checkbox-list">
                          {friends.map((friend) => (
                            <label
                              key={friend.id}
                              className="checkbox-label"
                              onClick={() =>
                                toggleNameInItem(item.id, friend.id)
                              }
                            >
                              <div className="checkbox-name">
                                <div>{friend.name}</div>
                                <span
                                  className={
                                    calculateItemSplitByFriend(
                                      item,
                                      friend.id,
                                    ) === 0
                                      ? "checkbox-quantity checkbox-hide"
                                      : "checkbox-quantity"
                                  }
                                >
                                  {
                                    item.checkedNames.find(
                                      (split) => split.friendId === friend.id,
                                    )?.quantity
                                  }
                                </span>
                                <span
                                  className={
                                    calculateItemSplitByFriend(
                                      item,
                                      friend.id,
                                    ) === 0
                                      ? "checkbox-split checkbox-hide"
                                      : "checkbox-split"
                                  }
                                >
                                  [
                                  {calculateItemSplitByFriend(
                                    item,
                                    friend.id,
                                  ).toFixed(2)}{" "}
                                  €]
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
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
