import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Heart } from "lucide-react";

export default function Onboarding() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    weight_lbs: "",
    height_inches: "",
    cardiac_condition: "",
    unit_system: "imperial" as "imperial" | "metric",
  });

  const [goals, setGoals] = useState([
    { goal_type: "blood_pressure", goal_description: "", target_value: 0 },
  ]);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : undefined,
        weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : undefined,
        height_inches: formData.height_inches ? parseFloat(formData.height_inches) : undefined,
        cardiac_condition: formData.cardiac_condition || undefined,
        unit_system: formData.unit_system,
      };

      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      for (const goal of goals) {
        if (goal.goal_description) {
          await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(goal),
          });
        }
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CardioFlow</h1>
          <p className="text-gray-600">Let's set up your health profile</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex justify-between mb-8">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-1 rounded-full ml-2 ${step >= 2 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_lbs}
                    onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_inches}
                    onChange={(e) => setFormData({ ...formData, height_inches: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your height"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardiac Condition (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.cardiac_condition}
                    onChange={(e) => setFormData({ ...formData, cardiac_condition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Hypertension, High cholesterol"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Health Goals</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal (Optional)
                  </label>
                  <input
                    type="text"
                    value={goals[0].goal_description}
                    onChange={(e) => {
                      const newGoals = [...goals];
                      newGoals[0].goal_description = e.target.value;
                      setGoals(newGoals);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Lower blood pressure to 120/80"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set a specific, measurable goal you'd like to achieve
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Setting up..." : "Complete Setup"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
