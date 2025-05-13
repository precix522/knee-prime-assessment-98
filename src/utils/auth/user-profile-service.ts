
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
    userProfile = await createUserProfile(phone, 'user');
    console.log('Created new user profile:', userProfile);
  }
  
  const profile_type = userProfile?.profile_type || 'user';
  console.log('User profile type:', profile_type);
  
  return {
    id: userProfile?.id || sessionId,
    phone: phone,
    profile_type: profile_type
  };
};
