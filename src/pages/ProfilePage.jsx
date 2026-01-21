import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  CircularProgress, 
  Alert,
  Snackbar
} from '@mui/material';
import ProfileContainer from '../components/profile/ProfileContainer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const { verifyAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view');
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  // Initialize userData with proper structure
  const [userData, setUserData] = useState({
    userName: '',
    email: '',
    bio: '',
    createdAt: new Date().toISOString(),
    recipeCount: 0,
    favoriteCount: 0,
    sharedCount: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // MOCK: Fetch from localStorage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
          navigate('/signin');
          return;
        }

        setUserData(prev => ({
          ...prev, // Keep existing defaults
          userName: currentUser.userName || prev.userName,
          email: currentUser.email || prev.email,
          bio: currentUser.bio || '',
          createdAt: currentUser.createdAt || new Date().toISOString(),
          recipeCount: 0, // ProfileContainer calculates this now for mock
          favoriteCount: 0,
          sharedCount: 0
        }));
      } catch (error) {
        setNotification({
          open: true,
          message: error.message,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = async (updatedData) => {
    // This is passed to the Edit form which handles the actual update in the mock version
    // But we need to update local state here to reflect changes
    setUserData(prev => ({
        ...prev,
        ...updatedData
    }));
    setActiveTab('view');
  };

  const handlePasswordUpdate = async (passwordData) => {
    // Password form handles the mock logic
    setActiveTab('view');
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ProfileContainer
        userData={userData}
        loading={loading}
        activeTab={activeTab}
        handleEditToggle={() => setActiveTab('edit')}
        handlePasswordToggle={() => setActiveTab('password')}
        handleProfileUpdate={handleProfileUpdate} // Passed to form
        handlePasswordUpdate={handlePasswordUpdate}
        onSave={handleProfileUpdate} // For compatibility
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ProfilePage;