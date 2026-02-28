import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Pill, Plus, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Medication, MedicationLog } from "@/shared/types";
import { supabase } from "@/react-app/lib/supabase";
import { apiFetch } from "@/react-app/lib/api";

export default function Medications() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    reminder_time: "",
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

      await fetchData();
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medsResponse, logsResponse] = await Promise.all([
        apiFetch("/api/medications"),
        apiFetch("/api/medication-logs"),
      ]);

      const medsData = await medsResponse.json();
      const logsData = await logsResponse.json();

      setMedications(medsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch medications/logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/api/medications", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setFormData({
        name: "",
        dosage: "",
        frequency: "",
        reminder_time: "",
      });
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to add medication:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMedication = async (medicationId: number) => {
    try {
      await apiFetch("/api/medication-logs", {
        method: "POST",
        body: JSON.stringify({ medication_id: medicationId }),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to log medication:", error);
    }
  };

  const getTodayLogs = (medicationId: number) => {
    const today = new Date().toISOString().split("T")[0];
    return logs.filter(
      (log) => log.medication_id === medicationId && log.taken_at.startsWith(today)
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Pill className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medications</h1>
            <p className="text-gray-600">Track your medication schedule and compliance</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Medication</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lisinopril"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Once daily"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) =>
                    setFormData({ ...formData, reminder_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {medications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-gray-100 text-center">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No medications added yet
              </h3>
              <p className="text-gray-600">
                Add your medications to track compliance and set reminders
              </p>
            </div>
          ) : (
            medications.map((medication) => {
              const todayLogs = getTodayLogs(medication.id);
              const isTakenToday = todayLogs.length > 0;

              return (
                <div
                  key={medication.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${
                          isTakenToday
                            ? "from-emerald-500 to-teal-500"
                            : "from-blue-500 to-cyan-500"
                        } rounded-xl flex items-center justify-center`}
                      >
                        {isTakenToday ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <Pill className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {medication.name}
                        </h3>

                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          {medication.dosage && <p>Dosage: {medication.dosage}</p>}
                          {medication.frequency && (
                            <p>Frequency: {medication.frequency}</p>
                          )}
                          {medication.reminder_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Reminder: {medication.reminder_time}
                            </div>
                          )}
                        </div>

                        {isTakenToday && (
                          <p className="text-sm text-emerald-600 font-medium mt-2">
                            ✓ Taken today at{" "}
                            {format(new Date(todayLogs[0].taken_at), "h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isTakenToday && (
                      <button
                        onClick={() => handleLogMedication(medication.id)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        Mark Taken
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
