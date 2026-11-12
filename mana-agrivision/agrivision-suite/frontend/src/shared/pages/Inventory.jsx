import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Boxes,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api.js';
import './Inventory.css';

const categories = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Tools',
  'Equipment',
  'Harvest',
  'Other',
];

const units = [
  'kg',
  'g',
  'litres',
  'ml',
  'bags',
  'pieces',
  'packets',
  'boxes',
];

const initialForm = {
  name: '',
  category: 'Seeds',
  quantity: '',
  unit: 'kg',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

function getItem(record) {
  return record?.data || record || {};
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function loadInventory() {
    try {
      setError('');

      const result = await api('/api/v1/inventory');

      const records = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
          ? result.items
          : Array.isArray(result?.records)
            ? result.records
            : [];

      setItems(records);
    } catch (err) {
      setError(err.message || 'Could not load inventory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter(record => {
      const item = getItem(record);

      const matchesSearch =
        !query ||
        String(item.name || item.title || '')
          .toLowerCase()
          .includes(query) ||
        String(item.category || '')
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        filter === 'All' || item.category === filter;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, filter]);

  const totalQuantity = useMemo(() => {
    return items.reduce((total, record) => {
      return total + (Number(getItem(record).quantity) || 0);
    }, 0);
  }, [items]);

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

    if (!form.name.trim()) {
      setError('Please enter an item name.');
      return;
    }

    if (form.quantity === '' || Number(form.quantity) <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }

    setSaving(true);

    const inventoryData = {
      name: form.name.trim(),
      title: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      date: form.date,
      notes: form.notes.trim(),
      description: form.notes.trim(),
    };

    try {
      const result = await api('/api/v1/inventory', {
        method: 'POST',
        body: JSON.stringify({ data: inventoryData }),
      });

      const savedItem = result?.item || result?.record || result;

      setItems(previous => [savedItem, ...previous]);

      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setNotice('Inventory item added successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save inventory item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    const item = getItem(record);
    const id = record.id || record.pk || item.id;

    if (!id) {
      setError('This record has no ID. It cannot be deleted yet.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.name || item.title || 'this item'}" from inventory?`
    );

    if (!confirmed) return;

    setError('');
    setNotice('');
    setDeletingId(id);

    try {
      await api(`/api/v1/inventory/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      setItems(previous =>
        previous.filter(existing => {
          const existingItem = getItem(existing);
          const existingId =
            existing.id || existing.pk || existingItem.id;

          return String(existingId) !== String(id);
        })
      );

      setNotice('Inventory item deleted.');
    } catch (err) {
      setError(err.message || 'Unable to delete inventory item.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="workspace inventory-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">MANA POLAM TOOLS</span>
          <h1>Inventory</h1>
          <p>Keep your farming information organised and easy to find.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="metric-grid inventory-metrics">
        <div className="metric">
          <span className="metric-icon">
            <Package size={20} />
          </span>
          <span className="metric-label">Total items</span>
          <b>{items.length}</b>
          <small>Saved inventory records</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <Boxes size={20} />
          </span>
          <span className="metric-label">Total quantity</span>
          <b>{totalQuantity.toLocaleString('en-IN')}</b>
          <small>Combined recorded quantities</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <Package size={20} />
          </span>
          <span className="metric-label">Categories</span>
          <b>{new Set(items.map(record => getItem(record).category).filter(Boolean)).size}</b>
          <small>Categories in use</small>
        </div>
      </div>

      {/* Add inventory form */}
      <section className="panel inventory-form-panel">
        <div className="inventory-section-heading">
          <div>
            <h2>Add inventory item</h2>
            <p>Enter the details of your farm stock.</p>
          </div>

          <span className="inventory-heading-icon">
            <Plus size={22} />
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inventory-form-grid">
            <label>
              Item name
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                placeholder="e.g. Tomato seeds"
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
              Quantity
              <input
                name="quantity"
                type="number"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={updateForm}
                placeholder="Enter quantity"
                required
              />
            </label>

            <label>
              Unit
              <select
                name="unit"
                value={form.unit}
                onChange={updateForm}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date added
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={updateForm}
                required
              />
            </label>

            <label className="inventory-notes-field">
              Notes (optional)
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateForm}
                placeholder="Supplier, brand or other details"
                rows={3}
              />
            </label>
          </div>

          {error && (
            <p className="inventory-message inventory-error">{error}</p>
          )}

          {notice && (
            <p className="inventory-message inventory-success">
              {notice}
            </p>
          )}

          <div className="inventory-form-actions">
            <button
              className="inventory-primary-button"
              type="submit"
              disabled={saving}
            >
              <Plus size={17} />
              {saving ? 'Saving...' : 'Add record'}
            </button>
          </div>
        </form>
      </section>

      {/* Saved inventory table */}
      <section className="panel inventory-records-panel">
        <div className="inventory-records-heading">
          <div>
            <h2>Saved records</h2>
            <p>Your records for this section</p>
          </div>

          <span className="inventory-record-count">
            {filteredItems.length} records
          </span>
        </div>

        <div className="inventory-toolbar">
          <label className="inventory-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search inventory..."
              aria-label="Search inventory"
            />
          </label>

          <select
            className="inventory-category-filter"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="inventory-status">Loading inventory...</p>
        ) : filteredItems.length > 0 ? (
          <div className="inventory-table-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Date added</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((record, index) => {
                  const item = getItem(record);
                  const id = record.id || record.pk || item.id || index;

                  return (
                    <tr key={id}>
                      <td className="inventory-item-name">
                        <span className="inventory-item-icon">
                          <Package size={17} />
                        </span>
                        {item.name || item.title || 'Unnamed item'}
                      </td>

                      <td>
                        <span className="inventory-category-badge">
                          {item.category || 'Other'}
                        </span>
                      </td>

                      <td className="inventory-quantity">
                        {Number(item.quantity) || 0} {item.unit || ''}
                      </td>

                      <td>
                        <span className="inventory-date">
                          <CalendarDays size={14} />
                          {item.date || '—'}
                        </span>
                      </td>

                      <td className="inventory-table-notes">
                        {item.notes || item.description || '—'}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inventory-delete-button"
                          onClick={() => handleDelete(record)}
                          disabled={deletingId !== null}
                          aria-label={`Delete ${item.name || item.title || 'item'}`}
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inventory-empty-state">
            <span className="inventory-empty-icon">
              <Package size={30} />
            </span>

            <h3>{search || filter !== 'All' ? 'No matching items' : 'No records yet'}</h3>

            <p>
              {search || filter !== 'All'
                ? 'Try changing your search or category filter.'
                : 'Add your first record above to get started.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}