import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, LogOut, LayoutDashboard, Tractor, Leaf, CloudSun, CalendarCheck, Wallet, Package, Droplets, ChartNoAxesCombined, Settings, BookOpen, MessageCircle, Stethoscope, Store, ShieldCheck, Users, FileText, CircleHelp } from 'lucide-react';
import { clearSession } from '../services/api.js';

const icons = { dashboard: LayoutDashboard, farms: Tractor, crops: Leaf, weather: CloudSun, tasks: CalendarCheck, expenses: Wallet, inventory: Package, 'soil-irrigation': Droplets, market: ChartNoAxesCombined, reports: FileText, learning: BookOpen, expert: MessageCircle, disease: Stethoscope, marketplace: Store, schemes: ShieldCheck, community: Users, assistant: CircleHelp, profile: Settings };
const labels = { dashboard:'Dashboard', farms:'My Farms', crops:'Crops', weather:'Weather', tasks:'Tasks', expenses:'Expenses', inventory:'Inventory', 'soil-irrigation':'Soil & Irrigation', market:'Market Prices', reports:'Reports', learning:'Learning', expert:'Ask Expert', disease:'AI Crop Health', marketplace:'Marketplace', schemes:'Government Schemes', community:'Community', assistant:'AI Assistant', profile:'Profile' };
export default function LevelShell({ level, nav = [], children }) {
  const [open,setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch { return {}; } }, []);
  function logout(){ clearSession(); navigate('/login'); }
  return <div className={`app-shell level-${level}`}>
    <aside className={`sidebar ${open?'mobile-open':''}`}>
      <div className="sidebar-brand"><Link className="brand" to="/"><span className="brand-mark"><Sprout size={25}/></span><span><b>Mana Polam</b><small>AGRIVISION SUITE</small></span></Link><button className="mobile-close" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="sidebar-level"><span className="sidebar-level-icon"><Sprout size={18}/></span><span><b>{level[0].toUpperCase()+level.slice(1)} workspace</b><small>{level==='beginner'?'Simple steps, one day at a time':level==='intermediate'?'Plan your season with confidence':'Deeper insights for better decisions'}</small></span></div>
      <nav className="sidebar-nav"><small className="nav-caption">WORKSPACE</small>{nav.map(path=>{const Icon=icons[path]||Leaf;return <Link key={path} onClick={()=>setOpen(false)} className={`nav-link ${location.pathname.endsWith('/'+path)?'active':''}`} to={`/app/${path}`}><Icon size={18}/><span>{labels[path]||path}</span></Link>})}</nav>
      <button className="logout-button" onClick={logout}><LogOut size={18}/> Sign out</button>
    </aside>
    {open&&<button className="mobile-scrim" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
    <main className="app-main"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button><div><b>Mana Polam</b><small>Farm workspace</small></div><div className="topbar-right"><span className={`level-tag ${level}`}>{level[0].toUpperCase()+level.slice(1)}</span><span className="avatar">{(user.name||user.email||'F').slice(0,1).toUpperCase()}</span></div></header><div className="page-content">{children}</div></main>
  </div>;
}
