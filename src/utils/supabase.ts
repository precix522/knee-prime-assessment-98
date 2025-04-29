
// Re-export the client for direct access
export { supabase } from './supabase/client';

// Re-export patient database operations
export { 
  checkPatientIdExists,
  createPatientRecord 
} from './supabase/patient-db';

// Re-export patient report operations
export { 
  getPatientReport,
  getAnnexReport,
  getSupportingDocument 
} from './supabase/patient-reports';

// Re-export storage operations
export { uploadPatientDocument } from './supabase/storage';

// Re-export user profile operations
export {
  getUserProfileByPhone,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile, 
  getAllUserProfiles,
  updateUserLastLogin,
  type UserProfile
} from './supabase/user-db';

// Export AWS S3 utilities
export { 
  listS3Objects,
  getS3Object 
} from './aws/s3-client';

export {
  fetchDataFromS3,
  startPeriodicS3Fetch,
  stopPeriodicS3Fetch,
  syncNow,
  getFetchStatus
} from './aws/s3-fetch-service';
