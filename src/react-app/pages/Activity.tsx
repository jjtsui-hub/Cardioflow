import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Activity as ActivityIcon, Plus, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLog } from "@/shared/types";
import { supabase } from "@/react-app/lib/supabase";
import { apiFetch } from "@/react-app/lib/api";

export default function Activity() {
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    activity_type: "",
    duration_minutes: "",
    intensity: "moderate",
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
      await fetchActivityLogs();
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/activities");
      const data = await res.json();
      setActivityLogs(data);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          activity_type: formData.activity_type,
          duration_minutes: parseInt(formData.duration_minutes),
          intensity: formData.intensity,
          logged_date: formData.logged_date,
          notes: formData.notes || undefined,
        }),
      });

      setFormData({
        activity_type: "",
        duration_minutes: "",
        intensity: "moderate",
        logged_date: new Date().toISOString().split("T")[0],
        notes: "",
      });

      setShowForm(false);
      await fetchActivityLogs();
    } catch (error) {
      console.error("Failed to add activity log:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <ActivityIcon className="w-12 h-12 text-purple-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Tracking</h1>
            <p className="text-gray-600">Log workouts and stay consistent</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Activity
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Activity Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.logged_date}
                  onChange={(e) => setFormData({ ...formData, logged_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <input
                  type="text"
                  required
                  value={formData.activity_type}
                  onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Walking, Cycling, Gym"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {activityLogs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-gray-100 text-center">
              <ActivityIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities logged yet</h3>
              <p className="text-gray-600">Start by logging your first activity</p>
            </div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <ActivityIcon className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{log.activity_type}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(log.logged_date), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {log.duration_minutes} min
                        </span>
                      </p>
                      {log.notes && <p className="text-sm text-gray-600 mt-2">{log.notes}</p>}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {log.intensity}
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
