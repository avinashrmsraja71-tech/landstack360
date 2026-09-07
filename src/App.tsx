import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DemoGuideModal } from './components/common/DemoGuideModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { Parcel360Modal } from './components/parcel/Parcel360Modal';
import { BuildabilityModal } from './components/parcel/BuildabilityModal';
import { DueDiligenceModal } from './components/parcel/DueDiligenceModal';
import { AiChangeDetectionView } from './components/ai/AiChangeDetectionView';
import { LocationSurroundingsModal } from './components/common/LocationSurroundingsModal';

import { HomePage } from './pages/HomePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { CitizenPage } from './pages/CitizenPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AdminPage } from './pages/AdminPage';
import { FieldOfficerPage } from './pages/FieldOfficerPage';
import { ApiHubPage } from './pages/ApiHubPage';

const AppLayout: React.FC = () => {
  const {
    isParcel360Open,
    closeParcel360,
    isDueDiligenceOpen,
    closeDueDiligence,
    isBuildCheckerOpen,
    closeBuildChecker,
    isAiDetectionOpen,
    closeAiDetection,
    isDemoGuideOpen,
    closeDemoGuide,
    isNotificationsOpen,
    closeNotifications,
    isLocationModalOpen,
    closeLocationSurroundings,
    modalParcel,
    selectedParcel,
  } = useApp();

  const targetParcel = modalParcel || selectedParcel;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/citizen" element={<CitizenPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/field-officer" element={<FieldOfficerPage />} />
            <Route path="/api-hub" element={<ApiHubPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Action Modals */}
      {targetParcel && (
        <>
          <Parcel360Modal
            parcel={targetParcel}
            isOpen={isParcel360Open}
            onClose={closeParcel360}
          />
          <BuildabilityModal
            parcel={targetParcel}
            isOpen={isBuildCheckerOpen}
            onClose={closeBuildChecker}
          />
          <DueDiligenceModal
            parcel={targetParcel}
            isOpen={isDueDiligenceOpen}
            onClose={closeDueDiligence}
          />
          <AiChangeDetectionView
            parcel={targetParcel}
            isOpen={isAiDetectionOpen}
            onClose={closeAiDetection}
          />
        </>
      )}

      {/* 10-Step Interactive Presentation Tour Guide */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={closeDemoGuide}
      />

      {/* Location & Surroundings Intelligence Modal */}
      <LocationSurroundingsModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationSurroundings}
      />

      {/* Real-time System Notification Center */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={closeNotifications}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
