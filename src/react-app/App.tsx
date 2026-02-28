import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/react-app/lib/supabase";

import LandingPage from "@/react-app/pages/Landing";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import OnboardingPage from "@/react-app/pages/Onboarding";
import DashboardPage from "@/react-app/pages/Dashboard";
import VitalsPage from "@/react-app/pages/Vitals";
import DietPage from "@/react-app/pages/Diet";
import MedicationsPage from "@/react-app/pages/Medications";
import ActivityPage from "@/react-app/pages/Activity";

function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setHasSession(!!data.session);
      setLoading(false);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!hasSession) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/vitals"
          element={
            <RequireAuth>
              <VitalsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/diet"
          element={
            <RequireAuth>
              <DietPage />
            </RequireAuth>
          }
        />
        <Route
          path="/medications"
          element={
            <RequireAuth>
              <MedicationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/activity"
          element={
            <RequireAuth>
              <ActivityPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
