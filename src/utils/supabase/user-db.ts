
import { supabase } from './client';

// Interface for user profile data from database
export interface UserProfile {
  id: string;
  phone: string;
  profile_type: string;
  created_at?: string;
  name?: string;
  email?: string;
  last_login?: string;
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
export const createUserProfile = async (phone: string, profile_type: string = 'user', additionalData: any = {}): Promise<UserProfile | null> => {
  try {
    // Check if user already exists
    const existingUser = await getUserProfileByPhone(phone);
    if (existingUser) {
      return existingUser;
    }
    
    // Create new user profile with any additional data provided
    const userData = {
      phone,
      profile_type,
      ...additionalData,
      last_login: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([userData])
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

/**
 * Update an existing user profile
 */
export const updateUserProfile = async (id: string, updateData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
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
      .from('user_profiles')
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
 * Get all user profiles (admin only)
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
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

/**
 * Update user's last login time
 */
export const updateUserLastLogin = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
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
