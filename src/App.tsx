import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTabType } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PersonnelListView } from './views/PersonnelListView';
import { PersonnelDetailView } from './views/PersonnelDetailView';
import { DocumentListView } from './views/DocumentListView';
import { AuditLogView } from './views/AuditLogView';
import { UserManagementView } from './views/UserManagementView';
import { OrganizationManagementView } from './views/OrganizationManagementView';
import { RolePermissionView } from './views/RolePermissionView';
import { ReportsView } from './views/ReportsView';
import { SystemSettingsView } from './views/SystemSettingsView';
import { SecurityTesterModal } from './components/SecurityTesterModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { SessionLockModal } from './components/SessionLockModal';
import { Personnel } from './types';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTabType>('DASHBOARD');
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isArchDocsModalOpen, setIsArchDocsModalOpen] = useState<boolean>(false);

  // If not logged in, show official Government Login
  if (!currentUser) {
    return <LoginView />;
  }

  const handleSelectPersonnel = (p: Personnel) => {
    setSelectedPersonnel(p);
    setActiveTab('PERSONNEL');
  };

  const handleNavigateTab = (tab: ActiveTabType) => {
    if (tab !== 'PERSONNEL') {
      setSelectedPersonnel(null);
    }
    if (tab === 'SECURITY_LAB') {
      setIsSecurityModalOpen(true);
      return;
    }
    if (tab === 'ARCHITECTURE_DOCS') {
      setIsArchDocsModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Top Government Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarMobileOpen(prev => !prev)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenArchDocsModal={() => setIsArchDocsModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
        />

        {/* Backdrop for mobile sidebar */}
        {isSidebarMobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
            onClick={() => setIsSidebarMobileOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'DASHBOARD' && (
              <DashboardView
                onSelectPersonnel={handleSelectPersonnel}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {activeTab === 'PERSONNEL' && (
              selectedPersonnel ? (
                <PersonnelDetailView
                  personnel={selectedPersonnel}
                  onBack={() => setSelectedPersonnel(null)}
                />
              ) : (
                <PersonnelListView
                  onSelectPersonnel={handleSelectPersonnel}
                />
              )
            )}

            {activeTab === 'DOCUMENTS' && <DocumentListView />}
            {activeTab === 'AUDIT_LOGS' && <AuditLogView />}
            {activeTab === 'USERS' && <UserManagementView />}
            {activeTab === 'ORGANIZATIONS' && <OrganizationManagementView />}
            {activeTab === 'ROLES' && <RolePermissionView />}
            {activeTab === 'REPORTS' && <ReportsView />}
            {activeTab === 'SETTINGS' && <SystemSettingsView />}
          </div>
        </main>
      </div>

      {/* Security Tester Modal (IDOR & Tenant Isolation Lab) */}
      <SecurityTesterModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Master 21 Architecture Sections Modal */}
      <ArchitectureDocsModal
        isOpen={isArchDocsModalOpen}
        onClose={() => setIsArchDocsModalOpen(false)}
      />

      {/* Auto / Manual Session Lock Modal */}
      <SessionLockModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
