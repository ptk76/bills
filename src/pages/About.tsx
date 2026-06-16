import React, { useEffect, useState } from "react";
import { Item, useAppContext } from "../context/AppContext";
import "./About.css";
import { OnNavigate, PageData } from "../App";
import Warning from "../widgets/Warning";
import { areItemsValid, isItemValid } from "../utils/validator";
import Currency, { CurrencyDropdown } from "../widgets/Currency";
import { useT } from "../i18n/I18nContext";

function About(props: {
  onNavigate: OnNavigate;
  data: PageData;
}): React.JSX.Element {
  const t = useT();
  const {
    currentBillId,
    selectBill,
    currency,
    updateCurrency,
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

  useEffect(() => {
    if (props.data && props.data.bill) {
      selectBill(props.data.bill.id);
    }
  }, []);

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

  const onClose = () => {
    props.onNavigate("back");
  };

  const setCurrency = (currency: string) => {
    updateCurrency(currency !== "null" ? currency : null);
  };

  return (
    <div className="about-container">
      <div className="items-section">
        <div className="closeContainer">
          <div className="close" onClick={onClose}>
            ↩
          </div>
        </div>
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
                  {t("common.save")}
                </button>
                <button onClick={cancelTitleEdit} className="cancel-button">
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="title-view-mode">
              {(!paidBy || !areItemsValid(currentBillId, items, splits)) && (
                <Warning />
              )}
              <h2>{title}</h2>
              <button onClick={startEditingTitle} className="edit-title-button">
                {t("about.editTitle")}
              </button>
            </div>
          )}
        </div>

        {countItems() > 0 && (
          <div className="total-price-section">
            <div className="total-price-content">
              <span className="total-price-label">{t("about.totalPrice")}</span>
              <span className="total-price-amount">
                <Currency currency={currency} amount={calculateTotalPrice()} />
              </span>
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="names-summary-section">
            <h3>{t("common.paidBy")}</h3>
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
                <option value="null">{t("common.none")}</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.nick}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="names-summary-section">
          <h3>{t("common.currency")}</h3>
          <div className="form-group">
            <CurrencyDropdown currency={currency} onChange={setCurrency} />
          </div>
        </div>

        {friends.length > 0 && (
          <div className="names-summary-section">
            <h3>{t("about.peopleTotals")}</h3>
            <div className="names-summary-list">
              {friends.map((friend) => {
                const total = calculatePersonTotal(friend.id);
                if (total === 0) return null;
                return (
                  <div key={friend.id} className={`person-summary-item`}>
                    <span className="person-name">{friend.nick}</span>
                    <span className="person-total">
                      <Currency currency={currency} amount={total} />
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
            placeholder={t("about.itemName")}
            className="item-name-input"
          />
          <input
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("about.price")}
            min="0"
            step="0.01"
            className="item-price-input"
          />
          <input
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("about.quantity")}
            min="1"
            max="100"
            step="1"
            className="item-price-input"
          />
          <button onClick={handleAddItem} className="add-item-button">
            {t("about.addItem")}
          </button>
        </div>

        {friends.length === 0 && (
          <p className="warning-message">{t("about.noContacts")}</p>
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
                        <h3>{t("about.editItem")}</h3>
                      </div>
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          placeholder={t("about.itemName")}
                          className="edit-name-input"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          placeholder={t("about.price")}
                          min="0"
                          step="0.01"
                          className="edit-price-input"
                        />
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          placeholder={t("about.quantity")}
                          min="1"
                          max="100"
                          step="1"
                          className="edit-price-input"
                        />
                      </div>
                      <div className="edit-actions">
                        <button onClick={saveEdit} className="save-button">
                          {t("common.save")}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="cancel-button"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="item-header">
                        <div className="item-info">
                          {!isItemValid(item, splits) && <Warning />}
                          <h3>{item.title}</h3>
                        </div>
                        <div className="item-actions">
                          <button
                            onClick={() => startEditing(item.id)}
                            className="edit-button"
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="delete-item-button"
                          >
                            {t("common.delete")}
                          </button>
                        </div>
                      </div>
                      <div className="item-price-container">
                        <p className="item-price">
                          <Currency currency={currency} amount={item.price} />
                        </p>
                        <p className="item-quantity">x {item.quantity}</p>
                        <p className="item-price-total">
                          <Currency
                            currency={currency}
                            amount={item.price * item.quantity}
                          />
                        </p>
                      </div>

                      {friends.length > 0 && (
                        <div className="names-checkboxes">
                          <h4>{t("about.splitWith")}</h4>
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
          <p className="empty-message">{t("about.noItems")}</p>
        )}
      </div>
    </div>
  );
}

export default About;
