import './styles/index.css';
import { useMemo } from 'react';
import IntermediateRoutes from './intermediateRoutes.jsx';
import LevelShell from '../../shared/components/LevelShell.jsx';
export default function IntermediateLayout() {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch { return {}; } }, []);
  return <LevelShell level="intermediate" nav={['dashboard', 'farms', 'crops', 'tasks', 'soil-irrigation', 'expenses', 'inventory', 'market', 'reports', 'weather', 'profile']}><IntermediateRoutes user={user} /></LevelShell>;
}
