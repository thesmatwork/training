import { useEffect, useMemo, useState } from 'react';
import {
  UserRound, MapPin, Sprout, Settings, Droplets, History, Tractor,
  Bell, BarChart3, BriefcaseBusiness, Award, ShieldCheck, Plus, Pencil,
  Trash2, Camera, Save, X, CheckCircle2, Leaf, Tractor as TractorIcon
} from 'lucide-react';
import { api } from '../services/api.js';
import './FarmerProfile.css';

const LEVEL_CONFIG = {
  beginner: {
    label: 'Beginner Farmer',
    completion: 60,
    tabs: [
      ['personal', 'Personal Details', UserRound],
      ['address', 'Address', MapPin],
      ['farm', 'Farm Details', Sprout],
      ['preferences', 'Preferences', Settings]
    ],
    sections: {
      personal: { title: 'Personal Details', fields: [
        ['name','Full Name','text',true], ['email','Email Address','email',true],
        ['phone','Mobile Number','tel',true], ['dateOfBirth','Date of Birth','date'],
        ['gender','Gender','select',false,['Male','Female','Other','Prefer not to say']],
        ['about','About You','textarea']
      ]},
      address: { title: 'Address Details', fields: [
        ['state','State','text'], ['district','District','text'],
        ['mandal','Mandal','text'], ['village','Village','text'],
        ['pincode','PIN Code','text'], ['address','Complete Address','textarea']
      ]},
      farm: { title: 'Farm Details', fields: [
        ['farmName','Farm Name','text'], ['landArea','Land Area (acres)','number'],
        ['landOwnership','Land Ownership','select',false,['Owned','Leased','Shared']],
        ['mainCrops','Main Crops','text'], ['farmingExperience','Farming Experience','select',false,['New farmer','1–3 years','3–5 years','5+ years']]
      ]},
      preferences: { title: 'Account Preferences', fields: [
        ['language','Preferred Language','select',false,['Telugu','English','Hindi']],
        ['dashboardLevel','Dashboard Level','readonly'], ['emailNotifications','Email Notifications','select',false,['Enabled','Disabled']],
        ['smsNotifications','SMS Notifications','select',false,['Enabled','Disabled']]
      ]}
    }
  },
  intermediate: {
    label: 'Intermediate Farmer',
    completion: 80,
    tabs: [
      ['personal','Personal Details',UserRound], ['address','Address',MapPin],
      ['farms','Farms & Land',Sprout], ['soil','Soil & Irrigation',Droplets],
      ['crops','Crop History',History], ['equipment','Equipment',TractorIcon],
      ['notifications','Notifications',Bell]
    ],
    sections: {
      personal: { title:'Personal Details', fields:[
        ['name','Full Name','text',true],['email','Email Address','email',true],
        ['phone','Mobile Number','tel',true],['dateOfBirth','Date of Birth','date'],
        ['gender','Gender','select',false,['Male','Female','Other','Prefer not to say']],
        ['farmerId','Farmer ID','text'],['about','About You','textarea']
      ]},
      address:{title:'Address Details',fields:[
        ['state','State','text'],['district','District','text'],['mandal','Mandal','text'],
        ['village','Village','text'],['pincode','PIN Code','text'],['address','Complete Address','textarea']
      ]},
      farms:{title:'Farms & Land Details', kind:'farms'},
      soil:{title:'Soil & Irrigation Details',fields:[
        ['soilType','Primary Soil Type','select',false,['Red Soil','Black Soil','Alluvial Soil','Sandy Soil','Laterite Soil','Other']],
        ['soilPh','Soil pH','number'],['waterSource','Water Source','select',false,['Borewell','Canal','Open well','Rainfed','River','Other']],
        ['irrigation','Irrigation Method','select',false,['Drip','Sprinkler','Flood','Furrow','Rainfed']],
        ['soilTestDate','Last Soil Test','date'],['waterAvailability','Water Availability','select',false,['Year-round','Seasonal','Limited']]
      ]},
      crops:{title:'Crop History',fields:[
        ['currentCrops','Current Crops','textarea'],['previousCrops','Previous Season Crops','textarea'],
        ['sowingSeason','Sowing Season','select',false,['Kharif','Rabi','Zaid','全年 / All seasons']],
        ['yieldNotes','Yield / Harvest Notes','textarea']
      ]},
      equipment:{title:'Equipment & Inventory',kind:'equipment'},
      notifications:{title:'Notification Preferences',fields:[
        ['language','Preferred Language','select',false,['Telugu','English','Hindi']],
        ['taskAlerts','Task Reminders','select',false,['Enabled','Disabled']],
        ['weatherAlerts','Weather Alerts','select',false,['Enabled','Disabled']],
        ['marketAlerts','Market Price Alerts','select',false,['Enabled','Disabled']],
        ['smsNotifications','SMS Notifications','select',false,['Enabled','Disabled']],
        ['whatsappNotifications','WhatsApp Notifications','select',false,['Enabled','Disabled']]
      ]}
    }
  },
  expert: {
    label:'Expert Farmer',
    completion:95,
    tabs:[
      ['personal','Personal Details',UserRound],['farms','Farms & Land',Sprout],
      ['analytics','Soil & Analytics',BarChart3],['yield','Crops & Yield',Leaf],
      ['machinery','Machinery',TractorIcon],['business','Business',BriefcaseBusiness],
      ['certificates','Certificates',Award],['security','Security',ShieldCheck]
    ],
    sections:{
      personal:{title:'Professional Farmer Information',fields:[
        ['name','Full Name','text',true],['email','Email Address','email',true],
        ['phone','Mobile Number','tel',true],['farmerId','Farmer / Registration ID','text'],
        ['experience','Farming Experience (years)','number'],['specialization','Farming Specialization','text'],
        ['about','Professional Summary','textarea']
      ]},
      farms:{title:'Farms & Land Portfolio',kind:'farms'},
      analytics:{title:'Soil & Farm Analytics',fields:[
        ['soilTypes','Soil Types Across Farms','textarea'],['soilPh','Average Soil pH','number'],
        ['waterSources','Water Sources','textarea'],['irrigationSystems','Irrigation Systems','textarea'],
        ['soilTesting','Soil Testing Frequency','select',false,['Every season','Twice a year','Annually','As required']],
        ['analyticsNotes','Analytics Notes','textarea']
      ]},
      yield:{title:'Crops & Yield Records',fields:[
        ['cropPortfolio','Crop Portfolio','textarea'],['annualYield','Annual Yield Summary','textarea'],
        ['cropSeasons','Crop Seasons','text'],['yieldTarget','Yield Target','text'],
        ['sustainablePractices','Sustainable Practices','textarea']
      ]},
      machinery:{title:'Machinery & Technology',kind:'equipment'},
      business:{title:'Farm Business Information',fields:[
        ['businessName','Business / Farm Organisation','text'],['businessType','Business Type','select',false,['Individual','Family farm','Partnership','Producer organisation','Company']],
        ['annualRevenue','Annual Revenue Range','select',false,['Below ₹5 lakh','₹5–10 lakh','₹10–25 lakh','₹25–50 lakh','Above ₹50 lakh','Prefer not to say']],
        ['buyers','Buyers / Market Partners','textarea'],['businessNotes','Business Details','textarea']
      ]},
      certificates:{title:'Certifications & Experience',fields:[
        ['certifications','Certifications','textarea'],['training','Training & Workshops','textarea'],
        ['awards','Awards & Recognition','textarea'],['memberships','Farmer Groups / Associations','textarea']
      ]},
      security:{title:'Account Security',fields:[
        ['language','Preferred Language','select',false,['Telugu','English','Hindi']],
        ['twoFactor','Two-factor Authentication','select',false,['Enabled','Disabled']],
        ['securityEmail','Recovery Email','email'],['lastLogin','Last Login','readonly']
      ]}
    }
  }
};

