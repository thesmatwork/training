import { useEffect, useMemo, useState } from 'react';
import { Eye, Sprout } from 'lucide-react';
import { api } from '../services/api.js';
import './CropRecords.css';

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Perennial'];
const STAGES = ['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest-ready', 'Harvested'];
const STAGE_PROGRESS = [5, 20, 40, 60, 80, 95, 100];

const EMPTY_FORM = {
  crop_name: '', variety: '', farm_id: '', season: '',
  sowing_date: '', expected_harvest_date: '', area: '', growth_stage: '',
  health_status: 'Healthy', notes: ''
};

/*
  FIELD MAPPING: if your backend uses different field names, change them ONLY here.
  Check http://127.0.0.1:8000/docs -> POST /api/v1/crops for the exact schema.
*/
function normalize(item) {
  const d = item.data || item;
  return {
    id: item.id ?? item.pk,
    crop_name: d.crop_name || d.name || d.title || 'Crop',
    variety: d.variety || '',
    farm_id: d.farm_id ?? '',
    season: d.season || '',
    sowing_date: d.sowing_date || '',
    expected_harvest_date: d.expected_harvest_date || d.harvest_date || '',
    area: d.area ?? d.land_area ?? '',
    growth_stage: d.growth_stage || d.stage || '',
    health_status: d.health_status || 'Healthy',
    notes: d.notes || ''
  };
}

function toPayload(record) {
  return {
    crop_name: record.crop_name,
    variety: record.variety,
    farm_id: record.farm_id === '' ? null : record.farm_id,
    season: record.season,
    sowing_date: record.sowing_date || null,
    expected_harvest_date: record.expected_harvest_date || null,
    area: record.area,
    growth_stage: record.growth_stage,
    health_status: record.health_status,
    notes: record.notes || ''
  };
}

const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtShort = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
const stageClass = (stage) => `cr-chip cr-stage-${Math.max(STAGES.indexOf(stage), 0) % 5}`;

function Field({ id, label, error, children }) {
  return (
    <div className="cr-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="cr-error">{error}</p>}
    </div>
  );
}

