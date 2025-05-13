
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
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: user.profile_type || 'user'
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
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: user.profile_type || 'user'
      },
      isVerifying: false
    });
  }
});
