import { LucideIcon } from "lucide-react";

interface StreakCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: string;
}

export default function StreakCard({ title, count, icon: Icon, color }: StreakCardProps) {
  const colorClasses = {
    rose: "from-rose-500 to-pink-500 bg-rose-100 text-rose-700",
    blue: "from-blue-500 to-cyan-500 bg-blue-100 text-blue-700",
    emerald: "from-emerald-500 to-teal-500 bg-emerald-100 text-emerald-700",
  }[color] || "from-gray-500 to-gray-600 bg-gray-100 text-gray-700";

  const [gradient, bg, text] = colorClasses.split(" ");

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`px-3 py-1 ${bg} ${text} rounded-full text-sm font-semibold`}>
          {count} days
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{count}-day streak</p>
    </div>
  );
}
