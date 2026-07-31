// Centralized storage key constants for Good Health AI

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'goodhealth_auth_token',
  CURRENT_USER: 'goodhealth_current_user',
  USERS: 'goodhealth_users',
  DOCTORS: 'goodhealth_doctors',
  APPOINTMENTS: 'goodhealth_appointments',
  MEDICAL_RECORDS: 'goodhealth_medical_records',
  QR_CODES: 'goodhealth_qr_codes',
  HEALTH_TIPS: 'goodhealth_health_tips',
  AI_ANALYSES: 'goodhealth_ai_analyses',
  MESSAGES: 'goodhealth_messages',
} as const;

export default STORAGE_KEYS;
