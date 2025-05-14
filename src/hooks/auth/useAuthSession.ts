
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getUserProfileByPhone } from '@/utils/supabase';
import { AuthState } from './types';

export const useAuthSession = (
  state: AuthState,
  updateState: (updates: Partial<AuthState>) => void,
  authStore: any
) => {
  const navigate = useNavigate();

  const handleOTPSuccess = useCallback(async (sessionId: string, userData: any) => {
    console.log('OTP Success - User data:', userData);
    console.log('OTP Success - Session ID:', sessionId);
    
    try {
      // Get the phone number from userData
      const phone = userData.phone_number;
      
      // Try to fetch the user profile from the database
      let userProfile = null;
      let profileType = 'patient'; // Default to patient
      
      if (!state.devMode) {
        try {
          userProfile = await getUserProfileByPhone(phone);
          console.log('User profile from database:', userProfile);
          
          if (userProfile && userProfile.profile_type) {
            profileType = userProfile.profile_type;
            console.log('Found profile type in database:', profileType);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Continue with default profile type
        }
      } else {
        // In dev mode, use the profile type from userData
        profileType = userData.profile_type || 'admin';
        console.log('Using dev mode profile type:', profileType);
      }
      
      // Create the user object with profile type and ensure it's properly formatted
      const user = {
        id: sessionId,
        phone: phone,
        name: userData.name || 'User',
        profile_type: profileType,
        ...userData
      };

      console.log('Setting auth user with data:', user);
      
      // Clear any potential loop detection counters
      sessionStorage.removeItem('loginRedirectCount');
      sessionStorage.removeItem('lastRedirect');
      
      // Store the profile type specifically to enhance persistence
      localStorage.setItem('userProfileType', profileType);
      
      // Ensure we're properly setting the auth user
      await authStore.setAuthUser(user);
      
      updateState({
        loading: false,
        error: null,
      });

      toast.success('You have successfully logged in.');
      
      // Longer delay to ensure state is updated
      setTimeout(() => {
        console.log('Current user after login:', authStore.user);
        console.log('Profile type being used for redirection:', profileType);
        
        // Use replace to prevent back button from returning to login
        if (profileType === 'admin') {
          console.log('Redirecting admin to manage-patients with replace:true');
          navigate('/manage-patients', { replace: true });
        } else if (profileType === 'patient') {
          console.log('Redirecting patient to report-viewer with replace:true');
          navigate('/report-viewer', { replace: true });
        } else {
          console.log('Profile type not recognized, redirecting to dashboard with replace:true');
          navigate('/dashboard', { replace: true });
        }
      }, 800);
    } catch (error) {
      console.error('Error in handleOTPSuccess:', error);
      toast.error('Error setting up user session. Please try again.');
      updateState({ loading: false });
    }
  }, [authStore, navigate, updateState, state.devMode]);

  return {
    handleOTPSuccess
  };
};
