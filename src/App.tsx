import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import FleetOverviewPage from './pages/admin/FleetOverviewPage'
import DevicesPage from './pages/admin/DevicesPage'
import AlertsPage from './pages/admin/AlertsPage'
import MaintenancePage from './pages/admin/MaintenancePage'
import DashboardPage from './pages/DashboardPage'
import EnergyPage from './pages/EnergyPage'
import CarbonPage from './pages/CarbonPage'
import InsightsPage from './pages/InsightsPage'
import ReportsPage from './pages/ReportsPage'
import ReportDetailPage from './pages/ReportDetailPage'
import CbamPage from './pages/CbamPage'
import EnergySavingsPage from './pages/EnergySavingsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="energy" element={<EnergyPage />} />
            <Route path="carbon" element={<CarbonPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:slug" element={<ReportDetailPage />} />
            <Route path="cbam" element={<CbamPage />} />
            <Route path="savings" element={<EnergySavingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<FleetOverviewPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
