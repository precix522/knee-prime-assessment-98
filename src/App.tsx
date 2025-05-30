
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import ManageUsers from "./pages/ManageUsers";
import Login from "./pages/Login";
import ContactUs from "./pages/ContactUs";
import ManagePatients from "./pages/ManagePatients";
import PatientID from "./pages/PatientID";
import { AuthInitializer } from "./components/AuthInitializer";
import { Footer } from "./components/Footer";
import NotFound from "./pages/NotFound";
import ReportViewer from "./pages/ReportViewer";
import AllReports from "./pages/AllReports";
import Logout from "./pages/Logout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import GeneralLogin from "./pages/GeneralLogin";
import { Toaster } from "sonner";
import { ChatbotWidget } from "./components/ChatbotWidget";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/general-login" element={<GeneralLogin />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/manage-patients" element={<ManagePatients />} />
            <Route path="/patient/:id" element={<PatientID />} />
            <Route path="/report/:id" element={<ReportViewer />} />
            <Route path="/report-viewer" element={<ReportViewer />} />
            <Route path="/reports" element={<AllReports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster position="bottom-left" />
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  );
}
