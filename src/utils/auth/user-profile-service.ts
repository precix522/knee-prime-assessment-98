
import { getUserProfileByPhone, createUserProfile } from '../supabase';
import { User, UserProfile } from './types';

export const fetchUserProfile = async (phone: string): Promise<UserProfile | null> => {
  console.log('Fetching user profile for phone:', phone);
  return await getUserProfileByPhone(phone);
};

export const getOrCreateUserProfile = async (phone: string, sessionId: string): Promise<User> => {
  let userProfile: UserProfile | null = await fetchUserProfile(phone);
  
  console.log('User profile from database:', userProfile);
  
  if (!userProfile) {
    console.log('Creating new user profile for phone:', phone);
    userProfile = await createUserProfile(phone, 'patient');
    console.log('Created new user profile:', userProfile);
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
