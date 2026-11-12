import { Route, Routes, Navigate } from 'react-router-dom';

import ExpertDashboard from './ExpertDashboard.jsx';

import FarmsPage from './pages/FarmsPage.jsx';
import DiseasePage from './pages/DiseasePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import CropsPage from './pages/CropsPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import SchemesPage from './pages/SchemesPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import SoilIrrigationPage from './pages/SoilIrrigationPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import WeatherPage from './pages/WeatherPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ExpertPage from './pages/ExpertPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
export default function ExpertRoutes({ user }) {
  return (
    <Routes>
      <Route path="dashboard" element={<ExpertDashboard user={user} />} />
      <Route path="farms" element={<FarmsPage />} />
      <Route path="disease" element={<DiseasePage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="crops" element={<CropsPage />} />
      <Route path="market" element={<MarketPage />} />
      <Route path="schemes" element={<SchemesPage />} />
      <Route path="community" element={<CommunityPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="assistant" element={<AssistantPage />} />
      <Route path="soil-irrigation" element={<SoilIrrigationPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="weather" element={<WeatherPage />} />
      <Route path="marketplace" element={<MarketplacePage />} />
      <Route path="expert" element={<ExpertPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
