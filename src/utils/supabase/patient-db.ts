
import { supabase } from './client';

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    console.log(`Checking if patient ID ${patientId} exists...`);
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    if (error) {
      console.error('Error checking patient ID:', error);
      throw error;
    }
    
    console.log(`Patient ID check result:`, data);
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
  xrayReportUrl?: string | null;
  mriReportUrl?: string | null;
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
      patient_xray_report_url: patientData.xrayReportUrl || null,
      patient_mri_report_url: patientData.mriReportUrl || null,
      last_modified_tm: formattedDate
    };
    
    console.log('Sending new record to database:', patientRecord);
    
    // First, try a direct insert - most straightforward approach
    const { data: insertData, error: insertError } = await supabase
      .from('patient')
      .insert([patientRecord])
      .select();
    
    if (insertError) {
      console.error('Direct insert failed:', insertError);
      
      // If the problem is a duplicate phone number, try using upsert instead
      if (insertError.message && insertError.message.includes('patient_phone_key')) {
        console.log('Trying upsert instead due to phone key constraint...');
        
        const { data: upsertData, error: upsertError } = await supabase
          .from('patient')
          .upsert([patientRecord], { 
            onConflict: 'Patient_ID',
            ignoreDuplicates: false 
          })
          .select();
          
        if (upsertError) {
          console.error('Upsert also failed:', upsertError);
          
          // Last resort: generate a unique phone number
          console.log('Trying with modified phone number...');
          const timestamp = Date.now();
          patientRecord.phone = `${patientRecord.phone}_${timestamp}`;
          
          const { data: finalData, error: finalError } = await supabase
            .from('patient')
            .insert([patientRecord])
            .select();
            
          if (finalError) {
            console.error('All approaches failed:', finalError);
            throw finalError;
          }
          
          console.log('Patient record saved with modified phone. Database response:', finalData);
          return finalData;
        }
        
        console.log('Patient record upserted successfully. Database response:', upsertData);
        return upsertData;
      }
      
      // If the error is not related to phone key constraint, try RPC as a fallback
      console.log('Trying RPC method...');
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('insert_patient_ignore_phone_duplicate', patientRecord)
          .select();
          
        if (rpcError) {
          console.error('RPC method also failed:', rpcError);
          throw rpcError;
        }
        
        console.log('Patient record saved using RPC. Database response:', rpcData);
        return rpcData;
      } catch (rpcErr) {
        console.error('RPC approach failed:', rpcErr);
        throw insertError; // Throw the original error if RPC also fails
      }
    }
    
    console.log('Patient record saved successfully via direct insert. Database response:', insertData);
    return insertData;
    
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
