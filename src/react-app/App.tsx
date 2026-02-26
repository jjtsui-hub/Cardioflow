import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import LandingPage from "@/react-app/pages/Landing";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import OnboardingPage from "@/react-app/pages/Onboarding";
import DashboardPage from "@/react-app/pages/Dashboard";
import VitalsPage from "@/react-app/pages/Vitals";
import ActivityPage from "@/react-app/pages/Activity";
import MedicationsPage from "@/react-app/pages/Medications";
import DietPage from "@/react-app/pages/Diet";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vitals" element={<VitalsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/diet" element={<DietPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
