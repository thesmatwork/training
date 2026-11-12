import './styles/index.css';
import { useMemo } from 'react';
import BeginnerRoutes from './beginnerRoutes.jsx';
import LevelShell from '../../shared/components/LevelShell.jsx';
export default function BeginnerLayout() {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch { return {}; } }, []);
  return <LevelShell level="beginner" nav={['dashboard', 'tasks', 'learning', 'farms', 'crops', 'expert', 'weather', 'profile']}><BeginnerRoutes user={user} /></LevelShell>;
}
