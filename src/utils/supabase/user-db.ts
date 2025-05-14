
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
    console.log('Fetching user profile for phone:', phone);
    
    const { data, error } = await supabase
      .from('patient')
      .select('*')
      .eq('phone', phone)
      .order('last_modified_tm', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No user profile found for phone:', phone);
      return null;
    }
    
    // Make sure profile_type is correctly identified (admin or user)
    // If the profile_type in the database is 'admin', ensure it's properly set
    const profileType = data[0].profile_type === 'admin' ? 'admin' : data[0].profile_type || 'user';
    
    // Map the patient record to UserProfile format
    return {
      id: data[0].id || data[0].Patient_ID,
      phone: data[0].phone,
      profile_type: profileType, // Use the determined profile type
      created_at: data[0].created_at || data[0].last_modified_tm,
      name: data[0].patient_name || data[0].name,
      email: data[0].email
    } as UserProfile;
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
    
    // Format the date in MM/DD/YYYY, hh:mm:ss AM/PM format
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Create new user profile with any additional data provided
    const userData = {
      Patient_ID: `user_${Date.now()}`, // Generate a unique Patient_ID
      phone,
      profile_type,
      patient_name: additionalData.name || 'User',
      last_modified_tm: formattedDate
    };
    
    const { data, error } = await supabase
      .from('patient')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    // Map the patient record to UserProfile format
    return {
      id: data.Patient_ID,
      phone: data.phone,
      profile_type: data.profile_type || 'user',
      created_at: data.last_modified_tm,
      name: data.patient_name,
    } as UserProfile;
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
