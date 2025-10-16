/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import DashboardPage from "./components/pages/Dashboard";
import AppointmentDetailPage from "./components/pages/AppointmentDetail";
import AppointmentsPage from "./components/pages/Appointment";
import WorkSchedulePage from "./components/pages/WorkSchedule";
import MedicalRecordsPage from "./components/pages/MedicalRecord";
import PrescriptionsPage from "./components/pages/Prescription";
import LeaveRequestsPage from "./components/pages/LeaveRequests";
import CertificatesPage from "./components/pages/Certificate";
import LoginPage from "./components/pages/Login";
import Layout from "./layout";
import { useAuth } from "./hooks/use-auth";
import { AuthProvider } from "./context/auth-context";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageData, setPageData] = useState<any>(null);

  const handleLogout = () => {
    setCurrentPage("dashboard");
    setPageData(null);
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "appointment-detail":
        return (
          <AppointmentDetailPage
            appointment={pageData}
            onBack={() => setCurrentPage("dashboard")}
          />
        );
      case "appointments":
        return <AppointmentsPage onNavigate={handleNavigate} />;
      case "schedule":
        return <WorkSchedulePage />;
      case "records":
        return <MedicalRecordsPage onNavigate={handleNavigate} />;
      case "prescriptions":
        return <PrescriptionsPage onNavigate={handleNavigate} />;
      case "leave":
        return <LeaveRequestsPage />;
      case "certificates":
        return <CertificatesPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderCurrentPage()}
      </Layout>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
