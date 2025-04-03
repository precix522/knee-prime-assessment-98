
import { supabase } from './client';

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    if (error) {
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
    
    // Verify database connection before attempting write
    const { data: pingData, error: pingError } = await supabase.from('patient').select('count').limit(1);
    if (pingError) {
      console.error('Database connection test failed:', pingError);
      throw new Error(`Database connection issue: ${pingError.message}`);
    }
    
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
    
    // First check if the record exists
    const { data: existingRecord } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientData.patientId);
      
    let result;
    
    if (existingRecord && existingRecord.length > 0) {
      // Update existing record
      console.log('Updating existing record for Patient_ID:', patientData.patientId);
      const { data, error } = await supabase
        .from('patient')
        .update(patientRecord)
        .eq('Patient_ID', patientData.patientId);
        
      if (error) {
        console.error('Supabase error while updating patient record:', error);
        throw error;
      }
      
      result = data;
    } else {
      // Insert new record
      console.log('Inserting new record for Patient_ID:', patientData.patientId);
      const { data, error } = await supabase
        .from('patient')
        .insert([patientRecord]);
        
      if (error) {
        console.error('Supabase error while inserting patient record:', error);
        throw error;
      }
      
      result = data;
    }
    
    console.log('Patient record saved successfully. Database response:', result);
    return result || true;
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    throw error;
  }
};
