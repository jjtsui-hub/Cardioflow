const { URL } = require("url");

exports.handler = async (event, context) => {
  const path = event.path.replace("/.netlify/functions/index", "");
  const method = event.httpMethod;

  // Helper to parse body
  const getBody = () => {
    try {
      return JSON.parse(event.body || "{}");
    } catch {
      return {};
    }
  };

  // Dummy user (replace with real auth later)
  const user = { id: "demo-user" };

  // ===== ROUTES =====

  // Example: GET /api/users/me
  if (path === "/api/users/me" && method === "GET") {
    return response(200, user);
  }

  // ===== PROFILE =====
  if (path === "/api/profile" && method === "GET") {
    return response(200, { message: "GET profile (DB not connected yet)" });
  }

  if (path === "/api/profile" && method === "POST") {
    const body = getBody();
    return response(200, { message: "Profile saved", data: body });
  }

  // ===== GOALS =====
  if (path === "/api/goals" && method === "GET") {
    return response(200, []);
  }

  if (path === "/api/goals" && method === "POST") {
    const body = getBody();
    return response(200, { success: true, data: body });
  }

  // ===== VITALS =====
  if (path === "/api/vitals" && method === "GET") {
    return response(200, []);
  }

  if (path === "/api/vitals" && method === "POST") {
    const body = getBody();
    return response(200, { success: true, data: body });
  }

  // ===== MEDICATIONS =====
  if (path === "/api/medications" && method === "GET") {
    return response(200, []);
  }

  if (path === "/api/medications" && method === "POST") {
    const body = getBody();
    return response(200, { success: true, data: body });
  }

  // ===== ACTIVITY =====
  if (path === "/api/activities" && method === "GET") {
    return response(200, []);
  }

  if (path === "/api/activities" && method === "POST") {
    const body = getBody();
    return response(200, { success: true, data: body });
  }

  // ===== DIET =====
  if (path === "/api/diet" && method === "GET") {
    return response(200, []);
  }

  if (path === "/api/diet" && method === "POST") {
    const body = getBody();
    return response(200, { success: true, data: body });
  }

  // ===== DASHBOARD =====
  if (path === "/api/dashboard/stats" && method === "GET") {
    return response(200, {
      activity_streak: 0,
      diet_streak: 0,
      medication_streak: 0,
      latest_bp: null,
    });
  }

  // ===== FALLBACK =====
  return response(404, { error: "Not found" });
};

// Helper response function
function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}
