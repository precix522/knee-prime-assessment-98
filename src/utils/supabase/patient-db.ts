
import { supabase } from './client';

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    if (error) {
      console.error('Error checking patient ID:', error);
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking patient ID:', error);
    throw error;
  }
};

// Function to create a new patient record
export const createPatientRecord = async (patientData: {
  patientId: string;
  patientName: string;
  phoneNumber: string;
  reportUrl: string | null;
  lastModifiedTime?: string;
}) => {
  try {
    console.log('Creating/updating patient record with data:', patientData);
    
    // Format the date to YYYY-MM-DD format
    const formattedDate = patientData.lastModifiedTime 
      ? new Date(patientData.lastModifiedTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];
    
    console.log('Formatted date for database:', formattedDate);
    
    // Prepare the record object with correct field names matching the database schema
    const patientRecord = {
      Patient_ID: patientData.patientId,
      patient_name: patientData.patientName,
      phone: patientData.phoneNumber,
      report_url: patientData.reportUrl,
      last_modified_tm: formattedDate
    };
    
    console.log('Sending record to database:', patientRecord);
    
    // First check if the record exists by Patient_ID
    const { data: existingRecord, error: checkError } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientData.patientId);
    
    if (checkError) {
      console.error('Error checking if patient exists:', checkError);
      throw new Error(`Database query error: ${checkError.message}`);
    }
      
    let result;
    
    if (existingRecord && existingRecord.length > 0) {
      // Update existing record
      console.log('Updating existing record for Patient_ID:', patientData.patientId);
      
      const { data, error } = await supabase
        .from('patient')
        .update(patientRecord)
        .eq('Patient_ID', patientData.patientId)
        .select();
        
      if (error) {
        console.error('Supabase error while updating patient record:', error);
        throw error;
      }
      
      result = data;
      console.log('Update operation result:', data);
    } else {
      // Insert new record
      console.log('Inserting new record for Patient_ID:', patientData.patientId);
      
      const { data, error } = await supabase
        .from('patient')
        .insert([patientRecord])
        .select();
        
      if (error) {
        // Check if it's a unique constraint violation on phone number
        if (error.code === '23505' || error.message.includes('unique constraint')) {
          console.error('Phone number already exists with another patient ID:', error);
          throw new Error('This phone number is already registered with another patient. Please use a different phone number.');
        }
        
        console.error('Supabase error while inserting patient record:', error);
        throw error;
      }
      
      result = data;
      console.log('Insert operation result:', data);
    }
    
    if (!result || result.length === 0) {
      console.warn('Operation completed but no data was returned. This might indicate an issue with RLS policies.');
    }
    
    console.log('Patient record saved successfully. Database response:', result);
    return result || true;
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    throw error;
  }
};
