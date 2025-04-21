
import { supabase } from './client';

// Helper to sanitize patientId (remove casts, quotes, etc.)
const cleanId = (id: string) =>
  id.replace(/'|::|text/gi, '').trim();

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    throw error;
  }
};

// Function to check if a phone number already exists (ignores suffixes)
const checkPhoneExists = async (phone: string): Promise<boolean> => {
  try {
    // Ignore any phone suffixes (e.g., _1234567890)
    const strippedPhone = phone.split('_')[0];
    const { data, error } = await supabase
      .from('patient')
      .select('phone')
      .like('phone', `${strippedPhone}%`);
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
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

    // Clean patientId and phone
    let cleanPatientId = cleanId(patientData.patientId);
    let cleanPhone = patientData.phoneNumber.trim();

    // Step 1: If Patient_ID already exists, append a timestamp as suffix
    const exists = await checkPatientIdExists(cleanPatientId);
    if (exists) {
      const timestamp = Date.now();
      cleanPatientId = `${cleanPatientId}_${timestamp}`;
    }

    // Step 2: If phone already exists, make it unique by appending timestamp
    const phoneExists = await checkPhoneExists(cleanPhone);
    if (phoneExists) {
      const phoneTimestamp = Date.now();
      cleanPhone = `${cleanPhone}_${phoneTimestamp}`;
    }

    // Step 3: Prepare the record object with explicit profile_type as 'patient'
    const patientRecord = {
      Patient_ID: cleanPatientId,
      patient_name: patientData.patientName.trim(),
      phone: cleanPhone,
      report_url: patientData.reportUrl,
      patient_xray_report_url: patientData.xrayReportUrl || null,
      patient_mri_report_url: patientData.mriReportUrl || null,
      last_modified_tm: formattedDate,
      profile_type: 'patient'  // explicitly set to 'patient'
    };

    // Insert new record
    const { data: insertData, error: insertError } = await supabase
      .from('patient')
      .insert([patientRecord])
      .select();

    if (insertError) {
      throw insertError;
    }

    return insertData;
  } catch (error: any) {
    throw error;
  }
};

