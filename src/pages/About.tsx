import React, { useState } from "react";
import { Item, useAppContext } from "../context/AppContext";
import "./About.css";

function About(): React.JSX.Element {
  const {
    currentBillId,
    currency,
    friends,
    splits,
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
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<string>("1");
  const [editingTitle, setEditingTitle] = useState<boolean>(
    title === "Monkey" ? true : false,
  );
  const [tempTitle, setTempTitle] = useState<string>("");
  const handleAddItem = () => {
    if (itemName.trim() !== "" && itemPrice.trim() !== "") {
      const price = parseFloat(itemPrice);
      const quantity = parseInt(itemQuantity);
      if (!isNaN(price) && price > 0) {
        addItem({
          title: itemName.trim(),
          price: price,
          quantity: quantity,
          bill_id: currentBillId ?? 0,
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

  const startEditing = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setEditingItemId(itemId);
      setEditName(item.title);
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
          title: editName.trim(),
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

  const calculatePersonTotal = (friendId: number): number => {
    return items.reduce((total, item) => {
      if (item.bill_id !== currentBillId) return total;
      const allSplitQuantity = splits.reduce(
        (total, split) =>
          total + (split.item_id === item.id ? split.quantity : 0),
        0,
      );
      if (allSplitQuantity === 0) return total;

      const friendSplit = splits.find(
        (split) => split.friend_id === friendId && split.item_id === item.id,
      );
      if (!friendSplit) return total;

      return (
        total +
        (item.price * item.quantity * friendSplit.quantity) / allSplitQuantity
      );
    }, 0);
  };

  const calculateTotalPrice = (): number => {
    return items.reduce(
      (total, item) =>
        total +
        (item.bill_id === currentBillId ? item.price * item.quantity : 0),
      0,
    );
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

  const countItems = () => {
    return items.reduce(
      (total, item) => total + (item.bill_id === currentBillId ? 1 : 0),
      0,
    );
  };

  const calculateItemSplitByFriend = (item: Item, friendId: number) => {
    if (item.bill_id !== currentBillId) return 0;
    const allSplitQuantity = splits.reduce(
      (total, split) =>
        total + (split.item_id === item.id ? split.quantity : 0),
      0,
    );

    if (allSplitQuantity === 0) return 0;

    const friendSplit = splits.find(
      (split) => split.friend_id === friendId && split.item_id === item.id,
    );
    if (!friendSplit) return 0;

    return (
      (item.price * item.quantity * friendSplit.quantity) / allSplitQuantity
    );
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

        {countItems() > 0 && (
          <div className="total-price-section">
            <div className="total-price-content">
              <span className="total-price-label">Total Price:</span>
              <span className="total-price-amount">
                {calculateTotalPrice().toFixed(2)} {currency}
              </span>
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="names-summary-section">
            <h3>Paid by:</h3>
            <div className="form-group">
              <select
                id="from-friend"
                value={paidBy ?? undefined}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updatePaidBy(isNaN(val) ? null : val);
                }}
                className="friend-select"
              >
                <option value="null">None</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.nick}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="names-summary-section">
            <h3>People & Totals</h3>
            <div className="names-summary-list">
              {friends.map((friend) => {
                const total = calculatePersonTotal(friend.id);
                if (total === 0) return null;
                return (
                  <div key={friend.id} className={`person-summary-item`}>
                    <span className="person-name">{friend.nick}</span>
                    <span className="person-total">
                      {total.toFixed(2)} {currency}
                    </span>
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

        {countItems() > 0 ? (
          <div className="items-list">
            {items
              .filter((item) => item.bill_id === currentBillId)
              .map((item) => (
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
                        <button
                          onClick={cancelEditing}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="item-header">
                        <div className="item-info">
                          <h3>{item.title}</h3>
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
                        <p className="item-price">
                          {item.price.toFixed(2)} {currency}{" "}
                        </p>
                        <p className="item-quantity">x {item.quantity}</p>
                        <p className="item-price-total">
                          {(item.price * item.quantity).toFixed(2)} {currency}
                        </p>
                      </div>

                      {friends.length > 0 && (
                        <div className="names-checkboxes">
                          <h4>Split with:</h4>
                          <div className="checkbox-list">
                            {friends.map((friend) => {
                              const splitByFriend = calculateItemSplitByFriend(
                                item,
                                friend.id,
                              );
                              return (
                                <label
                                  key={friend.id}
                                  className={
                                    splitByFriend === 0
                                      ? "checkbox-label no-split"
                                      : "checkbox-label"
                                  }
                                  onClick={() =>
                                    toggleNameInItem(item.id, friend.id)
                                  }
                                >
                                  <div className="checkbox-name">
                                    <div>{friend.nick}</div>
                                    {splitByFriend !== 0 && <>:</>}
                                    <div
                                      className={
                                        splitByFriend === 0
                                          ? "checkbox-quantity checkbox-hide"
                                          : "checkbox-quantity"
                                      }
                                    >
                                      {
                                        splits.find(
                                          (split) =>
                                            split.friend_id === friend.id &&
                                            split.item_id === item.id,
                                        )?.quantity
                                      }
                                      &rarr;
                                    </div>
                                    <div
                                      className={
                                        splitByFriend === 0
                                          ? "checkbox-split checkbox-hide"
                                          : "checkbox-split"
                                      }
                                    >
                                      {splitByFriend.toFixed(2)}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
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
