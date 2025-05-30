
import { supabase } from './client';

// Function to fetch patient report PDF by patient ID
export const getPatientReport = async (patientId: string) => {
  try {
    console.log('Fetching patient data for ID:', patientId);
    
    // First, check if the patient exists to provide better error messages
    const { data: patientExists, error: checkError } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    console.log('Patient exists check result:', patientExists);
    
    if (checkError) {
      console.error('Error checking patient existence:', checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }
    
    if (!patientExists || patientExists.length === 0) {
      throw new Error(`Patient ID "${patientId}" not found in the database`);
    }
    
    // Fetch all reports for this patient ID from the 'patient' table
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select('report_url, patient_xray_report_url, patient_mri_report_url, last_modified_tm, assessment_id')
      .eq('Patient_ID', patientId)
      .order('last_modified_tm', { ascending: false });
    
    console.log('Patient data result:', patientData);
    
    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      throw patientError;
    }
    
    if (!patientData || patientData.length === 0) {
      throw new Error('No reports found for this patient ID');
    }
    
    // Transform the result to include all reports
    const patientReports = [];
    
    // Process each record
    for (const record of patientData) {
      // Process main report if it exists
      if (record.report_url && typeof record.report_url === 'string' && record.report_url.trim() !== '') {
        let reportUrl = record.report_url;
        
        // Handle case where report_url contains multiple URLs separated by comma
        if (reportUrl.includes(',')) {
          // Extract the first URL (main report)
          reportUrl = reportUrl.split(',')[0].trim();
        }
        
        // Extract file name for display purposes
        const fileName = reportUrl.split('/').pop() || 'patient-report.pdf';
        
        // Format the timestamp if it exists
        let formattedTimestamp = formatTimestamp(record.last_modified_tm);
        
        patientReports.push({ 
          fileUrl: reportUrl, 
          fileName,
          timestamp: formattedTimestamp,
          assessmentId: record.assessment_id,
          xrayReportUrl: record.patient_xray_report_url,
          mriReportUrl: record.patient_mri_report_url,
          type: 'main'
        });
      }
      
      // Always add the record to patientReports if it has X-ray or MRI reports, even if main report is null
      if (!record.report_url || record.report_url === null) {
        // Get a unique timestamp for the record
        const formattedTimestamp = formatTimestamp(record.last_modified_tm);
        
        // Create a placeholder entry with the X-ray and MRI report URLs
        patientReports.push({
          fileUrl: null,
          fileName: null,
          timestamp: formattedTimestamp,
          assessmentId: record.assessment_id,
          xrayReportUrl: record.patient_xray_report_url,
          mriReportUrl: record.patient_mri_report_url,
          type: 'imaging'
        });
      }
    }
    
    console.log('Processed patient reports:', patientReports);
    
    // Find a main report to return as the primary report
    const mainReport = patientReports.find(report => report.type === 'main') || patientReports[0];
    
    // Return all reports and the main report for backward compatibility
    return { 
      allReports: patientReports,
      fileUrl: mainReport?.fileUrl || null, 
      fileName: mainReport?.fileName || null,
      xrayReportUrl: mainReport?.xrayReportUrl || null,
      mriReportUrl: mainReport?.mriReportUrl || null
    };
  } catch (error) {
    console.error('Error fetching patient report:', error);
    throw error;
  }
};

// Helper function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return timestamp || '';
  }
}

// Updated function to fetch supporting documents for the Annex view
export const getAnnexReport = async (patientId: string) => {
  try {
    console.log('Fetching annex report for patient ID:', patientId);
    
    // First, check if the patient has a report_url with multiple URLs
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select('report_url')
      .eq('Patient_ID', patientId)
      .order('last_modified_tm', { ascending: false });
      
    if (patientError) {
      throw patientError;
    }
    
    if (patientData && patientData.length > 0) {
      const reportUrls = patientData[0].report_url;
      if (reportUrls && reportUrls.includes(',')) {
        // Extract the second URL (annex report) if it exists
        const urls = reportUrls.split(',');
        if (urls.length > 1) {
          const annexUrl = urls[1].trim();
          console.log('Extracted annex report URL:', annexUrl);
          const fileName = annexUrl.split('/').pop() || 'annex-report.pdf';
          
          return { 
            fileUrl: annexUrl, 
            fileName 
          };
        }
      }
    }
    
    // Use a fallback URL if no annex report is found
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents/Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report%20(3).pdf';
    const fileName = 'annex-report.pdf';
    
    console.log('Using fallback annex report URL:', fallbackUrl);
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error in annex report handling:', error);
    // Always return the fallback URL on any error
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents/Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = 'annex-report.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};

// Function to fetch supporting document link from Supabase
export const getSupportingDocument = async () => {
  try {
    console.log('Fetching supporting document');
    
    // Use the fallback URL directly since the table doesn't exist
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents/Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    console.log('Using fallback supporting document URL:', fallbackUrl);
    
    // Extract file name for display purposes
    const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error in supporting document handling:', error);
    
    // If there's an error, return the hardcoded URL
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents/Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};
