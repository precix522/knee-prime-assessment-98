
import { getUserProfileByPhone, createUserProfile } from '../supabase/user-db';
import { User, UserProfile } from './types';

export const fetchUserProfile = async (phone: string): Promise<UserProfile | null> => {
  console.log('Fetching user profile for phone:', phone);
  
  if (!phone || phone.trim() === '') {
    console.error('Invalid phone number provided to fetchUserProfile');
    return null;
  }
  
  return await getUserProfileByPhone(phone);
};

export const getOrCreateUserProfile = async (phone: string, sessionId: string): Promise<User> => {
  console.log('Getting or creating user profile for phone:', phone);
  
  if (!phone || phone.trim() === '') {
    console.error('Invalid phone number provided to getOrCreateUserProfile');
    return {
      id: sessionId,
      phone: '',
      profile_type: 'patient'
    };
  }
  
  // First try to fetch the existing profile
  let userProfile: UserProfile | null = await fetchUserProfile(phone);
  
  console.log('User profile from database:', userProfile);
  
  // Only create a new profile if none exists
  if (!userProfile) {
    console.log('No existing user profile found, creating new one');
    
    // Default to 'patient' profile type for regular users
    // This will only happen for truly new users
    userProfile = await createUserProfile(phone, 'patient');
    console.log('Created new user profile:', userProfile);
  } else {
    console.log('Using existing user profile:', userProfile);
  }
  
  // Ensure we use the exact profile_type from the database
  const profile_type = userProfile?.profile_type || 'patient';
  console.log('User profile type:', profile_type);
  
  // Store the profile type in localStorage for better persistence across sessions
  localStorage.setItem('userProfileType', profile_type);
  
  return {
    id: userProfile?.id || sessionId,
    phone: phone,
    profile_type: profile_type
  };
};
