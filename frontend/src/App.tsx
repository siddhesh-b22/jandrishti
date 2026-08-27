import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HouseProvider } from './context/HouseContext';
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

export const App: React.FC = () => {
  return (
    <HouseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OverviewPage />} />
            <Route path="works" element={<WorkExplorerPage />} />
            <Route path="works/:workId" element={<WorkDetailPage />} />
            <Route path="anomalies" element={<AnomalyCenterPage />} />
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
    </HouseProvider>
  );
};
