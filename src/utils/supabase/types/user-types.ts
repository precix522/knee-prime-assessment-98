
/**
 * Interface for user profile data from database
 */
export interface UserProfile {
  id: string;
  phone: string;
  profile_type: string;
  created_at?: string;
  created_date?: string;
  name?: string;
  email?: string;
  last_login?: string;
  // Fields from patient table
  Patient_ID?: string;
  patient_name?: string;
  last_modified_tm?: string;
  report_url?: string;
}
