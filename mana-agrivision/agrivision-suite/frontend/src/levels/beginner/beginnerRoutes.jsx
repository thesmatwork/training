import { Route, Routes, Navigate } from 'react-router-dom';

import BeginnerDashboard from './BeginnerDashboard.jsx';

import TasksPage from './pages/TasksPage.jsx';
import LearningPage from './pages/LearningPage.jsx';
import FarmsPage from './pages/FarmsPage.jsx';
import CropsPage from './pages/CropsPage.jsx';
import ExpertPage from './pages/ExpertPage.jsx';
import WeatherPage from './pages/WeatherPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
export default function BeginnerRoutes({ user }) {
  return (
    <Routes>
      <Route path="dashboard" element={<BeginnerDashboard user={user} />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="learning" element={<LearningPage />} />
      <Route path="farms" element={<FarmsPage />} />
      <Route path="crops" element={<CropsPage />} />
      <Route path="expert" element={<ExpertPage />} />
      <Route path="weather" element={<WeatherPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
