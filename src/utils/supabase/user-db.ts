
import { supabase } from './client';

// Interface for user profile data from database
export interface UserProfile {
  id: string;
  phone: string;
  profile_type: string;
  created_at?: string;
}

/**
 * Fetch user profile from database by phone number
 */
export const getUserProfileByPhone = async (phone: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
};

/**
 * Create user profile if it doesn't exist
 */
export const createUserProfile = async (phone: string, profile_type: string = 'user'): Promise<UserProfile | null> => {
  try {
    // Check if user already exists
    const existingUser = await getUserProfileByPhone(phone);
    if (existingUser) {
      return existingUser;
    }
    
    // Create new user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ phone, profile_type }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception creating user profile:', error);
    return null;
  }
};
