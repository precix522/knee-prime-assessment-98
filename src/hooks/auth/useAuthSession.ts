
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
      
      if (!phone || phone.trim() === '') {
        throw new Error('Invalid phone number in OTP verification response');
      }
      
      // Try to fetch the existing user profile from the database first
      let userProfile = null;
      let profileType = 'patient'; // Default to patient
      
      if (!state.devMode) {
        try {
          // First check if user already exists in database
          userProfile = await getUserProfileByPhone(phone);
          console.log('Existing user profile from database:', userProfile);
          
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

      toast.success("Login Successful", {
        description: 'You have successfully logged in.'
      });
      
      // Redirect based on profile type
      setTimeout(() => {
        console.log('Current user after login:', authStore.user);
        console.log('Profile type being used for redirection:', profileType);
        
        if (profileType === 'admin') {
          console.log('Redirecting admin to admin-dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else if (profileType === 'patient') {
          console.log('Redirecting patient to report-viewer');
          navigate('/report-viewer', { replace: true }); // Changed from 'patient-dashboard' to 'report-viewer'
        } else {
          console.log('Profile type not recognized, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
      }, 800);
    } catch (error) {
      console.error('Error in handleOTPSuccess:', error);
      toast.error("Session Error", {
        description: 'Error setting up user session. Please try again.'
      });
      updateState({ loading: false });
    }
  }, [authStore, navigate, updateState, state.devMode]);

  return {
    handleOTPSuccess
  };
};