export default function CropRecords() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.allSettled([api('/api/v1/crops'), api('/api/v1/farms')]).then(([c, f]) => {
      if (c.status === 'fulfilled') {
        const list = (Array.isArray(c.value) ? c.value : c.value.items || []).map(normalize);
        setCrops(list);
        if (list.length) setSelectedId(list[0].id);
      } else {
        setApiError(c.reason?.message || 'Could not load your crops.');
      }
      if (f.status === 'fulfilled') {
        setFarms((Array.isArray(f.value) ? f.value : f.value.items || []).map((x) => {
          const d = x.data || x;
          return { id: x.id ?? x.pk, name: d.farm_name || d.name || d.title || 'Farm' };
        }));
      }
      setLoading(false);
    });
  }, []);

  const farmName = (id) => farms.find((f) => String(f.id) === String(id))?.name || '—';
  const selected = crops.find((c) => c.id === selectedId) || null;

  const stats = useMemo(() => {
    const today = new Date();
    const in30 = new Date(); in30.setDate(today.getDate() + 30);
    const growing = crops.filter((c) => c.growth_stage !== 'Harvested');
    return {
      growing: growing.length,
      harvestSoon: growing.filter((c) => {
        const d = new Date(c.expected_harvest_date);
        return !Number.isNaN(d.getTime()) && d >= today && d <= in30;
      }).length,
      attention: growing.filter((c) => c.health_status !== 'Healthy').length
    };
  }, [crops]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.crop_name.trim()) next.crop_name = 'Enter a crop name.';
    if (!form.farm_id) next.farm_id = farms.length ? 'Choose a farm.' : 'Add a farm first in My farms.';
    if (!form.season) next.season = 'Choose a season.';
    if (!form.sowing_date) next.sowing_date = 'Pick the sowing date.';
    if (form.expected_harvest_date && form.sowing_date && form.expected_harvest_date < form.sowing_date)
      next.expected_harvest_date = 'Harvest must be after sowing.';
    if (!form.area || Number(form.area) <= 0) next.area = 'Enter an area greater than 0.';
    if (!form.growth_stage) next.growth_stage = 'Choose a growth stage.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => { setForm(EMPTY_FORM); setErrors({}); setEditingId(null); };

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(''); setNotice('');
    if (!validate()) return;

    const farm = farms.find((f) => String(f.id) === String(form.farm_id));
    const record = { ...form, crop_name: form.crop_name.trim(), variety: form.variety.trim(), farm_id: farm ? farm.id : form.farm_id, area: Number(form.area) };

    setSaving(true);
    try {
      if (editingId) {
        await api(`/api/v1/crops/${editingId}`, { method: 'PUT', body: JSON.stringify(toPayload(record)) });
        setCrops((p) => p.map((c) => (c.id === editingId ? { ...record, id: editingId } : c)));
        setNotice('Crop updated.');
      } else {
        const r = await api('/api/v1/crops', { method: 'POST', body: JSON.stringify(toPayload(record)) });
        const id = r?.id ?? r?.pk ?? crypto.randomUUID();
        setCrops((p) => [{ ...record, id }, ...p]);
        setSelectedId(id);
        setNotice('Crop saved.');
      }
      resetForm();
    } catch (err) {
      setApiError(err.message || 'Could not save this crop.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(crop) {
    const { id, ...values } = crop;
    setForm({ ...values, area: String(values.area), farm_id: String(values.farm_id) });
    setEditingId(id); setErrors({}); setNotice(''); setApiError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleHarvested(crop) {
    setApiError(''); setNotice('');
    const updated = { ...crop, growth_stage: 'Harvested' };
    try {
      await api(`/api/v1/crops/${crop.id}`, { method: 'PUT', body: JSON.stringify(toPayload(updated)) });
      setCrops((p) => p.map((c) => (c.id === crop.id ? updated : c)));
      setNotice(`${crop.crop_name} marked as harvested.`);
    } catch (err) {
      setApiError(err.message || 'Could not update this crop.');
    }
  }

  const stageIndex = selected ? Math.max(STAGES.indexOf(selected.growth_stage), 0) : 0;

  return (
    <div className="cr">
      <div className="cr-head">
        <div>
          <span className="cr-eyebrow">MANA POLAM TOOLS</span>
          <h1>Crop records</h1>
          <p>Track what you have sown, how it is growing and when to harvest.</p>
        </div>
        <div className="cr-tiles">
          <div className="cr-tile"><small>Crops growing</small><b>{stats.growing}</b></div>
          <div className="cr-tile"><small>Harvest in 30 days</small><b>{stats.harvestSoon}</b></div>
          <div className="cr-tile"><small>Need attention</small><b className={stats.attention ? 'cr-warn' : ''}>{stats.attention}</b></div>
        </div>
      </div>

      <form className="cr-card cr-form" onSubmit={handleSubmit} noValidate>
        <h2>{editingId ? 'Edit crop' : 'Add a crop'}</h2>
        <div className="cr-grid">
          <Field id="crop_name" label="Crop name" error={errors.crop_name}>
            <input id="crop_name" name="crop_name" type="text" placeholder="Enter crop name" value={form.crop_name} onChange={handleChange} aria-invalid={Boolean(errors.crop_name)} />
          </Field>
          <Field id="variety" label="Variety">
            <input id="variety" name="variety" type="text" placeholder="e.g. Sona Masori" value={form.variety} onChange={handleChange} />
          </Field>
          <Field id="farm_id" label="Farm" error={errors.farm_id}>
            <select id="farm_id" name="farm_id" value={form.farm_id} onChange={handleChange} aria-invalid={Boolean(errors.farm_id)}>
              <option value="">{farms.length ? 'Select farm' : 'No farms yet'}</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </Field>
          <Field id="season" label="Season" error={errors.season}>
            <select id="season" name="season" value={form.season} onChange={handleChange} aria-invalid={Boolean(errors.season)}>
              <option value="">Select season</option>
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="sowing_date" label="Sowing date" error={errors.sowing_date}>
            <input id="sowing_date" name="sowing_date" type="date" value={form.sowing_date} onChange={handleChange} aria-invalid={Boolean(errors.sowing_date)} />
          </Field>
          <Field id="expected_harvest_date" label="Expected harvest" error={errors.expected_harvest_date}>
            <input id="expected_harvest_date" name="expected_harvest_date" type="date" value={form.expected_harvest_date} onChange={handleChange} aria-invalid={Boolean(errors.expected_harvest_date)} />
          </Field>
          <Field id="area" label="Area under crop (acres)" error={errors.area}>
            <input id="area" name="area" type="number" min="0" step="0.1" placeholder="0.0" value={form.area} onChange={handleChange} aria-invalid={Boolean(errors.area)} />
          </Field>
          <Field id="growth_stage" label="Growth stage" error={errors.growth_stage}>
            <select id="growth_stage" name="growth_stage" value={form.growth_stage} onChange={handleChange} aria-invalid={Boolean(errors.growth_stage)}>
              <option value="">Select growth stage</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="cr-field cr-wide">
            <label htmlFor="notes">Notes (optional)</label>
            <input id="notes" name="notes" type="text" placeholder="Fertiliser plan, pests seen, reminders" value={form.notes} onChange={handleChange} />
          </div>
        </div>

        {apiError && <div className="cr-banner cr-banner-error">{apiError}</div>}
        {notice && <div className="cr-banner cr-banner-ok">{notice}</div>}

        <div className="cr-actions">
          <button type="button" className="cr-btn cr-btn-ghost" onClick={resetForm}>{editingId ? 'Cancel' : 'Clear'}</button>
          <button type="submit" className="cr-btn cr-btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : '+ Add crop'}</button>
        </div>
      </form>

      <div className="cr-split">
        <section className="cr-card cr-list" aria-labelledby="cr-saved">
          <div className="cr-list-head">
            <div>
              <h2 id="cr-saved">Saved crops</h2>
              <p>Select a crop to see its full details</p>
            </div>
            <span className="cr-pill">{crops.length} {crops.length === 1 ? 'record' : 'records'}</span>
          </div>

          {loading ? (
            <p className="cr-loading">Loading your crops…</p>
          ) : crops.length === 0 ? (
            <div className="cr-empty">
              <Sprout size={32} />
              <h3>No records yet</h3>
              <p>Add your first crop above to get started.</p>
            </div>
          ) : (
            <div className="cr-table-wrap">
              <table className="cr-table">
                <thead>
                  <tr><th>Crop</th><th>Farm</th><th>Season</th><th>Sowing → harvest</th><th>Growth stage</th><th>Health</th><th><span className="cr-sr">Actions</span></th></tr>
                </thead>
                <tbody>
                  {crops.map((c) => {
                    const idx = Math.max(STAGES.indexOf(c.growth_stage), 0);
                    const ok = c.health_status === 'Healthy';
                    return (
                      <tr key={c.id} className={c.id === selectedId ? 'cr-selected' : ''} onClick={() => setSelectedId(c.id)}>
                        <td>
                          <div className="cr-crop">
                            <span className="cr-initial">{c.crop_name.charAt(0).toUpperCase()}</span>
                            <span><b>{c.crop_name}</b><small>{c.variety || '—'}</small></span>
                          </div>
                        </td>
                        <td>{farmName(c.farm_id)}</td>
                        <td>{c.season}</td>
                        <td className="cr-dates">{fmtShort(c.sowing_date)} → {fmtShort(c.expected_harvest_date)}</td>
                        <td>
                          <span className={stageClass(c.growth_stage)}>{c.growth_stage || '—'}</span>
                          <div className="cr-bar" aria-hidden="true"><i style={{ width: `${STAGE_PROGRESS[idx]}%` }} /></div>
                        </td>
                        <td><span className={`cr-health ${ok ? 'cr-ok' : 'cr-bad'}`}>{c.health_status}</span></td>
                        <td className="cr-row-actions">
                          <button type="button" className="cr-view" onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}>
                            <Eye size={15} /> View details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="cr-card cr-details" aria-label="Crop details">
          {selected ? (
            <>
              <div className="cr-details-head">
                <span className="cr-initial cr-initial-lg">{selected.crop_name.charAt(0).toUpperCase()}</span>
                <div>
                  <h2>{selected.crop_name}</h2>
                  <p>{[selected.variety, farmName(selected.farm_id)].filter((x) => x && x !== '—').join(' · ')}</p>
                </div>
              </div>

              <div className="cr-stats">
                <div><small>Season</small><b>{selected.season || '—'}</b></div>
                <div><small>Area</small><b>{selected.area} acres</b></div>
                <div><small>Sown on</small><b>{fmt(selected.sowing_date)}</b></div>
                <div><small>Harvest by</small><b>{fmt(selected.expected_harvest_date)}</b></div>
                <div><small>Growth stage</small><b>{selected.growth_stage || '—'}</b></div>
                <div><small>Health</small><b>{selected.health_status}</b></div>
              </div>

              <h3>Growth timeline</h3>
              <ul className="cr-timeline">
                {STAGES.map((s, i) => (
                  <li key={s} className={i < stageIndex ? 'done' : i === stageIndex ? 'now' : ''}>
                    <span /><div><b>{s}</b>{i === stageIndex && <small>Current stage</small>}</div>
                  </li>
                ))}
              </ul>

              {selected.notes && (<><h3>Notes</h3><p className="cr-notes">{selected.notes}</p></>)}

              <div className="cr-details-actions">
                <button type="button" className="cr-btn cr-btn-ghost" onClick={() => handleEdit(selected)}>Edit crop</button>
                <button type="button" className="cr-btn cr-btn-primary" disabled={selected.growth_stage === 'Harvested'} onClick={() => handleHarvested(selected)}>Mark harvested</button>
              </div>
            </>
          ) : (
            <div className="cr-empty">
              <Sprout size={32} />
              <h3>No crop selected</h3>
              <p>Choose a crop from the list to see its details here.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}