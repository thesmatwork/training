import { Navigate } from 'react-router-dom';
import BeginnerLayout from '../levels/beginner/BeginnerLayout.jsx';
import IntermediateLayout from '../levels/intermediate/IntermediateLayout.jsx';
import ExpertLayout from '../levels/expert/ExpertLayout.jsx';
export default function LevelRouter() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem('mana_user') || '{}'); } catch {}
  const level = user.experience_level || user.level || 'beginner';
  if (level === 'intermediate') return <IntermediateLayout />;
  if (level === 'expert') return <ExpertLayout />;
  if (level === 'beginner') return <BeginnerLayout />;
  return <Navigate to="/app/dashboard" replace />;
}
