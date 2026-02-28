import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import StreakCard from "@/react-app/components/StreakCard";
import { Activity, Apple, Pill, Heart, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/react-app/lib/supabase";
import { apiFetch } from "@/react-app/lib/api";

type DashboardStats = {
  activity_streak?: number;
  diet_streak?: number;
  medication_streak?: number;
  latest_bp?: any;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        navigate("/");
        return;
      }

      setCheckingSession(false);
      await fetchStats();
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  const activityStreak = stats?.activity_streak ?? 0;
  const dietStreak = stats?.diet_streak ?? 0;
  const medicationStreak = stats?.medication_streak ?? 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Your heart health overview</p>
          </div>

          <button
            onClick={() => navigate("/vitals")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            View Vitals
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StreakCard
            title="Activity Streak"
            value={activityStreak}
            icon={<Activity className="w-6 h-6 text-white" />}
            gradient="from-purple-500 to-indigo-500"
            onClick={() => navigate("/activity")}
          />
          <StreakCard
            title="Diet Streak"
            value={dietStreak}
            icon={<Apple className="w-6 h-6 text-white" />}
            gradient="from-emerald-500 to-teal-500"
            onClick={() => navigate("/diet")}
          />
          <StreakCard
            title="Medication Streak"
            value={medicationStreak}
            icon={<Pill className="w-6 h-6 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            onClick={() => navigate("/medications")}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-gray-900">Latest Blood Pressure</h2>
            </div>

            {stats?.latest_bp ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">
                  {stats.latest_bp.systolic}/{stats.latest_bp.diastolic}
                </div>
                {typeof stats.latest_bp.heart_rate === "number" && (
                  <div className="text-gray-600">Heart rate: {stats.latest_bp.heart_rate} bpm</div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No blood pressure entries yet.</p>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-gray-900">Next Step</h2>
            </div>
            <p className="text-gray-600 mb-4">Keep logging daily to build consistent habits.</p>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
