import { useEffect, useMemo, useState } from 'react';
import { Check, Sprout, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import './farmtasks.css';

const CATEGORIES = ['Irrigation', 'Fertiliser', 'Spraying', 'Weeding', 'Sowing', 'Harvesting', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const EMPTY_FORM = { title: '', category: '', farm_id: '', due_date: '', priority: 'Medium' };

/*
  FIELD MAPPING: if your backend uses different field names, change them ONLY here.
  Check http://127.0.0.1:8000/docs -> POST /api/v1/tasks for the exact schema.
*/
function normalize(item) {
  const d = item.data || item;
  const done = d.status ? ['completed', 'done'].includes(String(d.status).toLowerCase()) : Boolean(d.completed);
  return {
    id: item.id ?? item.pk,
    title: d.title || d.name || 'Task',
    category: d.category || 'Other',
    farm_id: d.farm_id ?? '',
    due_date: d.due_date || '',
    priority: d.priority || 'Medium',
    status: done ? 'completed' : 'pending'
  };
}

function toPayload(task) {
  return {
    title: task.title,
    category: task.category,
    farm_id: task.farm_id === '' ? null : task.farm_id,
    due_date: task.due_date || null,
    priority: task.priority,
    status: task.status
  };
}

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());

function daysFromToday(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - start) / 86400000);
}

function dueLabel(task) {
  const diff = daysFromToday(task.due_date);
  if (diff === null) return { text: 'No due date', overdue: false };
  if (task.status === 'completed') return { text: 'Done', overdue: false };
  if (diff < 0) return { text: `Overdue by ${-diff} ${diff === -1 ? 'day' : 'days'}`, overdue: true };
  if (diff === 0) return { text: 'Today', overdue: false };
  if (diff === 1) return { text: 'Tomorrow', overdue: false };
  const [y, m, d] = task.due_date.split('-').map(Number);
  return { text: new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), overdue: false };
}

