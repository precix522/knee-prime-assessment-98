
/**
 * Interface for user profile data from database
 */
export interface UserProfile {
  id: string;
  phone: string;
  profile_type: string;
  created_at?: string;
  name?: string;
  email?: string;
  last_login?: string;
}
