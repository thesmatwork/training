
import { useEffect, useMemo, useState } from 'react';
import {
  Droplets,
  Plus,
  Search,
  CalendarDays,
  Trash2,
  Sprout,
} from 'lucide-react';
import { api } from '../services/api.js';
import './SoilIrrigation.css';

const categories = [
  'Soil Test',
  'Irrigation',
  'Moisture',
  'Fertilizer Application',
  'Watering Schedule',
  'Other',
];

const initialForm = {
  title: '',
  category: 'Soil Test',
  field: '',
  ph: '',
  moisture: '',
  irrigationMethod: 'Drip',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

function getRecord(record) {
  return record?.data || record || {};
}

export default function SoilIrrigation() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        setError('');

        const result = await api('/api/v1/soil-irrigation');

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.items)
            ? result.items
            : Array.isArray(result?.records)
              ? result.records
              : [];

        if (active) setRecords(list);
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load soil and irrigation records.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecords();

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter(record => {
      const item = getRecord(record);

      const matchesSearch =
        !query ||
        String(item.title || item.name || '').toLowerCase().includes(query) ||
        String(item.field || '').toLowerCase().includes(query) ||
        String(item.category || '').toLowerCase().includes(query);

      const matchesCategory =
        filter === 'All' || item.category === filter;

      return matchesSearch && matchesCategory;
    });
  }, [records, search, filter]);

  const soilTestCount = records.filter(
    record => getRecord(record).category === 'Soil Test'
  ).length;

  const irrigationCount = records.filter(record =>
    ['Irrigation', 'Watering Schedule', 'Moisture'].includes(
      getRecord(record).category
    )
  ).length;

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
      setError('Please enter a record title.');
      return;
    }

    setSaving(true);

    const recordData = {
      title: form.title.trim(),
      category: form.category,
      field: form.field.trim(),
      ph: form.ph === '' ? null : Number(form.ph),
      moisture: form.moisture === '' ? null : Number(form.moisture),
      irrigation_method: form.irrigationMethod,
      irrigationMethod: form.irrigationMethod,
      date: form.date,
      notes: form.notes.trim(),
    };

    try {
      const result = await api('/api/v1/soil-irrigation', {
        method: 'POST',
        body: JSON.stringify({ data: recordData }),
      });

      const saved = result?.item || result?.record || result;

      setRecords(previous => [saved, ...previous]);

      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setNotice('Record added successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save this record.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    const item = getRecord(record);
    const id = record.id || record.pk || item.id;

    if (!id) {
      setError('This record has no ID. It cannot be deleted yet.');
      return;
    }

    if (!window.confirm(`Delete "${item.title || 'this record'}"?`)) {
      return;
    }

    setError('');
    setNotice('');
    setDeletingId(id);

    try {
      await api(`/api/v1/soil-irrigation/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      setRecords(previous =>
        previous.filter(existing => {
          const existingItem = getRecord(existing);
          const existingId =
            existing.id || existing.pk || existingItem.id;

          return String(existingId) !== String(id);
        })
      );

      setNotice('Record deleted successfully.');
    } catch (err) {
      setError(err.message || 'Unable to delete this record.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="workspace soil-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">MANA POLAM TOOLS</span>
          <h1>Soil &amp; Irrigation</h1>
          <p>
            Monitor soil conditions and keep your irrigation records organised.
          </p>
        </div>
      </div>

      <div className="metric-grid soil-metrics">
        <div className="metric">
          <span className="metric-icon">
            <Sprout size={20} />
          </span>
          <span className="metric-label">Total records</span>
          <b>{records.length}</b>
          <small>Saved soil and irrigation records</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <Sprout size={20} />
          </span>
          <span className="metric-label">Soil tests</span>
          <b>{soilTestCount}</b>
          <small>Soil test records</small>
        </div>

        <div className="metric">
          <span className="metric-icon">
            <Droplets size={20} />
          </span>
          <span className="metric-label">Irrigation records</span>
          <b>{irrigationCount}</b>
          <small>Watering and moisture records</small>
        </div>
      </div>

      <section className="panel soil-form-panel">
        <div className="soil-section-heading">
          <div>
            <h2>Add a record</h2>
            <p>Enter soil test or irrigation information.</p>
          </div>
          <Droplets size={24} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="soil-form-grid">
            <label>
              Record title
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                placeholder="e.g. Field A soil test"
                required
              />
            </label>

            <label>
              Record type
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
              Field / farm name
              <input
                name="field"
                value={form.field}
                onChange={updateForm}
                placeholder="e.g. North field"
              />
            </label>

            <label>
              Record date
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={updateForm}
                required
              />
            </label>

            <label>
              Soil pH (optional)
              <input
                name="ph"
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={form.ph}
                onChange={updateForm}
                placeholder="e.g. 6.5"
              />
            </label>

            <label>
              Soil moisture % (optional)
              <input
                name="moisture"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.moisture}
                onChange={updateForm}
                placeholder="e.g. 35"
              />
            </label>

            <label>
              Irrigation method
              <select
                name="irrigationMethod"
                value={form.irrigationMethod}
                onChange={updateForm}
              >
                <option value="Drip">Drip</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Flood">Flood</option>
                <option value="Manual">Manual</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="soil-notes-field">
              Notes (optional)
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateForm}
                placeholder="Observations, watering duration or test results"
                rows={3}
              />
            </label>
          </div>

          {error && (
            <p className="soil-message soil-error">{error}</p>
          )}

          {notice && (
            <p className="soil-message soil-success">{notice}</p>
          )}

          <div className="soil-form-actions">
            <button
              className="soil-primary-button"
              type="submit"
              disabled={saving}
            >
              <Plus size={17} />
              {saving ? 'Saving...' : 'Add record'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel soil-records-panel">
        <div className="soil-records-heading">
          <div>
            <h2>Saved records</h2>
            <p>Your records for this section</p>
          </div>

          <span className="soil-record-count">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="soil-toolbar">
          <label className="soil-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search records..."
              aria-label="Search records"
            />
          </label>

          <select
            className="soil-category-filter"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            aria-label="Filter by record type"
          >
            <option value="All">All types</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="soil-status">Loading records...</p>
        ) : filteredRecords.length > 0 ? (
          <div className="soil-table-scroll">
            <table className="soil-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Record title</th>
                  <th>Type</th>
                  <th>Field</th>
                  <th>Soil pH</th>
                  <th>Moisture</th>
                  <th>Irrigation</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record, index) => {
                  const item = getRecord(record);
                  const id = record.id || record.pk || item.id || index;

                  return (
                    <tr key={id}>
                      <td>
                        <span className="soil-date">
                          <CalendarDays size={14} />
                          {item.date || '—'}
                        </span>
                      </td>
                      <td className="soil-title-cell">
                        {item.title || item.name || 'Untitled record'}
                      </td>
                      <td>
                        <span className="soil-category-badge">
                          {item.category || 'Other'}
                        </span>
                      </td>
                      <td>{item.field || '—'}</td>
                      <td>{item.ph ?? item.soil_ph ?? '—'}</td>
                      <td>
                        {item.moisture ?? item.moisture_percentage
                          ? `${item.moisture ?? item.moisture_percentage}%`
                          : '—'}
                      </td>
                      <td>
                        {item.irrigationMethod ||
                          item.irrigation_method ||
                          '—'}
                      </td>
                      <td className="soil-notes-cell">
                        {item.notes || '—'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="soil-delete-button"
                          onClick={() => handleDelete(record)}
                          disabled={deletingId !== null}
                          title="Delete record"
                          aria-label="Delete record"
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
          <div className="soil-empty-state">
            <span className="soil-empty-icon">
              <Droplets size={30} />
            </span>
            <h3>
              {search || filter !== 'All'
                ? 'No matching records'
                : 'No records yet'}
            </h3>
            <p>
              {search || filter !== 'All'
                ? 'Try another search or record type.'
                : 'Add your first record above to get started.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
