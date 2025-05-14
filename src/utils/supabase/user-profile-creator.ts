
import { supabase } from './client';
import { UserProfile } from './types/user-types';
import { getUserProfileByPhone } from './user-profile-fetcher';

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
    
    // Create a unique ID based on profile type
    let uniqueId;
    if (profile_type === 'admin') {
      // For admin users, use "A" prefix
      uniqueId = `A_${Date.now()}`;
    } else {
      // For regular users and patients, use "user" prefix
      uniqueId = `user_${Date.now()}`;
    }
    
    // Create new user profile with any additional data provided
    const userData = {
      Patient_ID: uniqueId, // Use the generated unique ID
      phone,
      profile_type,
      patient_name: additionalData.name || 'User',
      last_modified_tm: formattedDate,
      created_date: new Date().toISOString() // Add the created_date field
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
      created_date: data.created_date,
      name: data.patient_name,
    } as UserProfile;
  } catch (error) {
    console.error('Exception creating user profile:', error);
    return null;
  }
};
