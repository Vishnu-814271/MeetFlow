import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventLayout from './components/EventLayout';
import LandingPage from './pages/LandingPage';
import JoinPage from './pages/JoinPage';
import DashboardPage from './pages/DashboardPage';
import DirectoryPage from './pages/DirectoryPage';
import TravelPage from './pages/TravelPage';
import CarpoolPage from './pages/CarpoolPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import ExportsPage from './pages/ExportsPage';
import PortalPage from './pages/PortalPage';
import TrackerMapPage from './pages/TrackerMapPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Portal Page to Join or Create Events */}
          <Route path="/" element={<PortalPage />} />
          
          {/* Join / Registration is outside the EventLayout since it doesn't need bottom nav */}
          <Route path="/event/:slug/join" element={<JoinPage />} />

          {/* Event Layout wraps pages that contain the main flow and navbars */}
          <Route path="/event/:slug" element={<EventLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="participants" element={<DirectoryPage />} />
            <Route path="travel" element={<TravelPage />} />
            <Route path="carpool" element={<CarpoolPage />} />
            <Route path="tracker-map" element={<TrackerMapPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="export" element={<ExportsPage />} />
          </Route>

          {/* Catch all to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
