
import { supabase } from './client';
import { UserProfile } from './types/user-types';

/**
 * Fetch user profile from database by phone number
 */
export const getUserProfileByPhone = async (phone: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching user profile for phone:', phone);
    
    if (!phone || phone.trim() === '') {
      console.error('Invalid phone number provided to getUserProfileByPhone');
      return null;
    }
    
    // First try an exact match
    let { data, error } = await supabase
      .from('patient')
      .select('*')
      .eq('phone', phone)
      .order('last_modified_tm', { ascending: false })
      .limit(1);
    
    // If no exact match, try with a startsWith match (for phone numbers with extensions)
    if ((!data || data.length === 0) && phone) {
      const { data: partialData, error: partialError } = await supabase
        .from('patient')
        .select('*')
        .like('phone', `${phone}%`)
        .order('last_modified_tm', { ascending: false })
        .limit(1);
      
      if (!partialError && partialData && partialData.length > 0) {
        data = partialData;
        error = partialError;
      }
    }
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No user profile found for phone:', phone);
      return null;
    }
    
    console.log('Found user profile data:', data[0]);
    
    // Ensure profile_type exists on the record and is not modified
    const profileType = data[0].profile_type || 'patient';
    console.log('Retrieved profile type from DB:', profileType);
    
    // Store in localStorage for persistence
    localStorage.setItem('userProfileType', profileType);
    
    // Map the patient record to UserProfile format
    return {
      id: data[0].Patient_ID || data[0].id,
      phone: data[0].phone,
      profile_type: profileType,
      created_at: data[0].created_at || data[0].last_modified_tm,
      name: data[0].patient_name || data[0].name,
      email: data[0].email
    } as UserProfile;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
};
