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
    const profileType = user.profile_type || 
                        localStorage.getItem('userProfileType') || 
                        'patient';
    console.log('Setting login user with profile type:', profileType);
    
    // Store profile type in localStorage for extra persistence
    localStorage.setItem('userProfileType', profileType);
    
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
    }
    
    // Keep original profile_type, don't transform it
    // Check local storage as a backup source if not provided in the user object
    const profileType = user.profile_type || 
                        localStorage.getItem('userProfileType') || 
                        'patient';
    console.log('Setting auth user with profile type:', profileType);
    
    // Also store profile type in localStorage for extra persistence
    localStorage.setItem('userProfileType', profileType);
    
    // Clear any redirect loop detection counters
    sessionStorage.removeItem('loginRedirectCount');
    
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
