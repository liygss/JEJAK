import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { NodeReportProvider } from './lib/NodeReportContext'
import { FuelLogProvider } from './lib/FuelLogContext'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const CbamShowcasePage = lazy(() => import('./pages/CbamShowcasePage'))
const FleetOverviewPage = lazy(() => import('./pages/admin/FleetOverviewPage'))
const DevicesPage = lazy(() => import('./pages/admin/DevicesPage'))
const AlertsPage = lazy(() => import('./pages/admin/AlertsPage'))
const MaintenancePage = lazy(() => import('./pages/admin/MaintenancePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EnergyPage = lazy(() => import('./pages/EnergyPage'))
const CarbonPage = lazy(() => import('./pages/CarbonPage'))
const FuelPage = lazy(() => import('./pages/FuelPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'))
const CbamPage = lazy(() => import('./pages/CbamPage'))
const EnergySavingsPage = lazy(() => import('./pages/EnergySavingsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function App() {
  return (
    <NodeReportProvider>
      <FuelLogProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-main-bg text-sm text-secondary-text">
                  Memuat JEJAK…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/laporan-cbam" element={<CbamShowcasePage />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="overview" element={<Navigate to="/dashboard" replace />} />
                  <Route path="energy" element={<EnergyPage />} />
                  <Route path="carbon" element={<CarbonPage />} />
                  <Route path="fuel" element={<FuelPage />} />
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
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </FuelLogProvider>
    </NodeReportProvider>
  )
}

export default App
