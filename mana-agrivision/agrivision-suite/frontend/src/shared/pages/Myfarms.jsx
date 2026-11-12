import { useEffect, useState } from 'react';
import { Pencil, Sprout, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import './MyFarms.css';

const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rainfed'];
const SOIL_TYPES = ['Red soil', 'Black soil', 'Alluvial', 'Clay loam', 'Sandy loam'];
const WATER_SOURCES = ['Borewell', 'Canal', 'Open well', 'Farm pond', 'Rainwater'];
const AREA_UNITS = ['acres', 'hectares', 'guntas']; // values the backend receives (lowercase)
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const EMPTY_FORM = { farm_name: '', irrigation_type: '', land_area: '', area_unit: 'acres', location: '', soil_type: '', water_source: '', notes: '' };

// The backend stores generic records as { id, data: {...} }. Support flat records too.
function normalize(item) {
  const d = item.data || item;
  return {
    id: item.id ?? item.pk,
    farm_name: d.farm_name || d.name || d.title || 'Farm',
    irrigation_type: d.irrigation_type || '',
    land_area: d.land_area ?? '',
    area_unit: String(d.area_unit || 'acres').toLowerCase(),
    location: d.location || '',
    soil_type: d.soil_type || '',
    water_source: d.water_source || '',
    notes: d.notes || ''
  };
}

const chip = (prefix, value, options) => {
  const i = options.indexOf(value);
  return `mf-chip ${prefix}-${i >= 0 ? i % 5 : 'x'}`;
};

function SelectField({ id, label, value, options, onChange, error }) {
  return (
    <div className="mf-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} value={value} onChange={onChange} aria-invalid={Boolean(error)}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="mf-error">{error}</p>}
    </div>
  );
}

export default function MyFarms() {
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/api/v1/farms')
      .then((d) => setFarms((Array.isArray(d) ? d : d.items || []).map(normalize)))
      .catch((e) => setApiError(e.message || 'Could not load your farms.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.farm_name.trim()) next.farm_name = 'Enter a farm name.';
    if (!form.irrigation_type) next.irrigation_type = 'Choose an irrigation type.';
    if (!form.land_area || Number(form.land_area) <= 0) next.land_area = 'Enter an area greater than 0.';
    if (!form.location.trim()) next.location = 'Enter the farm location.';
    if (!form.soil_type) next.soil_type = 'Choose a soil type.';
    if (!form.water_source) next.water_source = 'Choose a water source.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => { setForm(EMPTY_FORM); setErrors({}); setEditingId(null); };

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(''); setNotice('');
    if (!validate()) return;

    const record = { ...form, farm_name: form.farm_name.trim(), location: form.location.trim(), land_area: Number(form.land_area) };
    // The farms endpoint expects flat fields: farm_name, location, land_area, area_unit, soil_type, water_source, irrigation_type, notes
    const payload = record;

    setSaving(true);
    try {
      if (editingId) {
        await api(`/api/v1/farms/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        setFarms((p) => p.map((f) => (f.id === editingId ? { ...record, id: editingId } : f)));
        setNotice('Farm updated.');
      } else {
        const r = await api('/api/v1/farms', { method: 'POST', body: JSON.stringify(payload) });
        setFarms((p) => [{ ...record, id: r?.id ?? r?.pk ?? crypto.randomUUID() }, ...p]);
        setNotice('Farm saved.');
      }
      resetForm();
    } catch (err) {
      setApiError(err.message || 'Could not save this farm.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(farm) {
    const { id, ...values } = farm;
    setForm({ ...values, land_area: String(values.land_area) });
    setEditingId(id); setErrors({}); setNotice(''); setApiError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(farm) {
    if (!window.confirm(`Delete "${farm.farm_name}"?`)) return;
    setApiError(''); setNotice('');
    try {
      await api(`/api/v1/farms/${farm.id}`, { method: 'DELETE' });
      setFarms((p) => p.filter((f) => f.id !== farm.id));
      if (editingId === farm.id) resetForm();
      setNotice('Farm deleted.');
    } catch (err) {
      setApiError(err.message || 'Could not delete this farm.');
    }
  }

  return (
    <div className="mf">
      <div className="mf-heading">
        <span className="mf-eyebrow">MANA POLAM TOOLS</span>
        <h1>My farms</h1>
        <p>Keep your farming information organised and easy to find.</p>
      </div>

      <form className="mf-card mf-form" onSubmit={handleSubmit} noValidate>
        <h2>{editingId ? 'Edit farm' : 'Add a farm'}</h2>
        <div className="mf-grid">
          <div className="mf-field">
            <label htmlFor="farm_name">Farm name</label>
            <input id="farm_name" name="farm_name" type="text" placeholder="Enter farm name" value={form.farm_name} onChange={handleChange} aria-invalid={Boolean(errors.farm_name)} />
            {errors.farm_name && <p className="mf-error">{errors.farm_name}</p>}
          </div>

          <SelectField id="irrigation_type" label="Irrigation type" value={form.irrigation_type} options={IRRIGATION_TYPES} onChange={handleChange} error={errors.irrigation_type} />

          <div className="mf-field">
            <label htmlFor="land_area">Land area</label>
            <div className="mf-area">
              <input id="land_area" name="land_area" type="number" min="0" step="0.1" placeholder="0.0" value={form.land_area} onChange={handleChange} aria-invalid={Boolean(errors.land_area)} />
              <select name="area_unit" aria-label="Area unit" value={form.area_unit} onChange={handleChange}>
                {AREA_UNITS.map((u) => <option key={u} value={u}>{cap(u)}</option>)}
              </select>
            </div>
            {errors.land_area && <p className="mf-error">{errors.land_area}</p>}
          </div>

          <div className="mf-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" placeholder="Village, district, state" value={form.location} onChange={handleChange} aria-invalid={Boolean(errors.location)} />
            {errors.location && <p className="mf-error">{errors.location}</p>}
          </div>

          <SelectField id="soil_type" label="Soil type" value={form.soil_type} options={SOIL_TYPES} onChange={handleChange} error={errors.soil_type} />
          <SelectField id="water_source" label="Water source" value={form.water_source} options={WATER_SOURCES} onChange={handleChange} error={errors.water_source} />

          <div className="mf-field mf-wide">
            <label htmlFor="notes">Notes (optional)</label>
            <input id="notes" name="notes" type="text" placeholder="Anything else worth remembering" value={form.notes} onChange={handleChange} />
          </div>
        </div>

        {apiError && <div className="mf-banner mf-banner-error">{apiError}</div>}
        {notice && <div className="mf-banner mf-banner-ok">{notice}</div>}

        <div className="mf-actions">
          <button type="button" className="mf-btn mf-btn-ghost" onClick={resetForm}>{editingId ? 'Cancel' : 'Clear'}</button>
          <button type="submit" className="mf-btn mf-btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : '+ Add farm'}</button>
        </div>
      </form>

      <section className="mf-card mf-table-card" aria-labelledby="mf-saved">
        <div className="mf-table-head">
          <div>
            <h2 id="mf-saved">Saved records</h2>
            <p>Your farms at a glance</p>
          </div>
          <span className="mf-pill">{farms.length} {farms.length === 1 ? 'record' : 'records'}</span>
        </div>

        {loading ? (
          <p className="mf-loading">Loading your farms…</p>
        ) : farms.length === 0 ? (
          <div className="mf-empty">
            <Sprout size={32} />
            <h3>No records yet</h3>
            <p>Add your first record above to get started.</p>
          </div>
        ) : (
          <div className="mf-table-wrap">
            <table className="mf-table">
              <thead>
                <tr>
                  <th>Farm name</th><th>Irrigation type</th><th>Land area</th><th>Location</th><th>Soil type</th><th>Water source</th>
                  <th><span className="mf-sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {farms.map((f) => (
                  <tr key={f.id}>
                    <td><div className="mf-name"><span className="mf-dot" />{f.farm_name}</div></td>
                    <td>{f.irrigation_type && <span className={chip('mf-irr', f.irrigation_type, IRRIGATION_TYPES)}>{f.irrigation_type}</span>}</td>
                    <td className="mf-strong">{f.land_area} {f.area_unit}</td>
                    <td>{f.location}</td>
                    <td>{f.soil_type}</td>
                    <td>{f.water_source && <span className={chip('mf-wat', f.water_source, WATER_SOURCES)}>{f.water_source}</span>}</td>
                    <td className="mf-row-actions">
                      <button type="button" className="mf-icon-btn" aria-label={`Edit ${f.farm_name}`} onClick={() => handleEdit(f)}><Pencil size={16} /></button>
                      <button type="button" className="mf-icon-btn" aria-label={`Delete ${f.farm_name}`} onClick={() => handleDelete(f)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
