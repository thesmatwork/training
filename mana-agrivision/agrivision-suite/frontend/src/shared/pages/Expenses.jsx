
import { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Plus,
  IndianRupee,
  CalendarDays,
  ReceiptText,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api.js';
import './Expenses.css';

const categories = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Labour',
  'Irrigation',
  'Equipment',
  'Transport',
  'Other',
];

const initialForm = {
  title: '',
  category: 'Seeds',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

const getExpense = record => record?.data || record || {};

const formatAmount = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let active = true;

    async function loadExpenses() {
      try {
        setError('');
        const result = await api('/api/v1/expenses');

        const records = Array.isArray(result)
          ? result
          : Array.isArray(result?.items)
            ? result.items
            : [];

        if (active) setExpenses(records);
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load expenses.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadExpenses();

    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(
    () =>
      expenses.reduce((sum, record) => {
        return sum + (Number(getExpense(record).amount) || 0);
      }, 0),
    [expenses]
  );

  const thisMonthTotal = useMemo(() => {
    const now = new Date();

    return expenses.reduce((sum, record) => {
      const item = getExpense(record);
      const date = new Date(item.date || item.created_at);

      if (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        return sum + (Number(item.amount) || 0);
      }

      return sum;
    }, 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (filter === 'All') return expenses;

    return expenses.filter(
      record => getExpense(record).category === filter
    );
  }, [expenses, filter]);

  function updateForm(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!form.title.trim()) {
      setError('Please enter an expense name.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter an amount greater than zero.');
      return;
    }

    setSaving(true);

    const expenseData = {
      title: form.title.trim(),
      name: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      notes: form.notes.trim(),
      description: form.notes.trim(),
    };

    try {
      const result = await api('/api/v1/expenses', {
        method: 'POST',
        body: JSON.stringify({ data: expenseData }),
      });

      const savedRecord = result?.item || result?.expense || result;

      setExpenses(previous => [savedRecord, ...previous]);

      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setNotice('Expense saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save the expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="workspace expenses-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">MANA POLAM TOOLS</span>
          <h1>Farm Expenses</h1>
          <p>Track your farming costs and manage your spending.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span className="metric-icon">
            <Wallet size={20} />
          </span>
          <span className="metric-label">Total expenses</span>
          <b>{formatAmount(total)}</b>
          <small>All saved records</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <IndianRupee size={20} />
          </span>
          <span className="metric-label">This month</span>
          <b>{formatAmount(thisMonthTotal)}</b>
          <small>Expenses recorded this month</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <ReceiptText size={20} />
          </span>
          <span className="metric-label">Records</span>
          <b>{expenses.length}</b>
          <small>Total expense entries</small>
        </div>
      </div>

      {/* Add expense form */}
      <form
        className="panel expense-create-form"
        onSubmit={handleSubmit}
      >
        <div className="expense-form-heading">
          <div>
            <h2>Add an expense</h2>
            <p>Enter the details of your farm spending.</p>
          </div>
          <Plus size={24} />
        </div>

        <div className="expense-form-grid">
          <label>
            Expense name
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              placeholder="e.g. Fertilizer purchase"
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={updateForm}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount (₹)
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={updateForm}
              placeholder="Enter amount"
              required
            />
          </label>

          <label>
            Expense date
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={updateForm}
              required
            />
          </label>

          <label className="expense-notes">
            Notes (optional)
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateForm}
              placeholder="Quantity, supplier or other details"
              rows={3}
            />
          </label>
        </div>

        {error && <p className="error-note">{error}</p>}
        {notice && <p className="success-note">{notice}</p>}

        <div className="expense-submit-row">
          <button
            className="btn-primary"
            type="submit"
            disabled={saving}
          >
            <Plus size={17} />
            {saving ? 'Saving...' : 'Save expense'}
          </button>
        </div>
      </form>

      {/* Expense history table */}
      <section className="panel expense-history-panel">
        <div className="expense-history-heading">
          <div>
            <h2>Expense history</h2>
            <p>Review your saved farm spending.</p>
          </div>

          <span className="count-pill">
            {filteredExpenses.length} records
          </span>
        </div>

        <div className="expense-filter">
          <label>
            Filter by category
            <select
              value={filter}
              onChange={event => setFilter(event.target.value)}
            >
              <option value="All">All categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="expense-status">Loading expenses...</p>
        ) : filteredExpenses.length > 0 ? (
          <div className="expense-table-scroll">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense name</th>
                  <th>Category</th>
                  <th>Notes</th>
                  <th className="expense-amount-cell">Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((record, index) => {
                  const item = getExpense(record);

                  return (
                    <tr key={record.id || record.pk || index}>
                      <td>
                        <span className="expense-date-cell">
                          <CalendarDays size={15} />
                          {item.date || '—'}
                        </span>
                      </td>
                      <td className="expense-name-cell">
                        {item.title || item.name || 'Farm expense'}
                      </td>
                      <td>
                        <span className="expense-category-badge">
                          {item.category || 'Other'}
                        </span>
                      </td>
                      <td className="expense-notes-cell">
                        {item.notes || item.description || '—'}
                      </td>
                      <td className="expense-amount-cell">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state expense-empty-state">
            <Wallet size={36} />
            <h3>No expenses recorded yet</h3>
            <p>
              Add your first expense using the form above.
              Saved expenses will appear in this table.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
