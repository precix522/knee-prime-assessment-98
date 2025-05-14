
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
      .order('last_modified_tm', { ascending: false });
    
    if (error) {
      console.error('Error fetching all user profiles:', error);
      return [];
    }
    
    // Map the database fields to our UserProfile type
    const profiles: UserProfile[] = data.map(patient => ({
      id: patient.Patient_ID,
      phone: patient.phone,
      profile_type: patient.profile_type || 'patient',
      created_at: patient.last_modified_tm,
      created_date: patient.created_date,
      name: patient.patient_name,
      Patient_ID: patient.Patient_ID,
      patient_name: patient.patient_name,
      last_modified_tm: patient.last_modified_tm,
      report_url: patient.report_url
    }));
    
    return profiles;
  } catch (error) {
    console.error('Exception fetching all user profiles:', error);
    return [];
  }
};
