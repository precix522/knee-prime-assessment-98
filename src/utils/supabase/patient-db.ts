
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
    console.log('Creating new patient record with data:', patientData);
    
    // Verify database connection before attempting write
    const { data: pingData, error: pingError } = await supabase.from('patient').select('count').limit(1);
    if (pingError) {
      console.error('Database connection test failed:', pingError);
      throw new Error(`Database connection issue: ${pingError.message}`);
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
    
    console.log('Formatted date for database:', formattedDate);
    
    // Prepare the record object with correct field names matching the database schema
    const patientRecord = {
      Patient_ID: patientData.patientId,
      patient_name: patientData.patientName,
      phone: patientData.phoneNumber,
      report_url: patientData.reportUrl,
      last_modified_tm: formattedDate
    };
    
    console.log('Sending new record to database:', patientRecord);
    
    // Attempt to insert the record
    const { data, error } = await supabase
      .from('patient')
      .insert([patientRecord])
      .select();
      
    if (error) {
      console.error('Supabase error while inserting patient record:', error);
      
      // If there's a duplicate phone error, we'll use the upsert method instead
      if (error.message && error.message.includes('patient_phone_key')) {
        console.log('Phone number already exists, using upsert method');
        
        // Use the patientId as the unique key for upserting
        const { data: upsertData, error: upsertError } = await supabase
          .from('patient')
          .upsert([patientRecord], { 
            onConflict: 'Patient_ID',
            ignoreDuplicates: false  // Update the record if it exists
          })
          .select();
          
        if (upsertError) {
          console.error('Upsert also failed:', upsertError);
          throw new Error(`Failed to save patient record: ${upsertError.message}`);
        }
        
        console.log('Patient record upserted successfully:', upsertData);
        return upsertData;
      }
      
      throw new Error(`Failed to save patient record: ${error.message}`);
    }
    
    console.log('Patient record saved successfully. Database response:', data);
    return data;
    
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    throw error;
  }
};
