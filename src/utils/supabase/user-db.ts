
// Re-export user profile types
export { type UserProfile } from './types/user-types';

// Re-export user profile fetching operations
export { getUserProfileByPhone } from './user-profile-fetcher';

// Re-export user profile creation operations
export { createUserProfile } from './user-profile-creator';

// Re-export user profile management operations
export { 
  updateUserProfile,
  deleteUserProfile,
  updateUserLastLogin
} from './user-profile-manager';

// Re-export user admin operations
export { getAllUserProfiles } from './user-admin-service';
