import { User } from './types';

export interface UserState {
  user: User | null;
  clearError: () => void;
  setLoginUser: (user: User) => void;
  setAuthUser: (user: User) => void;
}

export const createUserState = (set: Function): UserState => ({
  user: null,
  
  clearError: () => set({ error: null }),
  
  setLoginUser: (user) => {
    // Add null check and default values
    if (!user) {
      console.error('setLoginUser called with null or undefined user');
      return;
    }
    
    const phone = user.phone || '';
    
    // Store the authenticated phone for dev mode
    if (phone) {
      localStorage.setItem('authenticatedPhone', phone);
    }
    
    // Keep original profile_type, don't transform it
    const profileType = user.profile_type || 'patient';
    console.log('Setting login user with profile type:', profileType);
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: profileType,
        ...user // Preserve all other user properties
      },
      isVerifying: false
    });
  },
  
  setAuthUser: (user) => {
    // Add null check and default values
    if (!user) {
      console.error('setAuthUser called with null or undefined user');
      return;
    }
    
    const phone = user.phone || '';
    
    // Store the authenticated phone for dev mode
    if (phone) {
      localStorage.setItem('authenticatedPhone', phone);
      // Also store profile type in localStorage for extra persistence
      if (user.profile_type) {
        localStorage.setItem('userProfileType', user.profile_type);
      }
    }
    
    // Keep original profile_type, don't transform it
    const profileType = user.profile_type || 'patient';
    console.log('Setting auth user with profile type:', profileType);
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: profileType,
        ...user // Preserve all other user properties
      },
      isVerifying: false,
      isLoading: false
    });
  }
});
