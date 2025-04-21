
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
    
    // Ensure patientId is a plain string without any text casting
    const cleanPatientId = patientData.patientId.replace(/'|::|text/g, '');
    
    // Prepare the record object with correct field names matching the database schema
    const patientRecord = {
      Patient_ID: cleanPatientId,
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
      
      // If the problem is a duplicate phone number, add a random suffix
      if (insertError.message && insertError.message.includes('patient_phone_key')) {
        console.log('Duplicate phone number detected, adding random suffix...');
        
        // Generate a random 6-digit number as suffix
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        patientRecord.phone = `${patientRecord.phone}_${randomSuffix}`;
        
        console.log('Retrying with modified phone number:', patientRecord.phone);
        
        const { data: retryData, error: retryError } = await supabase
          .from('patient')
          .insert([patientRecord])
          .select();
          
        if (retryError) {
          console.error('Insert with modified phone also failed:', retryError);
          throw retryError;
        }
        
        console.log('Patient record saved with modified phone. Database response:', retryData);
        return retryData;
      }
      
      // Try upsert as fallback for other issues
      console.log('Trying upsert instead...');
      const { data: upsertData, error: upsertError } = await supabase
        .from('patient')
        .upsert([patientRecord], { 
          onConflict: 'Patient_ID',
          ignoreDuplicates: false 
        })
        .select();
        
      if (upsertError) {
        console.error('Upsert also failed:', upsertError);
        throw upsertError;
      }
      
      console.log('Patient record upserted successfully. Database response:', upsertData);
      return upsertData;
    }
    
    console.log('Patient record saved successfully via direct insert. Database response:', insertData);
    return insertData;
    
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    
    // Special handling for duplicate key violations
    if (error.message && error.message.includes('patient_phone_key')) {
      // Create a random 6-digit number to make the phone number unique
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const modifiedPatientData = {
        ...patientData,
        phoneNumber: `${patientData.phoneNumber}_${randomSuffix}`
      };
      
      // Try again with the modified phone number
      console.log('Retrying with modified phone number:', modifiedPatientData.phoneNumber);
      return createPatientRecord(modifiedPatientData);
    }
    
    throw error;
  }
};
