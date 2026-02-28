const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/index", "");
  const method = event.httpMethod;

  const getBody = () => {
    try {
      return JSON.parse(event.body || "{}");
    } catch {
      return {};
    }
  };

  // Get user from JWT (sent from frontend)
  const getUser = async () => {
    const authHeader = event.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data.user;
  };

  const user = await getUser();

  // ===== USERS =====
  if (path === "/api/users/me" && method === "GET") {
    if (!user) return response(401, { error: "Unauthorized" });
    return response(200, user);
  }

  // ===== PROFILE =====
  if (path === "/api/profile" && method === "GET") {
    if (!user) return response(401, { error: "Unauthorized" });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/profile" && method === "POST") {
    if (!user) return response(401, { error: "Unauthorized" });

    const body = getBody();

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== GOALS =====
  if (path === "/api/goals" && method === "GET") {
    if (!user) return response(401, { error: "Unauthorized" });

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  if (path === "/api/goals" && method === "POST") {
    if (!user) return response(401, { error: "Unauthorized" });

    const body = getBody();

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select();

    if (error) return response(400, { error: error.message });
    return response(200, data);
  }

  // ===== DASHBOARD STATS =====
  if (path === "/api/dashboard/stats" && method === "GET") {
    if (!user) return response(401, { error: "Unauthorized" });

    const { data: vitals } = await supabase
      .from("vitals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    return response(200, {
      latest_bp: vitals?.[0] || null,
    });
  }

  return response(404, { error: "Not found" });
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
