import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Heart, LayoutDashboard, Activity, Pill, Apple, LogOut } from "lucide-react";
import { supabase } from "@/react-app/lib/supabase";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      if (!session) {
        navigate("/", { replace: true });
        return;
      }

      setEmail(session.user.email ?? null);
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/", { replace: true });
      } else {
        setEmail(session.user.email ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vitals", href: "/vitals", icon: Heart },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Diet", href: "/diet", icon: Apple },
    { name: "Medications", href: "/medications", icon: Pill },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-lg opacity-30 rounded-full"></div>
              <Heart className="w-10 h-10 text-rose-500 relative" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CardioFlow</h1>
              {email && <p className="text-xs text-gray-500">{email}</p>}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-gray-200 shadow-sm hover:shadow transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </header>

        {/* Nav */}
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-sm transition ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
