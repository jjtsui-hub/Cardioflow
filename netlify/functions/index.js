const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/index", "");
  const method = event.httpMethod;

  // Handle preflight (usually not needed on same-origin, but safe)
  if (method === "OPTIONS") {
    return response(200, { ok: true });
  }

  const getBody = () => {
    try {
      return JSON.parse(event.body || "{}");
    } catch {
      return {};
    }
  };

  // Support both "authorization" and "Authorization"
  const getAuthHeader = () =>
    event.headers.authorization || event.headers.Authorization || "";

  // Get user from Supabase JWT (sent from frontend)
  const getUser = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data.user;
  };

  const user = await getUser();

  // Helper: require login
  const requireUser = () => {
    if (!user) return response(401, { error: "Unauthorized" });
    return null;
  };

  // ===== USERS =====
  if (path === "/api/users/me" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;
    return response(200, user);
  }

  // ===== PROFILE =====
  if (path === "/api/profile" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/profile" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...body })
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== GOALS =====
  if (path === "/api/goals" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/goals" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();

    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: user.id, ...body })
      .select();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== VITALS =====
  if (path === "/api/vitals" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("vitals")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/vitals" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();

    // Expecting: log_type, systolic/diastolic/heart_rate OR weight_lbs, notes
    const payload = {
      user_id: user.id,
      log_type: body.log_type,
      systolic: body.systolic ?? null,
      diastolic: body.diastolic ?? null,
      heart_rate: body.heart_rate ?? null,
      weight_lbs: body.weight_lbs ?? null,
      notes: body.notes ?? null,
      logged_at: body.logged_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("vitals")
      .insert(payload)
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== MEDICATIONS =====
  if (path === "/api/medications" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/medications" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();
    const payload = {
      user_id: user.id,
      name: body.name,
      dosage: body.dosage ?? null,
      frequency: body.frequency ?? null,
      reminder_time: body.reminder_time ?? null,
    };

    const { data, error } = await supabase
      .from("medications")
      .insert(payload)
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== MEDICATION LOGS =====
  if (path === "/api/medication-logs" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("taken_at", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/medication-logs" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();
    const payload = {
      user_id: user.id,
      medication_id: body.medication_id,
      taken_at: body.taken_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("medication_logs")
      .insert(payload)
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== DIET =====
  if (path === "/api/diet" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("diet_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/diet" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();
    const payload = {
      user_id: user.id,
      description: body.description,
      is_heart_healthy: !!body.is_heart_healthy,
      logged_date: body.logged_date, // expect "YYYY-MM-DD"
      notes: body.notes ?? null,
    };

    const { data, error } = await supabase
      .from("diet_logs")
      .insert(payload)
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== ACTIVITIES =====
  if (path === "/api/activities" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false });

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/activities" && method === "POST") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const body = getBody();
    const payload = {
      user_id: user.id,
      activity_type: body.activity_type,
      duration_minutes: body.duration_minutes,
      intensity: body.intensity ?? "moderate",
      logged_date: body.logged_date, // expect "YYYY-MM-DD"
      notes: body.notes ?? null,
    };

    const { data, error } = await supabase
      .from("activity_logs")
      .insert(payload)
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== DASHBOARD STATS =====
  if (path === "/api/dashboard/stats" && method === "GET") {
    const unauth = requireUser();
    if (unauth) return unauth;

    const { data: vitals, error: vitErr } = await supabase
      .from("vitals")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_type", "blood_pressure")
      .order("logged_at", { ascending: false })
      .limit(1);

    if (vitErr) return response(400, { error: vitErr.message });

    // (Optional) streaks could be computed later; return 0 for now
    return response(200, {
      activity_streak: 0,
      diet_streak: 0,
      medication_streak: 0,
      latest_bp: vitals?.[0] || null,
    });
  }

  return response(404, { error: "Not found", path, method });
};

function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}
