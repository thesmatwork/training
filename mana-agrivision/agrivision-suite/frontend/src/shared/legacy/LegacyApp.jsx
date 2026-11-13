
import { useEffect, useState } from 'react';
import CropRecords from '../pages/CropRecords.jsx';
import Analytics from '../pages/Analytics.jsx';

import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Sprout,
  ArrowRight,
  CloudSun,
  Leaf,
  Users,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Tractor,
  CalendarCheck,
  Wallet,
  BookOpen,
  MessageCircle,
  ChartNoAxesCombined,
  LogOut,
  Plus,
  Bell,
  MapPin,
  ChevronRight,
  Sun,
  Droplets,
  CircleHelp,
  Settings,
  Package,
  Store,
  FileText,
  Stethoscope,
  Video,
  TrendingUp,
  BarChart3,
  FlaskConical
} from 'lucide-react';

import { api, getToken, setSession, clearSession } from '../services/api.js';

import MyFarms from '../pages/Myfarms.jsx';
import WeatherPage from '../pages/WeatherPage.jsx';
import FarmTasks from '../pages/Farmtasks.jsx';
import Expenses from '../pages/Expenses.jsx';
import Inventory from '../pages/Inventory.jsx';
import SoilIrrigation from '../pages/SoilIrrigation.jsx';
import MarketPrices from '../pages/MarketPrices.jsx';
import Marketplace from "../pages/Marketplace.jsx";

const levels = {
  beginner: {
    label: 'Beginner',
    sub: 'Simple steps, one day at a time',
    color: 'green',
    welcome: 'Let’s grow together.',
    actions: [
      ['Daily tasks', 'Build a simple farm routine', '/app/tasks', CalendarCheck],
      ['Weather', 'Plan around today’s forecast', '/app/weather', CloudSun],
      ['Learn farming', 'Short guides and videos', '/app/learning', BookOpen],
      ['Ask an expert', 'Get help with a crop problem', '/app/expert', MessageCircle]
    ]
  },

  intermediate: {
    label: 'Intermediate',
    sub: 'Plan your season with confidence',
    color: 'blue',
    welcome: 'Your farm, better organised.',
    actions: [
      ['Manage farms', 'Keep your farm records together', '/app/farms', Tractor],
      ['Crop calendar', 'Track sowing and harvest dates', '/app/crops', Leaf],
      ['Costs and inventory', 'Track spending and supplies', '/app/expenses', Wallet],
      ['Market prices', 'Compare local market information', '/app/market', ChartNoAxesCombined]
    ]
  },

  expert: {
    label: 'Expert',
    sub: 'Deeper insights for better decisions',
    color: 'purple',
    welcome: 'Turn farm data into decisions.',
    actions: [
      ['Farm analytics', 'Review performance and yield', '/app/reports', ChartNoAxesCombined],
      ['Soil and irrigation', 'Review soil and water records', '/app/soil-irrigation', Droplets],
      ['AI crop assistant', 'Explore recommendations with caveats', '/app/assistant', Stethoscope],
      ['Expert questions', 'Review farmer questions', '/app/expert', MessageCircle]
    ]
  }
};

const navItems = [
  ['dashboard', 'Overview', LayoutDashboard],
  ['farms', 'My farms', Tractor],
  ['crops', 'Crops', Leaf],
  ['weather', 'Weather', CloudSun],
  ['market', 'Market prices', ChartNoAxesCombined],
  ['tasks', 'Tasks', CalendarCheck],
  ['expenses', 'Expenses', Wallet],
  ['inventory', 'Inventory', Package],
  ['soil-irrigation', 'Soil & irrigation', Droplets],
  ['disease', 'Crop health', Stethoscope],
  ['assistant', 'AI assistant', CircleHelp],
  ['learning', 'Learning videos', Video],
  ['community', 'Community', Users],
  ['expert', 'Ask an expert', MessageCircle],
  ['schemes', 'Government schemes', ShieldCheck],
  ['marketplace', 'Marketplace', Store],
  ['reports', 'Reports', FileText],
  ['profile', 'Profile', Settings]
];

