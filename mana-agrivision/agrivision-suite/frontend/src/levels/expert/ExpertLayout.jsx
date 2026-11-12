import './styles/index.css';
import { useMemo } from 'react';
import ExpertRoutes from './expertRoutes.jsx';
import LevelShell from '../../shared/components/LevelShell.jsx';
export default function ExpertLayout() {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch { return {}; } }, []);
  return <LevelShell level="expert" nav={['dashboard', 'farms', 'disease', 'reports', 'crops', 'market', 'schemes', 'community', 'inventory', 'assistant', 'soil-irrigation', 'expenses', 'tasks', 'weather', 'marketplace', 'expert', 'profile']}><ExpertRoutes user={user} /></LevelShell>;
}
