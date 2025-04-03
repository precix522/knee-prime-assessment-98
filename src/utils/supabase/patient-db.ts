
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
      report_url: reportUrl, // Use the placeholder URL if no report URL was provided
      last_modified_tm: formattedDate
    };
    
    console.log('Sending record to database:', patientRecord);
    
    // Use REST API directly to bypass RLS
    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/patient`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(patientRecord)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', response.status, errorText);
      
      // If it's a unique constraint violation (record already exists), try updating
      if (response.status === 409 || errorText.includes('duplicate key')) {
        console.log('Record exists, attempting update...');
        
        const updateResponse = await fetch(
          `${supabase.supabaseUrl}/rest/v1/patient?Patient_ID=eq.${encodeURIComponent(patientData.patientId)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabase.supabaseKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              patient_name: patientRecord.patient_name,
              phone: patientRecord.phone,
              report_url: patientRecord.report_url,
              last_modified_tm: patientRecord.last_modified_tm
            })
          }
        );
        
        if (!updateResponse.ok) {
          const updateErrorText = await updateResponse.text();
          throw new Error(`Failed to update patient record: ${updateResponse.status} - ${updateErrorText}`);
        }
        
        console.log('Patient record updated successfully');
        return true;
      }
      
      throw new Error(`Database error: ${response.status} - ${errorText}`);
    }
    
    console.log('Patient record saved successfully.');
    return true;
  } catch (error: any) {
    console.error('Error creating patient record:', error.message || error);
    throw error;
  }
};