const levelNav = {
  beginner: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['tasks', 'Daily Tasks', CalendarCheck],
    ['learning', 'Learn Farming', Video],
    ['farms', 'My Farm', Tractor],
    ['crops', 'Crop Guide', Leaf],
    ['expert', 'Ask Expert', MessageCircle],
    ['weather', 'Weather', CloudSun],
    ['profile', 'Profile', Settings]
  ],
  intermediate: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['farms', 'My Farms', Tractor],
    ['crops', 'Crop Monitoring', Leaf],
    ['tasks', 'Fertilizer & Spray Plan', CalendarCheck],
    ['soil-irrigation', 'Irrigation', Droplets],
    ['expenses', 'Expenses', Wallet],
    ['market', 'Market Prices', ChartNoAxesCombined],
    ['reports', 'Reports', FileText],
    ['weather', 'Weather', CloudSun],
    ['profile', 'Profile', Settings]
  ],
  expert: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['farms', 'Farm Management', Tractor],
    ['disease', 'AI Crop Health', Stethoscope],
    ['reports', 'Analytics & Reports', ChartNoAxesCombined],
    ['crops', 'Yield & Crop Records', Leaf],
    ['market', 'Market Intelligence', Store],
    ['schemes', 'Schemes & Subsidies', ShieldCheck],
    ['community', 'Community', Users],
    ['inventory', 'Inventory', Package],
    ['assistant', 'AI Assistant', CircleHelp],
    ['profile', 'Settings', Settings]
  ]
};

function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <Sprout size={25} />
      </span>

      <span>
        <b>Mana Polam</b>
        <small>AGRIVISION SUITE</small>
      </span>
    </Link>
  );
}

