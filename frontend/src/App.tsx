import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HouseProvider } from './context/HouseContext';
import { RoleProvider, useRole } from './context/RoleContext';
import { Layout } from './components/layout/Layout';
import { RoleRouteGuard } from './components/auth/RoleRouteGuard';
import { getRoleHomeRoute } from './utils/roleRoutes';

// Route-level code splitting with lazy loading
const OverviewPage = lazy(() => import('./pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const WorkExplorerPage = lazy(() => import('./pages/WorkExplorerPage').then(m => ({ default: m.WorkExplorerPage })));
const WorkDetailPage = lazy(() => import('./pages/WorkDetailPage').then(m => ({ default: m.WorkDetailPage })));
const AnomalyCenterPage = lazy(() => import('./pages/AnomalyCenterPage').then(m => ({ default: m.AnomalyCenterPage })));
const CasesAlertsPage = lazy(() => import('./pages/CasesAlertsPage').then(m => ({ default: m.CasesAlertsPage })));
const DuplicateDetectionPage = lazy(() => import('./pages/DuplicateDetectionPage').then(m => ({ default: m.DuplicateDetectionPage })));
const DataQualityPage = lazy(() => import('./pages/DataQualityPage').then(m => ({ default: m.DataQualityPage })));
const MpExplorerPage = lazy(() => import('./pages/MpExplorerPage').then(m => ({ default: m.MpExplorerPage })));
const MpDetailPage = lazy(() => import('./pages/MpDetailPage').then(m => ({ default: m.MpDetailPage })));
const VendorExplorerPage = lazy(() => import('./pages/VendorExplorerPage').then(m => ({ default: m.VendorExplorerPage })));
const TransactionExplorerPage = lazy(() => import('./pages/TransactionExplorerPage').then(m => ({ default: m.TransactionExplorerPage })));
const StatesPage = lazy(() => import('./pages/StatesPage').then(m => ({ default: m.StatesPage })));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage').then(m => ({ default: m.MethodologyPage })));
const TrackAreaPage = lazy(() => import('./pages/TrackAreaPage').then(m => ({ default: m.TrackAreaPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(m => ({ default: m.ComparePage })));
const DataIngestionPage = lazy(() => import('./pages/DataIngestionPage').then(m => ({ default: m.DataIngestionPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage').then(m => ({ default: m.DocumentationPage })));

// Dedicated Role Workspaces
const MinistryWorkspace = lazy(() => import('./pages/workspaces/MinistryWorkspace').then(m => ({ default: m.MinistryWorkspace })));
const StateWorkspace = lazy(() => import('./pages/workspaces/StateWorkspace').then(m => ({ default: m.StateWorkspace })));
const DistrictWorkspace = lazy(() => import('./pages/workspaces/DistrictWorkspace').then(m => ({ default: m.DistrictWorkspace })));
const MpWorkspace = lazy(() => import('./pages/workspaces/MpWorkspace').then(m => ({ default: m.MpWorkspace })));
const AuditorWorkspace = lazy(() => import('./pages/workspaces/AuditorWorkspace').then(m => ({ default: m.AuditorWorkspace })));
const CitizenWorkspace = lazy(() => import('./pages/workspaces/CitizenWorkspace').then(m => ({ default: m.CitizenWorkspace })));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8 font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#C85A32] border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-[#71717A] font-medium">Loading Statutory Workspace...</span>
    </div>
  </div>
);

// Automatic redirect from /dashboards to role's home workspace
const RoleDashboardRedirect: React.FC = () => {
  const { user } = useRole();
  return <Navigate to={getRoleHomeRoute(user?.role)} replace />;
};

export const App: React.FC = () => {
  return (
    <HouseProvider>
      <RoleProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<OverviewPage />} />
                <Route path="explore" element={<CitizenWorkspace />} />
                <Route path="dashboards" element={<RoleDashboardRedirect />} />

                {/* Statutory Role Dedicated Workspaces */}
                <Route
                  path="admin/national"
                  element={
                    <RoleRouteGuard allowedRoles={['MINISTRY_ADMIN', 'MINISTRY_OFFICIAL']}>
                      <MinistryWorkspace />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="admin/state"
                  element={
                    <RoleRouteGuard allowedRoles={['STATE_NODAL_AUTHORITY', 'MINISTRY_ADMIN']}>
                      <StateWorkspace />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="admin/district"
                  element={
                    <RoleRouteGuard allowedRoles={['DISTRICT_AUTHORITY', 'MINISTRY_ADMIN']}>
                      <DistrictWorkspace />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="mp/constituency"
                  element={
                    <RoleRouteGuard allowedRoles={['MP', 'MINISTRY_ADMIN']}>
                      <MpWorkspace />
                    </RoleRouteGuard>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <RoleRouteGuard allowedRoles={['AUDITOR', 'MINISTRY_ADMIN']}>
                      <AuditorWorkspace />
                    </RoleRouteGuard>
                  }
                />

                {/* Analytical & Discovery Ledgers */}
                <Route path="ingest" element={<DataIngestionPage />} />
                <Route path="track-area" element={<TrackAreaPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="works" element={<WorkExplorerPage />} />
                <Route path="works/:workId" element={<WorkDetailPage />} />
                <Route path="anomalies" element={<AnomalyCenterPage />} />
                <Route path="cases" element={<CasesAlertsPage />} />
                <Route path="alerts" element={<CasesAlertsPage />} />
                <Route path="duplicates" element={<DuplicateDetectionPage />} />
                <Route path="data-quality" element={<DataQualityPage />} />
                <Route path="mps" element={<MpExplorerPage />} />
                <Route path="mps/:mpId" element={<MpDetailPage />} />
                <Route path="vendors" element={<VendorExplorerPage />} />
                <Route path="transactions" element={<TransactionExplorerPage />} />
                <Route path="states" element={<StatesPage />} />
                <Route path="methodology" element={<MethodologyPage />} />
                <Route path="docs" element={<DocumentationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </RoleProvider>
    </HouseProvider>
  );
};