export default function FarmTasks() {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.allSettled([api('/api/v1/tasks'), api('/api/v1/farms')]).then(([t, f]) => {
      if (t.status === 'fulfilled') {
        setTasks((Array.isArray(t.value) ? t.value : t.value.items || []).map(normalize));
      } else {
        setApiError(t.reason?.message || 'Could not load your tasks.');
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

  const farmName = (id) => farms.find((f) => String(f.id) === String(id))?.name || '';

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending');
    return {
      todo: pending.length,
      today: pending.filter((t) => daysFromToday(t.due_date) === 0).length,
      overdue: pending.filter((t) => { const d = daysFromToday(t.due_date); return d !== null && d < 0; }).length,
      done: tasks.length - pending.length
    };
  }, [tasks]);

  const visible = useMemo(() => {
    const list = tasks.filter((t) => filter === 'all' || (filter === 'todo' ? t.status === 'pending' : t.status === 'completed'));
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return (a.due_date || '9999').localeCompare(b.due_date || '9999');
    });
  }, [tasks, filter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Enter a task title.';
    if (!form.category) next.category = 'Choose a category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(''); setNotice('');
    if (!validate()) return;

    const farm = farms.find((f) => String(f.id) === String(form.farm_id));
    const task = { ...form, title: form.title.trim(), farm_id: farm ? farm.id : '', status: 'pending' };

    setSaving(true);
    try {
      const r = await api('/api/v1/tasks', { method: 'POST', body: JSON.stringify(toPayload(task)) });
      setTasks((p) => [{ ...task, id: r?.id ?? r?.pk ?? crypto.randomUUID() }, ...p]);
      setForm(EMPTY_FORM);
      setErrors({});
      setNotice('Task added.');
    } catch (err) {
      setApiError(err.message || 'Could not save this task.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(task) {
    setApiError(''); setNotice('');
    const updated = { ...task, status: task.status === 'completed' ? 'pending' : 'completed' };
    setTasks((p) => p.map((t) => (t.id === task.id ? updated : t))); // update instantly
    try {
      await api(`/api/v1/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(toPayload(updated)) });
    } catch (err) {
      setTasks((p) => p.map((t) => (t.id === task.id ? task : t))); // undo if it failed
      setApiError(err.message || 'Could not update this task.');
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setApiError(''); setNotice('');
    try {
      await api(`/api/v1/tasks/${task.id}`, { method: 'DELETE' });
      setTasks((p) => p.filter((t) => t.id !== task.id));
      setNotice('Task deleted.');
    } catch (err) {
      setApiError(err.message || 'Could not delete this task.');
    }
  }

  const tabs = [['all', 'All'], ['todo', 'To do'], ['done', 'Done']];

  return (
    <div className="ft">
      <div className="ft-head">
        <div>
          <span className="ft-eyebrow">MANA POLAM TOOLS</span>
          <h1>Farm tasks</h1>
          <p>Never miss watering, spraying or harvest work.</p>
        </div>
        <div className="ft-tiles">
          <div className="ft-tile"><small>To do</small><b>{stats.todo}</b></div>
          <div className="ft-tile"><small>Due today</small><b>{stats.today}</b></div>
          <div className="ft-tile"><small>Overdue</small><b className={stats.overdue ? 'ft-danger' : ''}>{stats.overdue}</b></div>
          <div className="ft-tile"><small>Completed</small><b className="ft-good">{stats.done}</b></div>
        </div>
      </div>

      <form className="ft-card ft-form" onSubmit={handleSubmit} noValidate>
        <h2>Add a task</h2>
        <div className="ft-grid">
          <div className="ft-field ft-title">
            <label htmlFor="title">Task title</label>
            <input id="title" name="title" type="text" placeholder="e.g. Water the paddy field" value={form.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} />
            {errors.title && <p className="ft-error">{errors.title}</p>}
          </div>
          <div className="ft-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} aria-invalid={Boolean(errors.category)}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="ft-error">{errors.category}</p>}
          </div>
          <div className="ft-field">
            <label htmlFor="farm_id">Farm (optional)</label>
            <select id="farm_id" name="farm_id" value={form.farm_id} onChange={handleChange}>
              <option value="">All farms</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="ft-field">
            <label htmlFor="due_date">Due date</label>
            <input id="due_date" name="due_date" type="date" min={todayISO()} value={form.due_date} onChange={handleChange} />
          </div>
          <div className="ft-field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {apiError && <div className="ft-banner ft-banner-error">{apiError}</div>}
        {notice && <div className="ft-banner ft-banner-ok">{notice}</div>}

        <div className="ft-actions">
          <button type="submit" className="ft-btn" disabled={saving}>{saving ? 'Saving…' : '+ Add task'}</button>
        </div>
      </form>

      <section className="ft-card ft-list" aria-labelledby="ft-list-title">
        <div className="ft-list-head">
          <h2 id="ft-list-title">Your tasks</h2>
          <div className="ft-tabs" role="tablist" aria-label="Filter tasks">
            {tabs.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'ft-tab ft-tab-on' : 'ft-tab'} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="ft-loading">Loading your tasks…</p>
        ) : visible.length === 0 ? (
          <div className="ft-empty">
            <Sprout size={32} />
            <h3>{tasks.length === 0 ? 'No tasks yet' : 'Nothing here'}</h3>
            <p>{tasks.length === 0 ? 'Add your first task above to get started.' : 'No tasks match this filter.'}</p>
          </div>
        ) : (
          <ul className="ft-items">
            {visible.map((t) => {
              const due = dueLabel(t);
              const done = t.status === 'completed';
              return (
                <li key={t.id} className={done ? 'ft-item ft-done' : 'ft-item'}>
                  <button type="button" className={done ? 'ft-check ft-check-on' : 'ft-check'} aria-pressed={done} aria-label={done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`} onClick={() => toggleDone(t)}>
                    {done && <Check size={14} strokeWidth={3} />}
                  </button>
                  <div className="ft-main">
                    <b>{t.title}</b>
                    <small>
                      {farmName(t.farm_id) && <>{farmName(t.farm_id)} · </>}
                      <span className={due.overdue ? 'ft-overdue' : ''}>{due.text}</span>
                    </small>
                  </div>
                  <span className={`ft-chip ft-cat-${Math.max(CATEGORIES.indexOf(t.category), 0) % 5}`}>{t.category}</span>
                  {!done && <span className={`ft-chip ft-pri-${t.priority.toLowerCase()}`}>{t.priority}</span>}
                  <button type="button" className="ft-del" aria-label={`Delete ${t.title}`} onClick={() => handleDelete(t)}><Trash2 size={16} /></button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}