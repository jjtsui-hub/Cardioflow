import z from "zod";

// User Profile
export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  age: z.number().nullable(),
  weight_lbs: z.number().nullable(),
  height_inches: z.number().nullable(),
  cardiac_condition: z.string().nullable(),
  unit_system: z.enum(["imperial", "metric"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const CreateUserProfileSchema = z.object({
  age: z.number().min(1).max(150).optional(),
  weight_lbs: z.number().positive().optional(),
  height_inches: z.number().positive().optional(),
  cardiac_condition: z.string().optional(),
  unit_system: z.enum(["imperial", "metric"]).default("imperial"),
});

export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;

// Health Goals
export const HealthGoalSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  goal_type: z.string(),
  goal_description: z.string(),
  target_value: z.number().nullable(),
  target_date: z.string().nullable(),
  is_completed: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type HealthGoal = z.infer<typeof HealthGoalSchema>;

export const CreateHealthGoalSchema = z.object({
  goal_type: z.string().min(1),
  goal_description: z.string().min(1),
  target_value: z.number().optional(),
  target_date: z.string().optional(),
});

export type CreateHealthGoal = z.infer<typeof CreateHealthGoalSchema>;

// Vital Logs
export const VitalLogSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  log_type: z.enum(["blood_pressure", "weight"]),
  systolic: z.number().nullable(),
  diastolic: z.number().nullable(),
  heart_rate: z.number().nullable(),
  weight_lbs: z.number().nullable(),
  notes: z.string().nullable(),
  logged_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type VitalLog = z.infer<typeof VitalLogSchema>;

export const CreateVitalLogSchema = z.object({
  log_type: z.enum(["blood_pressure", "weight"]),
  systolic: z.number().min(50).max(250).optional(),
  diastolic: z.number().min(30).max(150).optional(),
  heart_rate: z.number().min(30).max(220).optional(),
  weight_lbs: z.number().positive().optional(),
  notes: z.string().optional(),
  logged_at: z.string().optional(),
});

export type CreateVitalLog = z.infer<typeof CreateVitalLogSchema>;

// Medications
export const MedicationSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  dosage: z.string().nullable(),
  frequency: z.string().nullable(),
  reminder_time: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Medication = z.infer<typeof MedicationSchema>;

export const CreateMedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  reminder_time: z.string().optional(),
});

export type CreateMedication = z.infer<typeof CreateMedicationSchema>;

// Medication Logs
export const MedicationLogSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  medication_id: z.number(),
  taken_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MedicationLog = z.infer<typeof MedicationLogSchema>;

export const CreateMedicationLogSchema = z.object({
  medication_id: z.number(),
  taken_at: z.string().optional(),
});

export type CreateMedicationLog = z.infer<typeof CreateMedicationLogSchema>;

// Activity Logs
export const ActivityLogSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  activity_type: z.string(),
  duration_minutes: z.number().nullable(),
  logged_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

export const CreateActivityLogSchema = z.object({
  activity_type: z.string().min(1),
  duration_minutes: z.number().positive(),
  logged_date: z.string(),
});

export type CreateActivityLog = z.infer<typeof CreateActivityLogSchema>;

// Diet Logs
export const DietLogSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  description: z.string(),
  is_heart_healthy: z.number(),
  logged_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DietLog = z.infer<typeof DietLogSchema>;

export const CreateDietLogSchema = z.object({
  description: z.string().min(1),
  is_heart_healthy: z.boolean().default(true),
  logged_date: z.string(),
});

export type CreateDietLog = z.infer<typeof CreateDietLogSchema>;
