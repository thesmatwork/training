import { Route, Routes, Navigate } from 'react-router-dom';

import IntermediateDashboard from './IntermediateDashboard.jsx';

import FarmsPage from './pages/FarmsPage.jsx';
import CropsPage from './pages/CropsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import SoilIrrigationPage from './pages/SoilIrrigationPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import WeatherPage from './pages/WeatherPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
export default function IntermediateRoutes({ user }) {
  return (
    <Routes>
      <Route path="dashboard" element={<IntermediateDashboard user={user} />} />
      <Route path="farms" element={<FarmsPage />} />
      <Route path="crops" element={<CropsPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="soil-irrigation" element={<SoilIrrigationPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="market" element={<MarketPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="weather" element={<WeatherPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
