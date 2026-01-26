import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Divider,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '../contexts/AuthContext';

function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  
  // Status message
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required');
      return false;
    } 
    // Basic format check
    // Note: Removed strict regex to allow simple usernames if your backend supports them
    if (email.length < 3) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email or username');
      return false;
    }
    
    setEmailError(false);
    setEmailErrorMessage('');
    return true;
  };
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('Password is required');
      return false;
    }
    
    setPasswordError(false);
    setPasswordErrorMessage('');
    return true;
  };
  
  const validateForm = () => {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    return emailValid && passwordValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setStatusMessage({ type: 'info', message: 'Logging in...' });
      
      // FIX 1: Pass arguments as separate variables (email, password)
      // The backend/context expects (email, password), not an object
      const result = await login(email, password);
      
      // FIX 2: Check result.success
      if (result.success) {
        // Clear errors
        setStatusMessage({ type: 'success', message: 'Success! Redirecting...' });
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Show error message from backend or default
        setStatusMessage({ 
          type: 'error', 
          message: result.message || 'Invalid email or password. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
        
        {/* Show status message if any */}
        {statusMessage.message && (
          <Alert severity={statusMessage.type} sx={{ width: '100%' }}>
            {statusMessage.message}
          </Alert>
        )}
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            width: '100%',
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                value="remember" 
                color="primary" 
              />
            }
            label="Remember me"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
        
        <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
        
        <Typography sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default SignInPage;