import { Hono } from "hono";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  CreateUserProfileSchema,
  CreateHealthGoalSchema,
  CreateVitalLogSchema,
  CreateMedicationSchema,
  CreateMedicationLogSchema,
  CreateActivityLogSchema,
  CreateDietLogSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Auth routes
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// User Profile routes
app.get("/api/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  )
    .bind(user.id)
    .all();

  return c.json(results[0] || null);
});

app.post("/api/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateUserProfileSchema.parse(body);

  const existing = await c.env.DB.prepare(
    "SELECT id FROM user_profiles WHERE user_id = ?"
  )
    .bind(user.id)
    .first();

  if (existing) {
    await c.env.DB.prepare(
      "UPDATE user_profiles SET age = ?, weight_lbs = ?, height_inches = ?, cardiac_condition = ?, unit_system = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
    )
      .bind(
        data.age || null,
        data.weight_lbs || null,
        data.height_inches || null,
        data.cardiac_condition || null,
        data.unit_system,
        user.id
      )
      .run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO user_profiles (user_id, age, weight_lbs, height_inches, cardiac_condition, unit_system) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(
        user.id,
        data.age || null,
        data.weight_lbs || null,
        data.height_inches || null,
        data.cardiac_condition || null,
        data.unit_system
      )
      .run();
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  )
    .bind(user.id)
    .all();

  return c.json(results[0]);
});

// Health Goals routes
app.get("/api/goals", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM health_goals WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/goals", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateHealthGoalSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO health_goals (user_id, goal_type, goal_description, target_value, target_date) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(
      user.id,
      data.goal_type,
      data.goal_description,
      data.target_value || null,
      data.target_date || null
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM health_goals WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

// Vital Logs routes
app.get("/api/vitals", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM vital_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 100"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/vitals", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateVitalLogSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO vital_logs (user_id, log_type, systolic, diastolic, heart_rate, weight_lbs, notes, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      user.id,
      data.log_type,
      data.systolic || null,
      data.diastolic || null,
      data.heart_rate || null,
      data.weight_lbs || null,
      data.notes || null,
      data.logged_at || new Date().toISOString()
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM vital_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1"
  )
    .bind(user.id)
    .all();

  return c.json(results[0]);
});

// Medications routes
app.get("/api/medications", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM medications WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/medications", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateMedicationSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO medications (user_id, name, dosage, frequency, reminder_time) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(
      user.id,
      data.name,
      data.dosage || null,
      data.frequency || null,
      data.reminder_time || null
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM medications WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

// Medication Logs routes
app.get("/api/medication-logs", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM medication_logs WHERE user_id = ? ORDER BY taken_at DESC LIMIT 100"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/medication-logs", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateMedicationLogSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO medication_logs (user_id, medication_id, taken_at) VALUES (?, ?, ?)"
  )
    .bind(user.id, data.medication_id, data.taken_at || new Date().toISOString())
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM medication_logs WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1"
  )
    .bind(user.id)
    .all();

  return c.json(results[0]);
});

// Activity Logs routes
app.get("/api/activities", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY logged_date DESC LIMIT 100"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/activities", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateActivityLogSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO activity_logs (user_id, activity_type, duration_minutes, logged_date) VALUES (?, ?, ?, ?)"
  )
    .bind(user.id, data.activity_type, data.duration_minutes, data.logged_date)
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY logged_date DESC LIMIT 1"
  )
    .bind(user.id)
    .all();

  return c.json(results[0]);
});

// Diet Logs routes
app.get("/api/diet", authMiddleware, async (c) => {
  const user = c.get("user");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM diet_logs WHERE user_id = ? ORDER BY logged_date DESC LIMIT 100"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/diet", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const data = CreateDietLogSchema.parse(body);

  await c.env.DB.prepare(
    "INSERT INTO diet_logs (user_id, description, is_heart_healthy, logged_date) VALUES (?, ?, ?, ?)"
  )
    .bind(
      user.id,
      data.description,
      data.is_heart_healthy ? 1 : 0,
      data.logged_date
    )
    .run();

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM diet_logs WHERE user_id = ? ORDER BY logged_date DESC LIMIT 1"
  )
    .bind(user.id)
    .all();

  return c.json(results[0]);
});

// Dashboard stats
app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const activityCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ? AND logged_date >= ?"
  )
    .bind(user.id, sevenDaysAgo)
    .first();

  const dietCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM diet_logs WHERE user_id = ? AND logged_date >= ?"
  )
    .bind(user.id, sevenDaysAgo)
    .first();

  const medCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM medication_logs WHERE user_id = ? AND taken_at >= ?"
  )
    .bind(user.id, sevenDaysAgo)
    .first();

  const latestBP = await c.env.DB.prepare(
    "SELECT * FROM vital_logs WHERE user_id = ? AND log_type = 'blood_pressure' ORDER BY logged_at DESC LIMIT 1"
  )
    .bind(user.id)
    .first();

  return c.json({
    activity_streak: activityCount?.count || 0,
    diet_streak: dietCount?.count || 0,
    medication_streak: medCount?.count || 0,
    latest_bp: latestBP,
  });
});

export default app;
