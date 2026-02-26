import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import Layout from "@/react-app/components/Layout";
import StreakCard from "@/react-app/components/StreakCard";
import { Activity, Apple, Pill, Heart, TrendingUp, Award } from "lucide-react";

interface DashboardStats {
  activity_streak: number;
  diet_streak: number;
  medication_streak: number;
  latest_bp: {
    systolic: number;
    diastolic: number;
    heart_rate: number;
    logged_at: string;
  } | null;
}

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, isPending, navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) {
      return { label: "Normal", color: "text-emerald-600", bgColor: "bg-emerald-100" };
    } else if (systolic < 130 && diastolic < 80) {
      return { label: "Elevated", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    } else if (systolic < 140 || diastolic < 90) {
      return { label: "Stage 1 HTN", color: "text-orange-600", bgColor: "bg-orange-100" };
    } else {
      return { label: "Stage 2 HTN", color: "text-red-600", bgColor: "bg-red-100" };
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.google_user_data.given_name || "there"}
          </h1>
          <p className="text-gray-600">Here's your heart health overview</p>
        </div>

        {stats?.latest_bp && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Latest Blood Pressure</h2>
              <div className={`px-4 py-2 ${getBPStatus(stats.latest_bp.systolic, stats.latest_bp.diastolic).bgColor} ${getBPStatus(stats.latest_bp.systolic, stats.latest_bp.diastolic).color} rounded-lg font-semibold text-sm`}>
                {getBPStatus(stats.latest_bp.systolic, stats.latest_bp.diastolic).label}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Systolic</p>
                <p className="text-4xl font-bold text-gray-900">{stats.latest_bp.systolic}</p>
                <p className="text-xs text-gray-500 mt-1">mmHg</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Diastolic</p>
                <p className="text-4xl font-bold text-gray-900">{stats.latest_bp.diastolic}</p>
                <p className="text-xs text-gray-500 mt-1">mmHg</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Heart Rate</p>
                <p className="text-4xl font-bold text-gray-900">{stats.latest_bp.heart_rate}</p>
                <p className="text-xs text-gray-500 mt-1">bpm</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6">
              Logged {new Date(stats.latest_bp.logged_at).toLocaleDateString()} at {new Date(stats.latest_bp.logged_at).toLocaleTimeString()}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7-Day Streaks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <StreakCard
              title="Physical Activity"
              count={stats?.activity_streak || 0}
              icon={Activity}
              color="rose"
            />
            <StreakCard
              title="Medication Compliance"
              count={stats?.medication_streak || 0}
              icon={Pill}
              color="blue"
            />
            <StreakCard
              title="Heart-Healthy Diet"
              count={stats?.diet_streak || 0}
              icon={Apple}
              color="emerald"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/vitals")}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Log Vitals</h3>
            <p className="text-sm text-gray-600">Track blood pressure, heart rate, and weight</p>
          </button>

          <button
            onClick={() => navigate("/activity")}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Log Activity</h3>
            <p className="text-sm text-gray-600">Record your daily physical exercise</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
