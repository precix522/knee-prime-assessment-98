
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
    } else {
      // For new record, first check if phone number is already in use by another patient
      const { data: phoneExists, error: phoneError } = await supabase
        .from('patient')
        .select('Patient_ID')
        .eq('phone', patientData.phoneNumber);
      
      if (phoneError) {
        console.error('Error checking phone number:', phoneError);
        throw new Error(`Database query error: ${phoneError.message}`);
      }
      
      // If phone number is already in use, create the record with on_conflict option
      if (phoneExists && phoneExists.length > 0) {
        console.log('Phone number already exists, but proceeding with new patient ID');
        
        // Insert with on_conflict option
        const { data, error } = await supabase
          .from('patient')
          .insert([patientRecord])
          .select();
          
        if (error) {
          // If this still fails, it means we need to update the database schema
          // Log a clearer message for the user
          console.error('Could not create patient with duplicate phone number:', error);
          throw new Error('This phone number is already registered with another patient. Please use a different phone number or contact support.');
        }
        
        result = data;
      } else {
        // Normal insert for new record with unique phone
        console.log('Inserting new record for Patient_ID:', patientData.patientId);
        const { data, error } = await supabase
          .from('patient')
          .insert([patientRecord])
          .select();
          
        if (error) {
          console.error('Supabase error while inserting patient record:', error);
          throw error;
        }
        
        result = data;
      }
    }
    
    console.log('Patient record saved successfully. Database response:', result);
    return result || true;
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    throw error;
  }
};
