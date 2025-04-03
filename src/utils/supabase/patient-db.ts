
import { supabase } from './client';

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking patient ID:', error);
    throw error;
  }
};

// Function to check if phone number already exists
export const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('phone')
      .eq('phone', phoneNumber)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking phone number:', error);
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
    
    // Handle null report URL - provide a default placeholder URL since the column can't be null
    const reportUrl = patientData.reportUrl || 'https://placeholder-url.com/no-report';
    
    // Prepare the record object with correct field names matching the database schema
    const patientRecord = {
      Patient_ID: patientData.patientId,
      patient_name: patientData.patientName,
      phone: patientData.phoneNumber,
      report_url: reportUrl,
      last_modified_tm: formattedDate
    };
    
    console.log('Sending record to database:', patientRecord);
    
    // First check if the patient exists already
    const phoneExists = await checkPhoneExists(patientData.phoneNumber);
    const patientIdExists = await checkPatientIdExists(patientData.patientId);
    
    if (patientIdExists || phoneExists) {
      console.log('Patient record exists, updating...');
      
      // If patient already exists, update the record
      const { error: updateError } = await supabase
        .from('patient')
        .update({
          patient_name: patientRecord.patient_name,
          report_url: patientRecord.report_url,
          last_modified_tm: patientRecord.last_modified_tm
        })
        .eq(patientIdExists ? 'Patient_ID' : 'phone', 
            patientIdExists ? patientData.patientId : patientData.phoneNumber);
      
      if (updateError) {
        console.error('Error updating patient record:', updateError);
        throw new Error(`Failed to update patient record: ${updateError.message}`);
      }
      
      console.log('Patient record updated successfully');
      return true;
    }
    
    // If patient doesn't exist, create a new record
    const { error: insertError } = await supabase
      .from('patient')
      .insert([patientRecord]);
      
    if (insertError) {
      console.error('Error creating patient record:', insertError);
      throw new Error(`Failed to create patient record: ${insertError.message}`);
    }
    
    console.log('Patient record created successfully');
    return true;
    
  } catch (error: any) {
    console.error('Error creating/updating patient record:', error.message || error);
    throw error;
  }
};
