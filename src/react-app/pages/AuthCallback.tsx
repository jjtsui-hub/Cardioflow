import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { supabase } from "@/react-app/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      try {
        // In Supabase v2, this often auto-detects session from URL.
        let { data, error } = await supabase.auth.getSession();

        // If there's no session yet but there is a code param, try exchanging explicitly.
        if (!data.session) {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          if (code) {
            const exchanged = await supabase.auth.exchangeCodeForSession(window.location.href);
            data = exchanged.data;
            error = exchanged.error;
          }
        }

        if (cancelled) return;

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/", { replace: true });
          return;
        }

        if (data.session) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (e) {
        console.error("Auth callback exception:", e);
        navigate("/", { replace: true });
      }
    };

    finish();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50">
      <div className="text-center">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse mx-auto mb-4" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}
