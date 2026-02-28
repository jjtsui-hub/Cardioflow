import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Apple, Plus, Calendar, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { DietLog } from "@/shared/types";
import { supabase } from "@/react-app/lib/supabase";
import { apiFetch } from "@/react-app/lib/api";

export default function Diet() {
  const navigate = useNavigate();
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    is_heart_healthy: true,
    logged_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

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
      await fetchDietLogs();
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchDietLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/diet");
      const data = await res.json();
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
      await apiFetch("/api/diet", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setFormData({
        description: "",
        is_heart_healthy: true,
        logged_date: new Date().toISOString().split("T")[0],
        notes: "",
      });

      setShowForm(false);
      await fetchDietLogs();
    } catch (error) {
      console.error("Failed to add diet log:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Apple className="w-12 h-12 text-emerald-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Tracking</h1>
            <p className="text-gray-600">Log meals and track heart-healthy choices</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Meal
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Meal Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.logged_date}
                  onChange={(e) => setFormData({ ...formData, logged_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Grilled salmon with vegetables"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="heartHealthy"
                  type="checkbox"
                  checked={formData.is_heart_healthy}
                  onChange={(e) => setFormData({ ...formData, is_heart_healthy: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="heartHealthy" className="text-sm text-gray-700">
                  Heart healthy choice
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={2}
                  placeholder="Any details..."
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
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {dietLogs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-gray-100 text-center">
              <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals logged yet</h3>
              <p className="text-gray-600">Start by logging your first meal</p>
            </div>
          ) : (
            dietLogs.map((log) => (
              <div key={log.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        log.is_heart_healthy ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}
                    >
                      {log.is_heart_healthy ? <Check className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{log.description}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(log.logged_date), "MMM d, yyyy")}
                      </p>
                      {log.notes && <p className="text-sm text-gray-600 mt-2">{log.notes}</p>}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.is_heart_healthy ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {log.is_heart_healthy ? "Heart healthy" : "Not marked"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
