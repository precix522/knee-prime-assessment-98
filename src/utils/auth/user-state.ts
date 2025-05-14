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
    
    // Keep original profile_type exactly as provided
    const profileType = user.profile_type || 
                        localStorage.getItem('userProfileType') || 
                        'patient';
    
    console.log('Setting login user with exact profile type:', profileType);
    
    // Store profile type in localStorage for extra persistence
    localStorage.setItem('userProfileType', profileType);
    
    // Clean existing session storage items that might cause loops
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
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
    
    // Keep original profile_type exactly as provided
    const profileType = user.profile_type || 
                        localStorage.getItem('userProfileType') || 
                        'patient';
    
    console.log('Setting auth user with exact profile type:', profileType);
    
    // Also store profile type in localStorage for extra persistence
    localStorage.setItem('userProfileType', profileType);
    
    // Clear any redirect loop detection counters
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
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
