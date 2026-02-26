import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Heart, Activity, TrendingDown, Calendar } from "lucide-react";

export default function Landing() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-rose-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-xl opacity-30 rounded-full"></div>
              <Heart className="w-16 h-16 text-rose-500 relative animate-pulse" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            CardioFlow
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personalized heart health companion. Track vitals, build healthy habits, and take control of your cardiovascular wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Vitals</h3>
            <p className="text-gray-600">
              Log blood pressure, heart rate, and weight with easy-to-read visualizations over time.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Healthy Habits</h3>
            <p className="text-gray-600">
              Track exercise, medication compliance, and diet with motivating streak counters.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitor Progress</h3>
            <p className="text-gray-600">
              Generate detailed reports to share with your healthcare provider and celebrate milestones.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={redirectToLogin}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Heart className="w-5 h-5" />
            Get Started with Google
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Free to use. Secure and private.
          </p>
        </div>
      </div>
    </div>
  );
}
