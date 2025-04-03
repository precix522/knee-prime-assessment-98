
import { supabase } from './client';

// Function to get main patient report from Supabase storage
export const getPatientReport = async (patientId: string) => {
  try {
    console.log('Attempting to fetch patient report for ID:', patientId);
    
    // List all files in the patient's folder to find the main report
    const { data: files, error } = await supabase.storage
      .from('Patient-report')
      .list(`patient-reports/${patientId}`, {
        limit: 10, // Limit to first 10 files
        sortBy: { column: 'name', order: 'asc' },
      });
      
    if (error) {
      console.error('Error fetching patient report files:', error);
      throw new Error('Failed to fetch report files');
    }
    
    if (!files || files.length === 0) {
      console.warn('No report files found for patient', patientId);
      throw new Error('No report found for this patient');
    }
    
    // Find main report file (named with 'main-report' prefix)
    const mainReport = files.find(file => file.name.startsWith('main-report'));
    
    if (!mainReport) {
      console.warn('No main report found, using first file instead');
      // If no main report is found, use the first file in the list
      const firstReport = files[0];
      
      const filePath = `patient-reports/${patientId}/${firstReport.name}`;
      
      // Generate public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('Patient-report')
        .getPublicUrl(filePath);
        
      return {
        fileUrl: publicUrl,
        fileName: firstReport.name
      };
    }
    
    // Generate public URL for the main report file
    const mainReportPath = `patient-reports/${patientId}/${mainReport.name}`;
    const { data: { publicUrl } } = supabase.storage
      .from('Patient-report')
      .getPublicUrl(mainReportPath);
      
    return {
      fileUrl: publicUrl,
      fileName: mainReport.name
    };
    
  } catch (error) {
    console.error('Error in getPatientReport:', error);
    throw error;
  }
};

// Function to get annex report from Supabase storage
export const getAnnexReport = async (patientId: string) => {
  try {
    // List all files in the patient's folder to find annex report
    const { data: files, error } = await supabase.storage
      .from('Patient-report')
      .list(`patient-reports/${patientId}`, {
        limit: 10,
        sortBy: { column: 'name', order: 'asc' },
      });
      
    if (error) {
      console.error('Error fetching annex report files:', error);
      throw new Error('Failed to fetch annex report files');
    }
    
    // Find annex report file (named with 'annex-report' prefix)
    const annexReport = files.find(file => file.name.startsWith('annex-report'));
    
    if (!annexReport) {
      throw new Error('No annex report found for this patient');
    }
    
    // Generate public URL for the annex report file
    const annexReportPath = `patient-reports/${patientId}/${annexReport.name}`;
    const { data: { publicUrl } } = supabase.storage
      .from('Patient-report')
      .getPublicUrl(annexReportPath);
      
    return {
      fileUrl: publicUrl,
      fileName: annexReport.name
    };
    
  } catch (error) {
    console.error('Error in getAnnexReport:', error);
    throw error;
  }
};

// Function to get supporting document from Supabase storage
export const getSupportingDocument = async () => {
  try {
    // Hard-coded URL for supporting document (typically not patient-specific)
    // This is a placeholder implementation - replace with actual logic if needed
    
    // For a real implementation, you might store this in a specific folder
    const supportingDocPath = 'supporting-docs/general-information.pdf';
    
    // Try to get the supporting document
    const { data: { publicUrl } } = supabase.storage
      .from('Patient-report')
      .getPublicUrl(supportingDocPath);
      
    return {
      fileUrl: publicUrl,
      fileName: 'general-information.pdf'
    };
    
  } catch (error) {
    console.error('Error in getSupportingDocument:', error);
    throw new Error('Supporting document not available');
  }
};
