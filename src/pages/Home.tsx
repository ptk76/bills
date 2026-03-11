import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home(): React.JSX.Element {
  const { bills, currentBillId, createBill, deleteBill, selectBill } = useAppContext();
  const [billTitle, setBillTitle] = useState<string>('');
  const navigate = useNavigate();

  const handleCreateBill = () => {
    if (billTitle.trim() !== '') {
      createBill(billTitle);
      setBillTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateBill();
    }
  };

  const handleSelectBill = (billId: string) => {
    selectBill(billId);
    navigate('/about');
  };

  const handleDeleteBill = (billId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this bill?')) {
      deleteBill(billId);
    }
  };

  const calculateBillTotal = (billId: string): number => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return 0;
    return bill.items.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div className="home-container">
      <h1>Bill Manager</h1>
      <p>Welcome to your bill management application!</p>
      <p>Create and manage bills, add items, and split costs with friends.</p>

      <div className="bills-section">
        <h2>Your Bills</h2>

        <div className="create-bill-form">
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter bill title (e.g., Dinner Party, Trip to Paris)"
            className="bill-title-input"
          />
          <button onClick={handleCreateBill} className="create-bill-button">
            Create Bill
          </button>
        </div>

        {bills.length > 0 ? (
          <div className="bills-list">
            {bills.map((bill) => {
              const total = calculateBillTotal(bill.id);
              const isSelected = bill.id === currentBillId;
              return (
                <div
                  key={bill.id}
                  className={`bill-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectBill(bill.id)}
                >
                  <div className="bill-header">
                    <h3>{bill.title}</h3>
                    {isSelected && <span className="current-badge">Current</span>}
                  </div>
                  <div className="bill-info">
                    <div className="bill-stats">
                      <span className="stat-item">
                        <strong>{bill.items.length}</strong> items
                      </span>
                      <span className="stat-item">
                        <strong>{bill.names.length}</strong> people
                      </span>
                    </div>
                    <div className="bill-total">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                  <div className="bill-actions">
                    <button
                      onClick={(e) => handleDeleteBill(bill.id, e)}
                      className="delete-bill-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No bills yet. Create your first bill above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
