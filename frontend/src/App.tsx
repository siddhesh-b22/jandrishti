import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HouseProvider } from './context/HouseContext';
import { RoleProvider } from './context/RoleContext';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { WorkExplorerPage } from './pages/WorkExplorerPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { AnomalyCenterPage } from './pages/AnomalyCenterPage';
import { MpExplorerPage } from './pages/MpExplorerPage';
import { MpDetailPage } from './pages/MpDetailPage';
import { VendorExplorerPage } from './pages/VendorExplorerPage';
import { TransactionExplorerPage } from './pages/TransactionExplorerPage';
import { StatesPage } from './pages/StatesPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { CasesAlertsPage } from './pages/CasesAlertsPage';
import { DuplicateDetectionPage } from './pages/DuplicateDetectionPage';
import { DataQualityPage } from './pages/DataQualityPage';

export const App: React.FC = () => {
  return (
    <HouseProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<OverviewPage />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </HouseProvider>
  );
};