const blankFarm = () => ({ id: `${Date.now()}-${Math.random()}`, name:'', location:'', area:'', soil:'', irrigation:'', crops:'' });
const blankEquipment = () => ({ id: `${Date.now()}-${Math.random()}`, name:'', model:'', status:'Owned', details:'' });

export default function FarmerProfile({ level='beginner' }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner;
  const storageKey = `mana_profile_${level}`;
  const [user,setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch { return {}; }
  });
  const [profile,setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return { ...saved, name:saved.name ?? user?.name ?? '', email:saved.email ?? user?.email ?? '' };
    } catch { return { name:user?.name || '', email:user?.email || '' }; }
  });
  const [active,setActive] = useState(config.tabs[0][0]);
  const [editing,setEditing] = useState(true);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  const [farms,setFarms] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}_farms`) || '[]'); } catch { return []; }
  });
  const [equipment,setEquipment] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}_equipment`) || '[]'); } catch { return []; }
  });
  const [adding,setAdding] = useState(false);
  const [draft,setDraft] = useState(blankFarm);
  const [equipmentDraft,setEquipmentDraft] = useState(blankEquipment);

  useEffect(() => { setActive(config.tabs[0][0]); }, [level]);
  const completion = useMemo(() => {
    const fields = Object.values(config.sections).flatMap(s => s.fields || []).filter(f => f[0] !== 'dashboardLevel' && f[0] !== 'lastLogin');
    const filled = fields.filter(f => String(profile[f[0]] || '').trim()).length;
    const recordsBonus = config.sections.farms ? Math.min(farms.length,2) : 0;
    return Math.min(100, Math.round(((filled + recordsBonus) / (fields.length + 2)) * 100));
  }, [profile,farms,config]);

  const update = (key,value) => setProfile(prev => ({...prev,[key]:value}));
  const cancel = () => {
    try { setProfile(JSON.parse(localStorage.getItem(storageKey) || '{}')); } catch { setProfile({}); }
    setEditing(false); setNotice(''); setError('');
  };

  async function save() {
    setSaving(true); setNotice(''); setError('');
    const next = { ...profile, name: profile.name || user.name || '', email: profile.email || user.email || '', level };
    try {
      // The current backend profile endpoint is used for the account name. Extended farm/profile fields
      // are retained per level in local storage until matching backend profile columns are available.
      if (next.name && next.name !== user.name) {
        const updated = await api('/api/v1/auth/me', { method:'PATCH', body:JSON.stringify({ name:next.name }) });
        const merged = { ...user, ...(updated || {}), name:updated?.name || next.name };
        setUser(merged);
        localStorage.setItem('mana_user',JSON.stringify(merged));
      }
      localStorage.setItem(storageKey,JSON.stringify(next));
      localStorage.setItem(`${storageKey}_farms`,JSON.stringify(farms));
      localStorage.setItem(`${storageKey}_equipment`,JSON.stringify(equipment));
      setProfile(next); setEditing(false); setNotice('Profile changes saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save profile. Please try again.');
    } finally { setSaving(false); }
  }

  function addRecord() {
    if (active === 'farms') {
      if (!draft.name.trim()) return;
      const next = [...farms,draft]; setFarms(next);
      localStorage.setItem(`${storageKey}_farms`,JSON.stringify(next)); setDraft(blankFarm()); setAdding(false);
    } else {
      if (!equipmentDraft.name.trim()) return;
      const next = [...equipment,equipmentDraft]; setEquipment(next);
      localStorage.setItem(`${storageKey}_equipment`,JSON.stringify(next)); setEquipmentDraft(blankEquipment()); setAdding(false);
    }
  }
  function removeRecord(kind,id) {
    if (kind === 'farms') { const next=farms.filter(x=>x.id!==id); setFarms(next); localStorage.setItem(`${storageKey}_farms`,JSON.stringify(next)); }
    else { const next=equipment.filter(x=>x.id!==id); setEquipment(next); localStorage.setItem(`${storageKey}_equipment`,JSON.stringify(next)); }
  }

  const current = config.sections[active];
  const tabLabel = config.tabs.find(t=>t[0]===active)?.[1] || '';
  const fieldControl = (field) => {
    const [key,label,type,required,options] = field;
    const value = key === 'dashboardLevel' ? config.label : key === 'lastLogin' ? (user.last_login || 'Not available') : (profile[key] || '');
    if (type === 'readonly') return <div className="mp-readonly">{value || '—'}</div>;
    if (type === 'textarea') return <textarea rows="3" value={value} disabled={!editing} onChange={e=>update(key,e.target.value)} placeholder={`Enter ${label.toLowerCase()}`} />;
    if (type === 'select') return <select value={value} disabled={!editing} onChange={e=>update(key,e.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map(o=><option key={o}>{o}</option>)}</select>;
    return <input type={type} value={value} disabled={!editing} required={required} onChange={e=>update(key,e.target.value)} placeholder={`Enter ${label.toLowerCase()}`} />;
  };

  return <div className="mp-profile-page">
    <div className="mp-page-heading"><div><div className="mp-breadcrumb">Home <span>›</span> Profile</div><h1>My Profile</h1><p>Manage your personal information and farming details.</p></div><span className={`mp-level-chip ${level}`}>{config.label}</span></div>
    <div className="mp-profile-layout">
      <aside className="mp-identity-card">
        <div className="mp-avatar-wrap"><div className="mp-avatar"><UserRound size={48}/></div><span className="mp-camera"><Camera size={15}/></span></div>
        <h2>{profile.name || user.name || 'Farmer Name'}</h2>
        <span className="mp-role">{config.label}</span>
        <div className="mp-completion"><div><b>Profile Completion</b><strong>{completion}%</strong></div><span className="mp-progress"><i style={{width:`${completion}%`}}/></span></div>
        <div className="mp-field-art"><span/><span/><span/><span/></div>
      </aside>
      <section className="mp-editor-card">
        <div className="mp-tabs" role="tablist">{config.tabs.map(([id,label,Icon])=><button key={id} className={active===id?'active':''} onClick={()=>{setActive(id);setAdding(false);}} role="tab" aria-selected={active===id}><Icon size={16}/><span>{label}</span></button>)}</div>
        <div className="mp-section-head"><div><span className="mp-section-icon">{active==='farms'||active==='farm'?<Sprout/>:active==='equipment'||active==='machinery'?<Tractor/>:<UserRound/>}</span><div><h2>{current.title}</h2><p>Keep your information accurate and up to date.</p></div></div>
          {(current.kind==='farms'||current.kind==='equipment') && <button className="mp-add-btn" onClick={()=>setAdding(v=>!v)}><Plus size={16}/>{current.kind==='farms'?'Add Farm':'Add Equipment'}</button>}
        </div>
        {current.fields && <div className="mp-fields-grid">{current.fields.map(field=><label className={`mp-field ${field[2]==='textarea'?'wide':''}`} key={field[0]}><span>{field[1]}{field[3]&&<b> *</b>}</span>{fieldControl(field)}</label>)}</div>}
        {current.kind==='farms' && <div className="mp-record-area">
          {farms.length ? <div className="mp-table-wrap"><table className="mp-table"><thead><tr><th>Farm Name</th><th>Location</th><th>Land Area</th><th>Soil Type</th><th>Irrigation</th><th>Main Crops</th><th>Actions</th></tr></thead><tbody>{farms.map(f=><tr key={f.id}><td>{f.name}</td><td>{f.location||'—'}</td><td>{f.area?`${f.area} acres`:'—'}</td><td>{f.soil||'—'}</td><td>{f.irrigation||'—'}</td><td>{f.crops||'—'}</td><td><button className="mp-icon-btn danger" onClick={()=>removeRecord('farms',f.id)} aria-label="Delete farm"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>:<div className="mp-empty"><Sprout size={28}/><b>No farm records added yet</b><span>Add your farm to maintain land and crop details.</span></div>}
          {adding && <div className="mp-inline-form">{[['name','Farm Name'],['location','Location'],['area','Land Area (acres)'],['soil','Soil Type'],['irrigation','Irrigation'],['crops','Main Crops']].map(([k,l])=><label key={k}>{l}<input value={draft[k]} onChange={e=>setDraft(p=>({...p,[k]:e.target.value}))}/></label>)}<button className="mp-add-btn" onClick={addRecord}>Add Farm</button></div>}
        </div>}
        {current.kind==='equipment' && <div className="mp-equipment-area">
          {equipment.length ? <div className="mp-equipment-grid">{equipment.map(item=><article className="mp-equipment-card" key={item.id}><span className="mp-equipment-icon"><Tractor size={27}/></span><b>{item.name}</b><small>{item.model||item.details||'Farm equipment'}</small><span className="mp-status">{item.status}</span><button className="mp-icon-btn danger" onClick={()=>removeRecord('equipment',item.id)} aria-label="Delete equipment"><Trash2 size={15}/></button></article>)}</div>:<div className="mp-empty"><Tractor size={28}/><b>No equipment records added yet</b><span>Add machinery and equipment used on your farm.</span></div>}
          {adding && <div className="mp-inline-form">{[['name','Equipment Name'],['model','Model'],['details','Details']].map(([k,l])=><label key={k}>{l}<input value={equipmentDraft[k]} onChange={e=>setEquipmentDraft(p=>({...p,[k]:e.target.value}))}/></label>)}<label>Status<select value={equipmentDraft.status} onChange={e=>setEquipmentDraft(p=>({...p,status:e.target.value}))}><option>Owned</option><option>Leased</option><option>Installed</option><option>Shared</option></select></label><button className="mp-add-btn" onClick={addRecord}>Add Equipment</button></div>}
        </div>}
        <div className="mp-editor-footer"><div className="mp-save-message">{notice&&<span className="success"><CheckCircle2 size={15}/>{notice}</span>}{error&&<span className="error">{error}</span>}</div><div><button className="mp-cancel-btn" onClick={cancel}><X size={15}/>Cancel</button><button className="mp-save-btn" onClick={save} disabled={saving}><Save size={16}/>{saving?'Saving…':'Save Changes'}</button></div></div>
      </section>
    </div>
    <div className="mp-bottom-note"><Leaf size={17}/><span>Growing stronger farms, together — Mana Polam</span></div>
  </div>;
}
