import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import "./MoneyReturns.css";

function MoneyReturns(): React.JSX.Element {
  const { friends, moneyReturns, addMoneyReturn, deleteMoneyReturn } =
    useAppContext();
  const [fromFriendId, setFromFriendId] = useState<string>("");
  const [toFriendId, setToFriendId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleAddReturn = () => {
    if (
      fromFriendId &&
      toFriendId &&
      amount.trim() !== "" &&
      fromFriendId !== toFriendId
    ) {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        addMoneyReturn({
          fromFriendId,
          toFriendId,
          amount: parsedAmount,
          description: description.trim(),
        });
        setFromFriendId("");
        setToFriendId("");
        setAmount("");
        setDescription("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddReturn();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this money return record?")) {
      deleteMoneyReturn(id);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getFriendName = (friendId: string): string => {
    const friend = friends.find((f) => f.id === friendId);
    return friend ? friend.name : "Unknown";
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
                  value={fromFriendId}
                  onChange={(e) => setFromFriendId(e.target.value)}
                  className="friend-select"
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="to-friend">To:</label>
                <select
                  id="to-friend"
                  value={toFriendId}
                  onChange={(e) => setToFriendId(e.target.value)}
                  className="friend-select"
                >
                  <option value="">Select person</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount (€):</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
              {moneyReturns
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((moneyReturn) => (
                  <div key={moneyReturn.id} className="return-card">
                    <div className="return-header">
                      <div className="return-people">
                        <span className="from-person">
                          {getFriendName(moneyReturn.fromFriendId)}
                        </span>
                        <span className="arrow">→</span>
                        <span className="to-person">
                          {getFriendName(moneyReturn.toFriendId)}
                        </span>
                      </div>
                      <div className="return-amount">
                        {moneyReturn.amount.toFixed(2)} €
                      </div>
                    </div>
                    {moneyReturn.description && (
                      <div className="return-description">
                        {moneyReturn.description}
                      </div>
                    )}
                    <div className="return-footer">
                      <span className="return-date">
                        {formatDate(moneyReturn.createdAt)}
                      </span>
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