export function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />

        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#levels">Levels</a>
          <Link to="/login">Sign in</Link>
          <Link className="btn-primary nav-cta" to="/register">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span /> SMART FARMING, BETTER FUTURE
          </span>

          <h1>
            Grow better.
            <br />
            <em>Live greener.</em>
          </h1>

          <p>
            Your farm, your crops, your future — all in one simple platform.
            Make informed decisions with practical farm tools, weather insights,
            market information, and expert support.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Start your journey <ArrowRight size={18} />
            </Link>

            <a className="text-link" href="#features">
              Explore features ↓
            </a>
          </div>

          <div className="trust-line">
            <ShieldCheck size={17} />
            Built around farmers. Designed for real life.
          </div>
        </div>

        <div className="hero-visual">
          <div className="sun-disc" />
          <div className="field field-one" />
          <div className="field field-two" />
          <div className="field field-three" />

          <div className="floating-card weather-float">
            <CloudSun />
            <span>
              <b>Weather-aware</b>
              <small>Plan with confidence</small>
            </span>
          </div>

          <div className="floating-card crop-float">
            <ChartNoAxesCombined />
            <span>
              <b>Farm insights</b>
              <small>One step at a time</small>
            </span>
          </div>

          <div className="visual-caption">
            🌾 A smarter future grows here
          </div>
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">YOUR FARM, YOUR WAY</span>
          <h2>
            Everything you need to <em>grow forward.</em>
          </h2>
          <p>
            Useful tools that meet you where you are — whether you're just
            starting or ready for deeper insights.
          </p>
        </div>

        <div className="feature-grid">
          <article>
            <span><Leaf /></span>
            <h3>Manage your farm</h3>
            <p>
              Keep farms, crops, tasks, expenses, and harvest records together.
            </p>
          </article>

          <article>
            <span className="blue"><CloudSun /></span>
            <h3>Plan around weather</h3>
            <p>
              Understand forecasts and make weather-aware farm decisions.
            </p>
          </article>

          <article>
            <span className="purple"><Users /></span>
            <h3>Learn and connect</h3>
            <p>
              Explore learning resources and ask agricultural experts for help.
            </p>
          </article>
        </div>
      </section>

      <section className="level-section" id="levels">
        <div>
          <span className="eyebrow">GROW AT YOUR PACE</span>
          <h2>
            Three levels.
            <br />
            <em>One farming partner.</em>
          </h2>
          <p>
            Choose Beginner, Intermediate, or Expert to shape the depth of
            explanations and farm insights.
          </p>
          <Link to="/register" className="text-link">
            Find your starting point <ArrowRight size={16} />
          </Link>
        </div>

        <div className="level-cards">
          {Object.entries(levels).map(([key, level], index) => (
            <div className={`level-card ${level.color}`} key={key}>
              <b>0{index + 1}</b>
              <h3>{level.label}</h3>
              <p>{level.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <Brand />
        <span>Growing stronger farms, together.</span>
        <Link to="/login">
          Sign in <ArrowRight size={14} />
        </Link>
      </footer>
    </div>
  );
}

export function Auth({ register = false }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    level: 'beginner',
    role: 'farmer',
    method: 'password',
    phone: '',
    otp: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const update = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      let result;

      if (form.method === 'password') {
        result = register
          ? await api('/api/v1/auth/register', {
              method: 'POST',
              body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                level: form.level,
                experience_level: form.level,
                role: 'farmer'
              })
            })
          : await api('/api/v1/auth/login', {
              method: 'POST',
              body: JSON.stringify({
                email: form.email,
                password: form.password
              })
            });
      } else if (form.method === 'otp') {
        result = await api(
          register
            ? '/api/v1/auth/otp/request'
            : '/api/v1/auth/otp/verify',
          {
            method: 'POST',
            body: JSON.stringify(
              register
                ? { phone: form.phone }
                : { phone: form.phone, otp: form.otp }
            )
          }
        );

        if (register) {
          setError(
            result.message ||
              'OTP requested. Enter your OTP and switch to OTP sign-in.'
          );
          return;
        }
      } else {
        setError(
          'Google sign-in needs Google OAuth credentials and a configured ID-token flow. Use password login until configured.'
        );
        return;
      }

      setSession(result.access_token, result.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check backend configuration.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Brand />

        <div>
          <span className="eyebrow">WELCOME TO MANA POLAM</span>
          <h1>
            Grow with
            <br />
            <em>confidence.</em>
          </h1>
          <p>
            Practical farm tools, learning, weather and expert support — in one
            place.
          </p>

          <div className="auth-benefit">
            <ShieldCheck /> Designed around real farming needs
          </div>
        </div>

        <small>Mana Polam · AgriVision Suite</small>
      </div>

      <div className="auth-main">
        <Link to="/" className="back-link">← Back to home</Link>

        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">
            {register ? 'CREATE YOUR ACCOUNT' : 'GOOD TO SEE YOU'}
          </span>

          <h2>
            {register ? 'Start your farming journey' : 'Sign in to Mana Polam'}
          </h2>

          <p className="muted">
            {register
              ? 'Choose the dashboard level that suits you.'
              : 'Continue managing your farm.'}
          </p>

          <div className="auth-methods">
            <button
              type="button"
              className={form.method === 'password' ? 'selected' : ''}
              onClick={() => update('method', 'password')}
            >
              Password
            </button>

            <button
              type="button"
              className={form.method === 'google' ? 'selected' : ''}
              onClick={() => update('method', 'google')}
            >
              Google
            </button>

            <button
              type="button"
              className={form.method === 'otp' ? 'selected' : ''}
              onClick={() => update('method', 'otp')}
            >
              Mobile OTP
            </button>
          </div>

          {register && form.method === 'password' && (
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={event => update('name', event.target.value)}
                placeholder="Your name"
              />
            </label>
          )}

          {form.method === 'otp' ? (
            <>
              <label>
                Mobile number
                <input
                  required
                  value={form.phone}
                  onChange={event => update('phone', event.target.value)}
                  placeholder="+91 mobile number"
                />
              </label>

              {!register && (
                <label>
                  OTP
                  <input
                    required
                    value={form.otp}
                    onChange={event => update('otp', event.target.value)}
                    placeholder="Enter OTP"
                  />
                </label>
              )}
            </>
          ) : (
            <>
              <label>
                Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={event => update('email', event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              {form.method === 'password' && (
                <label>
                  Password
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password}
                    onChange={event => update('password', event.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>
              )}
            </>
          )}

          {register && form.method === 'password' && (
            <>
              <label>
                Dashboard level
                <select
                  value={form.level}
                  onChange={event => update('level', event.target.value)}
                >
                  <option value="beginner">Beginner — simple steps</option>
                  <option value="intermediate">Intermediate — farm planning</option>
                  <option value="expert">Expert — advanced insights</option>
                </select>
              </label>

              <label>
                Account type
                <select
                  value={form.role}
                  onChange={event => update('role', event.target.value)}
                >
                  <option value="farmer">Farmer</option>
                  <option value="expert">Agricultural expert</option>
                </select>
              </label>
            </>
          )}

          {error && <div className="error-note">{error}</div>}

          <button className="btn-primary full" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
            <ArrowRight size={16} />
          </button>

          <p className="auth-switch">
            {register ? 'Already registered?' : 'New to Mana Polam?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Sign in' : 'Create account'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function Guard({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}


export function LegacyDashboard({ user }) {
  const levelKey = ['beginner', 'intermediate', 'expert'].includes(user?.experience_level || user?.level)
    ? (user.experience_level || user.level) : 'beginner';
  const level = levels[levelKey];
  const [records, setRecords] = useState({ farms: [], crops: [], tasks: [], expenses: [], inventory: [] });
  const [apiState, setApiState] = useState('loading');
  const [taskDone, setTaskDone] = useState({});
  const [taskError, setTaskError] = useState('');
  const displayName = (user?.name || user?.full_name || user?.email || 'Farmer').split(' ')[0];

  useEffect(() => {
    let alive = true;
    const resources = ['farms', 'crops', 'tasks', 'expenses', 'inventory'];
    Promise.all(resources.map(async key => {
      try {
        const result = await api(`/api/v1/${key}`);
        const list = Array.isArray(result) ? result : (result?.items || result?.data || []);
        return [key, Array.isArray(list) ? list : []];
      } catch {
        return [key, []];
      }
    })).then(results => {
      if (!alive) return;
      const next = Object.fromEntries(results);
      setRecords(next);
      setApiState(results.some(([, list]) => list.length) ? 'connected' : 'empty');
    }).catch(() => { if (alive) setApiState('error'); });
    return () => { alive = false; };
  }, []);

  const tasks = records.tasks.slice(0, 3);
  const completedCount = tasks.filter(t => {
    const d = t.data || t;
    return taskDone[t.id || t.title || t.name] ?? ['completed', 'done'].includes(String(d.status || '').toLowerCase());
  }).length;
  const toggleTask = async (task) => {
    const d = task.data || task;
    const key = task.id || task.title || task.name || d.title || d.name;
    const wasDone = taskDone[key] ?? ['completed', 'done'].includes(String(d.status || '').toLowerCase());
    const nextStatus = wasDone ? 'pending' : 'completed';
    setTaskDone(old => ({...old, [key]: !wasDone}));
    if (!task.id) return;
    try {
      await api(`/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: d.title || d.name || 'Farm task',
          category: d.category || 'Other',
          farm_id: d.farm_id ?? null,
          due_date: d.due_date || null,
          priority: d.priority || 'Medium',
          status: nextStatus
        })
      });
    } catch (error) {
      setTaskDone(old => ({...old, [key]: wasDone}));
      setTaskError(error.message || 'Could not update this task.');
    }
  };
  const money = records.expenses.reduce((sum, item) => {
    const n = Number(item.amount ?? item.data?.amount ?? 0);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const titleCase = s => String(s || '').replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

  const Header = () => (
    <div className="mp-dashboard-header">
      <div className="mp-heading-copy">
        <div className="mp-heading-title">
          <span className="mp-level-emoji">{levelKey === 'beginner' ? '🌱' : levelKey === 'intermediate' ? '🌾' : '🎓'}</span>
          <h1>{level.label} Farmer Dashboard</h1>
          <span className={`mp-level-badge ${levelKey}`}>Level: {level.label}</span>
        </div>
        <p>{levelKey === 'beginner' ? 'New to farming? We’ll guide you step by step.' : levelKey === 'intermediate' ? 'You know the basics! Let’s improve your planning and productivity.' : 'Manage, analyse, and scale your farming operations with confidence.'}</p>
      </div>
      <div className="mp-header-actions">
        <span className={`mp-api-status ${apiState}`}><i />{apiState === 'connected' ? 'Backend connected' : apiState === 'loading' ? 'Connecting…' : 'Waiting for farm data'}</span>
        <span className="mp-language-chip">◎ English⌄</span>
        <span className="mp-user-chip"><i>{displayName.charAt(0).toUpperCase()}</i><span><b>{displayName}</b><small>{level.label} farmer</small></span></span>
      </div>
    </div>
  );

  const PanelTitle = ({icon: Icon, children, link}) => (
    <div className="mp-panel-title"><h2><Icon size={18}/>{children}</h2>{link && <Link to={link}>View all <ArrowRight size={13}/></Link>}</div>
  );
  const Tile = ({icon: Icon, title, to, tint=''}) => (
    <Link to={to} className={`mp-shortcut ${tint}`}><span><Icon size={23}/></span><b>{title}</b></Link>
  );
  const Stat = ({icon: Icon, label, value, sub}) => (
    <div className="mp-stat"><span className="mp-stat-icon"><Icon size={23}/></span><span><small>{label}</small><b>{value}</b><em>{sub}</em></span></div>
  );
  const EmptyPanel = ({icon: Icon, title, detail, link, cta}) => (
    <div className="mp-empty-panel"><Icon size={30}/><b>{title}</b><p>{detail}</p><Link to={link} className="mp-mini-button">{cta}</Link></div>
  );

  if (levelKey === 'beginner') {
    const guide = ['Land preparation', 'Seed selection', 'Sowing', 'Watering & care'];
    const beginnerTasks = tasks.length ? tasks : [
      {title:'Check your soil and water source'},
      {title:'Add your first farm details'},
      {title:'Choose a suitable crop'}
    ];
    return <div className="mp-dashboard mp-beginner">
      <Header/>
      <div className="mp-beginner-top">
        <section className="mp-welcome-hero">
          <div className="mp-farmer-illustration"><span>👨🏽‍🌾</span><small>YOUR FARMING JOURNEY</small></div>
          <div className="mp-welcome-copy"><span className="mp-kicker">WELCOME TO MANA POLAM</span><h2>Welcome, {displayName}! 👋</h2><p>Let’s start your farming journey together.</p><Link to="/app/learning" className="mp-primary-button">Start Learning <ArrowRight size={15}/></Link></div>
        </section>
        <section className="mp-panel mp-today-panel">
          <PanelTitle icon={CalendarCheck}>Today’s Tasks</PanelTitle>
          {beginnerTasks.map((task,i) => {
            const key=task.id || task.title || task.name || task.data?.title || i;
            const label=task.title || task.name || task.data?.title || 'Farm task';
            const isDone=taskDone[key] ?? ['completed','done'].includes(String((task.data||task).status||'').toLowerCase());
            return <button className="mp-task-line" key={key} onClick={()=>toggleTask(task)}><span className={isDone?'checked':''}>{isDone?'✓':''}</span>{label}</button>;
          })}
          <div className="mp-progress-line"><b>Progress</b><div><i style={{width:`${beginnerTasks.length ? (completedCount/beginnerTasks.length)*100 : 0}%`}}/></div><strong>{beginnerTasks.length ? Math.round(completedCount/beginnerTasks.length*100) : 0}%</strong></div>
          {taskError && <small>{taskError}</small>}
        </section>
        <section className="mp-panel mp-guide-panel">
          <PanelTitle icon={Sprout}>Farming Guide (Step by Step)</PanelTitle>
          {guide.map((item,i)=><div className="mp-guide-step" key={item}><span>{i+1}</span>{item}</div>)}
          <div className="mp-guide-sprout">🌱</div>
        </section>
      </div>
      <div className="mp-shortcut-row">
        <Tile icon={Leaf} title="Choose a Crop" to="/app/crops"/>
        <Tile icon={Tractor} title="Land Preparation" to="/app/farms" tint="gold"/>
        <Tile icon={Sprout} title="Seed & Sowing" to="/app/learning" tint="orange"/>
        <Tile icon={Droplets} title="Watering" to="/app/soil-irrigation" tint="blue"/>
        <Tile icon={ShieldCheck} title="Fertilizer Basics" to="/app/learning"/>
        <Tile icon={Stethoscope} title="Pest Control" to="/app/disease" tint="lime"/>
        <Tile icon={CalendarCheck} title="Harvesting" to="/app/crops" tint="gold"/>
      </div>
      <div className="mp-beginner-bottom">
        <section className="mp-panel"><PanelTitle icon={BookOpen}>Learn farming basics</PanelTitle><p>Simple guides on crops, soil, irrigation, pests and harvesting.</p><Link className="mp-green-link" to="/app/learning">Explore lessons <ArrowRight size={14}/></Link></section>
        <section className="mp-panel"><PanelTitle icon={Tractor}>My first farm</PanelTitle><p>Add your land, location and water details to get relevant guidance.</p><Link className="mp-green-link" to="/app/farms">Add farm details <ArrowRight size={14}/></Link></section>
        <section className="mp-panel"><PanelTitle icon={MessageCircle}>Ask an expert</PanelTitle><p>Get support when you notice an unfamiliar crop issue.</p><Link className="mp-green-link" to="/app/expert">Ask a question <ArrowRight size={14}/></Link></section>
      </div>
    </div>;
  }

  if (levelKey === 'intermediate') {
    const cropItems=records.crops.slice(0,3);
    return <div className="mp-dashboard mp-intermediate">
      <Header/>
      <div className="mp-stat-row four">
        <Stat icon={Tractor} label="My Farms" value={records.farms.length} sub="Registered farms"/>
        <Stat icon={Leaf} label="Active Crops" value={records.crops.length} sub="Crop records"/>
        <Stat icon={Wallet} label="This Season Expense" value={money ? `₹${money.toLocaleString('en-IN')}` : '—'} sub="From saved expenses"/>
        <Stat icon={CalendarCheck} label="Open Tasks" value={records.tasks.length} sub="Task records"/>
      </div>
      <div className="mp-intermediate-grid">
        <section className="mp-panel mp-crop-monitor"><PanelTitle icon={Sprout} link="/app/crops">Crop Growth Monitoring</PanelTitle>
          {cropItems.length ? cropItems.map((crop,i)=><div className="mp-crop-row" key={crop.id||i}><span className="mp-crop-thumb">{['🌾','🌱','🌶️'][i%3]}</span><span><b>{crop.name||crop.title||crop.data?.name||'Crop'}</b><small>{crop.stage||crop.data?.stage||'Growth stage not entered'}</small></span><em>{crop.status||'Tracking'}</em></div>) : <EmptyPanel icon={Sprout} title="No crop records yet" detail="Add crop, variety, sowing date and current stage to monitor progress." link="/app/crops" cta="Add a crop"/>}
        </section>
        <section className="mp-panel"><PanelTitle icon={CalendarCheck} link="/app/tasks">Fertilizer & Spray Schedule</PanelTitle><EmptyPanel icon={CalendarCheck} title="Plan crop-specific reminders" detail="Set reminders using crop stage, soil-test results and local agricultural guidance." link="/app/tasks" cta="Create reminder"/></section>
        <section className="mp-panel mp-weather-panel"><PanelTitle icon={CloudSun} link="/app/weather">Weather Today</PanelTitle><div className="mp-weather-empty"><span>🌤️</span><div><b>Local weather forecast</b><small>Connect a weather provider and farm location to view live conditions.</small></div></div></section>
        <section className="mp-panel mp-market-panel"><PanelTitle icon={Store} link="/app/market">Market Price (Today)</PanelTitle><EmptyPanel icon={ChartNoAxesCombined} title="Market watchlist" detail="Choose a crop and mandi to follow current prices." link="/app/market" cta="View market prices"/></section>
      </div>
      <div className="mp-shortcut-row five">
        <Tile icon={Droplets} title="Irrigation" to="/app/soil-irrigation" tint="blue"/>
        <Tile icon={ShieldCheck} title="Fertilizer Planner" to="/app/tasks"/>
        <Tile icon={Wallet} title="Expenses" to="/app/expenses" tint="gold"/>
        <Tile icon={Package} title="Inventory" to="/app/inventory" tint="orange"/>
        <Tile icon={ChartNoAxesCombined} title="Reports" to="/app/reports" tint="lime"/>
      </div>
    </div>;
  }

  return <div className="mp-dashboard mp-expert">
    <Header/>
    <div className="mp-stat-row five">
      <Stat icon={Tractor} label="Total Farms" value={records.farms.length} sub="Registered farms"/>
      <Stat icon={MapPin} label="Total Area" value="—" sub="Enter farm area"/>
      <Stat icon={Leaf} label="Active Crops" value={records.crops.length} sub="Crop records"/>
      <Stat icon={CalendarCheck} label="Open Tasks" value={records.tasks.length} sub="Pending work"/>
      <Stat icon={TrendingUp} label="Est. Profit" value="—" sub="Requires harvest & cost data"/>
    </div>
    <div className="mp-expert-grid">
      <section className="mp-panel mp-performance"><PanelTitle icon={ChartNoAxesCombined} link="/app/reports">Farm Performance (This Season)</PanelTitle><div className="mp-performance-placeholder"><BarChart3 size={54}/><b>Performance analytics</b><small>Charts will populate when crop, harvest, sales and expense data are available.</small><Link to="/app/reports" className="mp-primary-button">Open Reports <ArrowRight size={14}/></Link></div></section>
      <section className="mp-panel"><PanelTitle icon={Stethoscope} link="/app/disease">AI Crop Health</PanelTitle><div className="mp-ai-visual">🌿</div><b className="mp-ai-title">Crop health assessment</b><p>Submit a crop photo with crop name, location and symptoms for an AI-assisted review.</p><Link to="/app/disease" className="mp-primary-button">Check Crop Health</Link></section>
      <section className="mp-panel"><PanelTitle icon={Settings} >Advanced Tools</PanelTitle><div className="mp-tool-grid"><Tile icon={FlaskConical} title="Soil Analysis" to="/app/soil-irrigation"/><Tile icon={Droplets} title="Irrigation Plan" to="/app/soil-irrigation" tint="blue"/><Tile icon={TrendingUp} title="Yield Forecast" to="/app/reports" tint="gold"/><Tile icon={Wallet} title="Profit Analysis" to="/app/expenses" tint="orange"/><Tile icon={Package} title="Inventory" to="/app/inventory"/><Tile icon={FileText} title="Reports" to="/app/reports" tint="blue"/></div></section>
      <section className="mp-panel mp-insights"><PanelTitle icon={Sprout}>Quick Insights</PanelTitle><ul><li>Complete crop and farm records to enable reliable insights.</li><li>Review soil and water data before planning inputs.</li><li>Compare local market prices before selling.</li><li>Record harvest and expenses to calculate profit.</li></ul><Link className="mp-green-link" to="/app/assistant">Open AI assistant <ArrowRight size={14}/></Link></section>
    </div>
    <div className="mp-shortcut-row five"><Tile icon={Tractor} title="Farm Management" to="/app/farms"/><Tile icon={Stethoscope} title="AI Crop Health" to="/app/disease" tint="lime"/><Tile icon={ChartNoAxesCombined} title="Analytics & Reports" to="/app/reports" tint="blue"/><Tile icon={Store} title="Market Intelligence" to="/app/market" tint="gold"/><Tile icon={ShieldCheck} title="Schemes & Subsidies" to="/app/schemes" tint="orange"/></div>
  </div>;
}

function Metric({ icon: Icon, label, value, note }) {
  return (
    <div className="metric">
      <span className="metric-icon"><Icon size={20} /></span>
      <span className="metric-label">{label}</span>
      <b>{value}</b>
      <small>{note}</small>
    </div>
  );
}

function PlanningCard({ icon: Icon, title, description, to, linkText }) {
  return (
    <Link to={to} className="planning-card">
      <span className="planning-icon"><Icon /></span>
      <b>{title}</b>
      <p>{description}</p>
      <span className="text-link">
        {linkText} <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export function LegacyWorkspace({ page }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const [weather, setWeather] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mana_user') || '{}');
    } catch {
      return {};
    }
  });

  const config = {
    farms: ['My farms', 'farm', 'Farm name'],
    crops: ['Crop records', 'crop', 'Crop name'],
    tasks: ['Farm tasks', 'task', 'Task title'],
    expenses: ['Expenses', 'expense', 'Expense description'],
    inventory: ['Inventory', 'inventory', 'Item name'],
    'soil-irrigation': ['Soil & irrigation', 'soil', 'Record title'],
    expert: ['Ask an expert', 'question', 'Question'],
    community: ['Farmer community', 'post', 'Post title'],
    learning: ['Learning resources', 'lesson', 'Resource title'],
    schemes: ['Government schemes', 'scheme', 'Scheme title'],
    marketplace: ['Marketplace', 'listing', 'Listing title'],
    disease: ['Crop health', 'disease', 'Crop/problem'],
    market: ['Market watchlist', 'market-watchlist', 'Crop name'],
    assistant: ['AI farming assistant', 'assistant', 'Question']
  };

  const endpointMap = {
    farms: 'farms',
    crops: 'crops',
    tasks: 'tasks',
    expenses: 'expenses',
    inventory: 'inventory',
    'soil-irrigation': 'soil-irrigation',
    expert: 'experts/questions',
    community: 'community/posts',
    learning: 'learning/progress',
    schemes: 'schemes/saved',
    marketplace: 'marketplace/listings',
    disease: 'disease/reports',
    market: 'market/watchlist',
    assistant: 'assistant/conversations',
  };
  const endpoint = endpointMap[page] || page;

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    if (!config[page]) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    api(`/api/v1/${endpoint}`)
      .then(data => {
        if (!active) return;
        setItems(Array.isArray(data) ? data : data.items || []);
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load records.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint]);

  async function create(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const result = await api(`/api/v1/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({
          data: {
            title: text,
            name: text,
            description: text
          }
        })
      });

      setItems(previous => [result, ...previous]);
      setText('');
      setNotice('Saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save this record.');
    }
  }

  async function loadWeather() {
    setError('');

    try {
      const result = await api('/api/v1/weather?city=Hyderabad');
      setWeather(result);
    } catch (err) {
      setError(err.message || 'Unable to load weather.');
    }
  }

  const title =
    config[page]?.[0] ||
    page?.replaceAll('-', ' ') ||
    'Workspace';

  const singular = config[page]?.[2] || 'Title';

  if (page === 'weather') {
    return (
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">LOCAL CONDITIONS</span>
            <h1>Weather insights</h1>
            <p>Check conditions before planning farm work.</p>
          </div>
          <button className="btn-primary" onClick={loadWeather}>
            <CloudSun size={17} /> Check weather
          </button>
        </div>

        {weather ? (
          <div className="panel weather-result">
            <CloudSun size={35} />
            <h2>{weather.city || 'Weather'}</h2>
            <p>
              {weather.message ||
                weather.description ||
                'Weather provider response received.'}
            </p>
            {weather.temperature != null && (
              <b>{weather.temperature}°C</b>
            )}
          </div>
        ) : (
          <div className="panel empty-state">
            <CloudSun size={38} />
            <h2>Plan with the forecast</h2>
            <p>
              Connect a weather provider in backend configuration to get live
              local conditions.
            </p>
            <button className="btn-primary" onClick={loadWeather}>
              Load weather
            </button>
          </div>
        )}

        {error && <p className="error-note">{error}</p>}
      </div>
    );
  }

  if (page === 'profile') {
    return (
      <div className="workspace">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>Profile and preferences</h1>
          </div>
        </div>

        <div className="panel profile-panel">
          <label>
            Display name
            <input
              value={user.name || ''}
              onChange={event =>
                setUser({ ...user, name: event.target.value })
              }
            />
          </label>

          <label>
            Dashboard level
            <select
              value={user.level || 'beginner'}
              onChange={event => {
                const updatedUser = {
                  ...user,
                  level: event.target.value
                };
                setUser(updatedUser);
                localStorage.setItem(
                  'mana_user',
                  JSON.stringify(updatedUser)
                );
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </label>

          <p className="muted">
            Level selection is stored in this browser. Add a protected profile
            update endpoint before relying on server-side level changes.
          </p>

          <button
            className="btn-primary"
            onClick={async () => {
              try {
                const updated = await api('/api/v1/auth/me', {
                  method: 'PATCH',
                  body: JSON.stringify({ name: user.name, level: user.level }),
                });
                localStorage.setItem('mana_user', JSON.stringify(updated));
                setUser(updated);
                setNotice('Profile saved successfully.');
              } catch (err) {
                setError(err.message || 'Unable to save profile.');
              }
            }}
          >
            Save profile
          </button>

          {notice && <p className="success-note">{notice}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">MANA POLAM TOOLS</span>
          <h1>{title}</h1>
          <p>Keep your farming information organised and easy to find.</p>
        </div>
      </div>

      {config[page] && (
        <form className="panel create-form" onSubmit={create}>
          <label>
            {singular}
            <input
              required
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder={`Enter ${singular.toLowerCase()}`}
            />
          </label>

          <button className="btn-primary">
            <Plus size={17} /> Add record
          </button>
        </form>
      )}

      {error && <div className="error-note">{error}</div>}
      {notice && <div className="success-note">{notice}</div>}

      <section className="panel records-panel">
        <div className="panel-title">
          <div>
            <h2>Saved records</h2>
            <p>Your records for this section</p>
          </div>
          <span className="count-pill">{items.length} records</span>
        </div>

        {loading ? (
          <p className="muted">Loading records…</p>
        ) : items.length ? (
          <div className="record-list">
            {items.map((item, index) => (
              <div className="record" key={item.id || item.pk || index}>
                <span className="record-dot"><Leaf size={17} /></span>
                <span>
                  <b>
                    {item.title ||
                      item.name ||
                      item.data?.title ||
                      'Farm record'}
                  </b>
                  <small>
                    {item.description ||
                      item.data?.description ||
                      'Saved in your account'}
                  </small>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Sprout size={32} />
            <h3>No records yet</h3>
            <p>Add your first record above to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Layout() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mana_user') || '{}');
    } catch {
      return {};
    }
  });

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="sidebar-level">
          <span className="sidebar-level-icon"><Sprout size={18} /></span>
          <span>
            <b>{levels[user.experience_level || user.level]?.label || 'Beginner'} workspace</b>
            <small>
              {levels[user.experience_level || user.level]?.sub || levels.beginner.sub}
            </small>
          </span>
        </div>

        <nav className="sidebar-nav">
          <small className="nav-caption">WORKSPACE</small>

          {(levelNav[user.experience_level || user.level] || levelNav.beginner).map(([path, label, Icon]) => (
            <Link
              onClick={() => setOpen(false)}
              className={`nav-link ${
                location.pathname.endsWith('/' + path) ? 'active' : ''
              }`}
              to={`/app/${path}`}
              key={path}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {open && (
        <button
          className="mobile-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="app-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <b>Mana Polam</b>
            <small>Farm workspace</small>
          </div>

          <div className="topbar-right">
            <span
              className={`level-tag ${
                levels[user.experience_level || user.level]?.color || 'green'
              }`}
            >
              {levels[user.experience_level || user.level]?.label || 'Beginner'}
            </span>

            <span className="avatar">
              {(user.name || user.email || 'F').slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route
              path="dashboard"
              element={<LegacyDashboard user={user} />}
            />

            <Route path="farms" element={<MyFarms />} />
            <Route path="crops" element={<CropRecords />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="tasks" element={<FarmTasks />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="soil-irrigation" element={<SoilIrrigation />} />
            <Route path="market" element={<MarketPrices />} />

            {/* Reports opens the Analytics dashboard */}
            <Route path="reports" element={<Analytics />} />
            <Route path="marketplace" element={<Marketplace />} />

            {/* All remaining routes are handled here exactly once */}
            {navItems
              .filter(([path]) =>
                ![
                  'dashboard',
                  'farms',
                  'crops',
                  'weather',
                  'tasks',
                  'expenses',
                  'inventory',
                  'soil-irrigation',
                  'market',
                  'reports'
                ].includes(path)
              )
              .map(([path]) => (
                <Route
                  key={path}
                  path={path}
                  element={<LegacyWorkspace page={path} />}
                />
              ))}

            <Route
              path="*"
              element={<Navigate to="/app/dashboard" replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function LegacyApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />
      <Route
        path="/app/*"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default LegacyApp;
