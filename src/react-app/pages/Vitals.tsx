import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Heart, Plus, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { VitalLog } from "@/shared/types";
import { supabase } from "@/react-app/lib/supabase";
import { apiFetch } from "@/react-app/lib/api";

export default function Vitals() {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState<VitalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [logType, setLogType] = useState<"blood_pressure" | "weight">("blood_pressure");

  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heart_rate: "",
    weight_lbs: "",
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

      await fetchVitals();
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/vitals");
      const data = await response.json();
      setVitals(data);
    } catch (error) {
      console.error("Failed to fetch vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { log_type: logType };

      if (logType === "blood_pressure") {
        payload.systolic = parseInt(formData.systolic);
        payload.diastolic = parseInt(formData.diastolic);
        payload.heart_rate = parseInt(formData.heart_rate);
      } else {
        payload.weight_lbs = parseFloat(formData.weight_lbs);
      }

      if (formData.notes) payload.notes = formData.notes;

      await apiFetch("/api/vitals", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setFormData({
        systolic: "",
        diastolic: "",
        heart_rate: "",
        weight_lbs: "",
        notes: "",
      });
      setShowForm(false);
      await fetchVitals();
    } catch (error) {
      console.error("Failed to log vital:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  const bpData = vitals
    .filter((v) => v.log_type === "blood_pressure")
    .slice(0, 30)
    .reverse()
    .map((v) => ({
      date: format(new Date(v.logged_at), "M/d"),
      systolic: v.systolic,
      diastolic: v.diastolic,
      heart_rate: v.heart_rate,
    }));

  const weightData = vitals
    .filter((v) => v.log_type === "weight")
    .slice(0, 30)
    .reverse()
    .map((v) => ({
      date: format(new Date(v.logged_at), "M/d"),
      weight: v.weight_lbs,
    }));

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vitals Tracking</h1>
            <p className="text-gray-600">
              Monitor your blood pressure, heart rate, and weight
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Vitals
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Vital Entry</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setLogType("blood_pressure")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    logType === "blood_pressure"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Blood Pressure
                </button>

                <button
                  type="button"
                  onClick={() => setLogType("weight")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    logType === "weight"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Weight
                </button>
              </div>

              {logType === "blood_pressure" ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.heart_rate}
                      onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="72"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight_lbs}
                    onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={2}
                  placeholder="Any observations..."
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
                  className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {bpData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-gray-900">Blood Pressure Trend</h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 4 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 4 }} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {weightData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Weight Trend</h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Weight (lbs)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Layout>
  );
}
