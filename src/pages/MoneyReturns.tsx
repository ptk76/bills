import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import "./MoneyReturns.css";

function MoneyReturns(): React.JSX.Element {
  const { friends, moneyReturns, addMoneyReturn, deleteMoneyReturn } =
    useAppContext();
  const [fromFriendId, setFromFriendId] = useState<number | null>(null);
  const [toFriendId, setToFriendId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [title, setTitle] = useState<string | null>(null);

  const handleAddReturn = () => {
    if (
      !fromFriendId ||
      !toFriendId ||
      fromFriendId === toFriendId ||
      amount === 0
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
    setAmount(0);
    setTitle(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddReturn();
    }
  };

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
    <div className="money-returns-container">
      <h2>Money Returns</h2>

      {friends.length < 2 ? (
        <p className="warning-message">
          You need at least 2 friends to record money returns. Please add
          friends on the Friends page.
        </p>
      ) : (
        <>
          <div className="add-return-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="from-friend">From:</label>
                <select
                  id="from-friend"
                  value={fromFriendId ?? undefined}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFromFriendId(isNaN(val) ? null : val);
                  }}
                  className="friend-select"
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="to-friend">To:</label>
                <select
                  id="to-friend"
                  value={toFriendId ?? undefined}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setToFriendId(isNaN(val) ? null : val);
                  }}
                  className="friend-select"
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.nick}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount (€):</label>
                <input
                  id="amount"
                  type="number"
                  value={amount ?? undefined}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAmount(isNaN(val) ? 0 : val);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="amount-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description (optional):</label>
                <input
                  id="description"
                  type="text"
                  value={title ?? undefined}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Payment for dinner, Rent share"
                  className="description-input"
                />
              </div>
            </div>

            <button
              onClick={handleAddReturn}
              className="add-return-button"
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

          {moneyReturns.length > 0 ? (
            <div className="returns-list">
              <h3>Return History</h3>
              {moneyReturns.map((moneyReturn) => (
                <div key={moneyReturn.id} className="return-card">
                  <div className="return-header">
                    <div className="return-people">
                      <span className="from-person">
                        {getFriendName(moneyReturn.from_friend_id)}
                      </span>
                      <span className="arrow">→</span>
                      <span className="to-person">
                        {getFriendName(moneyReturn.to_friend_id)}
                      </span>
                    </div>
                    <div className="return-amount">
                      {moneyReturn.amount.toFixed(2)} €
                    </div>
                  </div>
                  {moneyReturn.title && (
                    <div className="return-description">
                      {moneyReturn.title}
                    </div>
                  )}
                  <div className="return-footer">
                    <button
                      onClick={() => handleDelete(moneyReturn.id)}
                      className="delete-return-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No money returns recorded yet. Add one above!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MoneyReturns;
