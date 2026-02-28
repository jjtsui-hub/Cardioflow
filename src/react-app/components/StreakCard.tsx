import type { ReactNode } from "react";

interface StreakCardProps {
  title: string;
  value: number;
  icon: ReactNode;           // ✅ instead of JSX.Element
  gradient: string;
  onClick?: () => void;
}

export default function StreakCard({ title, value, icon, gradient, onClick }: StreakCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>

        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </button>
  );
}
