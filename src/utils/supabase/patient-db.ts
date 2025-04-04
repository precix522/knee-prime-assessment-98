
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
    
    // Use RPC call to insert record bypassing unique constraint on phone
    // This will use a custom SQL function in Supabase
    const { data, error } = await supabase
      .rpc('insert_patient_ignore_phone_duplicate', patientRecord)
      .select();
      
    if (error) {
      console.error('Supabase error while inserting patient record:', error);
      
      // Fallback to direct insert if RPC fails
      // This will only work if the unique constraint on phone is removed from the database
      const { data: insertData, error: insertError } = await supabase
        .from('patient')
        .insert([patientRecord])
        .select();
        
      if (insertError) {
        console.error('Fallback insert also failed:', insertError);
        
        // If both methods fail, try one more approach - modify the record to make phone unique
        const timestamp = Date.now();
        patientRecord.phone = `${patientRecord.phone}_${timestamp}`;
        
        const { data: finalData, error: finalError } = await supabase
          .from('patient')
          .insert([patientRecord])
          .select();
          
        if (finalError) {
          throw new Error(`Failed to save patient record: ${finalError.message}`);
        }
        
        console.log('Patient record saved with modified phone number. Database response:', finalData);
        return finalData;
      }
      
      console.log('Patient record saved with fallback method. Database response:', insertData);
      return insertData;
    }
    
    console.log('Patient record saved successfully. Database response:', data);
    return data;
    
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    
    // Special handling for duplicate key violations
    if (error.message && error.message.includes('patient_phone_key')) {
      // Create a timestamp to make the phone number unique
      const timestamp = Date.now();
      const modifiedPatientData = {
        ...patientData,
        phoneNumber: `${patientData.phoneNumber}_${timestamp}`
      };
      
      // Try again with the modified phone number
      console.log('Retrying with modified phone number:', modifiedPatientData.phoneNumber);
      return createPatientRecord(modifiedPatientData);
    }
    
    throw error;
  }
};
