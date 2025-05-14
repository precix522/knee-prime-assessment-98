
import { supabase } from './client';
import { UserProfile } from './types/user-types';

/**
 * Get all user profiles (admin only)
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all user profiles:', error);
      return [];
    }
    
    return data as UserProfile[];
  } catch (error) {
    console.error('Exception fetching all user profiles:', error);
    return [];
  }
};
