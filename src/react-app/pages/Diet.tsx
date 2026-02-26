import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import Layout from "@/react-app/components/Layout";
import { Apple, Plus, Calendar, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { DietLog } from "@/shared/types";

export default function Diet() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    is_heart_healthy: true,
    logged_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchDietLogs();
    }
  }, [user, isPending, navigate]);

  const fetchDietLogs = async () => {
    try {
      const response = await fetch("/api/diet");
      const data = await response.json();
      setDietLogs(data);
    } catch (error) {
      console.error("Failed to fetch diet logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setFormData({
        description: "",
        is_heart_healthy: true,
        logged_date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchDietLogs();
    } catch (error) {
      console.error("Failed to log diet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Apple className="w-12 h-12 text-emerald-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  const dietSuggestions = [
    "Ate low-sodium meal",
    "Had 5 servings of vegetables",
    "Avoided processed foods",
    "Drank 8 glasses of water",
    "Limited sugar intake",
    "Ate whole grain breakfast",
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Tracking</h1>
            <p className="text-gray-600">Log your heart-healthy eating habits</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Diet
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Diet Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="What did you eat or achieve today?"
                  list="diet-suggestions"
                />
                <datalist id="diet-suggestions">
                  {dietSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart-Healthy?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_heart_healthy: true })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      formData.is_heart_healthy
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_heart_healthy: false })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      !formData.is_heart_healthy
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.logged_date}
                  onChange={(e) => setFormData({ ...formData, logged_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {dietLogs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-gray-100 text-center">
              <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No diet entries yet</h3>
              <p className="text-gray-600">Start tracking your heart-healthy eating habits</p>
            </div>
          ) : (
            dietLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 bg-gradient-to-br ${log.is_heart_healthy ? 'from-emerald-500 to-teal-500' : 'from-orange-500 to-amber-500'} rounded-xl flex items-center justify-center`}>
                      {log.is_heart_healthy ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <X className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{log.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(log.logged_date), "MMM d, yyyy")}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.is_heart_healthy
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {log.is_heart_healthy ? "Heart-Healthy" : "Treat"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
