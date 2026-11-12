import { Navigate, Route, Routes } from 'react-router-dom';
import { Landing, Auth, Guard } from './shared/legacy/LegacyApp.jsx';
import LevelRouter from './app/LevelRouter.jsx';
export default function App() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Auth />} />
    <Route path="/register" element={<Auth register />} />
    <Route path="/app/*" element={<Guard><LevelRouter /></Guard>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
