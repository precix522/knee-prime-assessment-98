
import { supabase } from './client';
import { UserProfile } from './types/user-types';

/**
 * Update an existing user profile
 */
export const updateUserProfile = async (id: string, updateData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return null;
  }
};

/**
 * Delete a user profile
 */
export const deleteUserProfile = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patient')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting user profile:', error);
    return false;
  }
};

/**
 * Update user's last login time
 */
export const updateUserLastLogin = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patient')
      .update({ last_modified_tm: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating last login time:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating last login time:', error);
    return false;
  }
};
