import React, { useState } from 'react';
import { Box, FormControlLabel, Checkbox, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import UsernameField from '../components/auth/UsernameField';
import EmailField from '../components/auth/EmailField';
import PasswordField from '../components/auth/PasswordField';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthDivider from '../components/auth/AuthDivider';
import AuthFooter from '../components/auth/AuthFooter';
import PasswordPolicy from '../components/auth/PasswordPolicy';

function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth(); // Get register function from context

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({
    userName: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false
  });
  
  const [errorMessages, setErrorMessages] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeToTerms' ? checked : value
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
      setErrorMessages({ ...errorMessages, [name]: '' });
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    const newErrorMessages = { ...errorMessages };
    
    // Validate username
    if (!formData.userName.trim()) {
      newErrors.userName = true;
      newErrorMessages.userName = 'Username is required';
      isValid = false;
    } else if (formData.userName.length < 3) {
      newErrors.userName = true;
      newErrorMessages.userName = 'Username must be at least 3 characters';
      isValid = false;
    }
    
    // Validate email
    const validateEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email || !emailRegex.test(email)) {
        return 'Please enter a valid email address';
      }
      if (email.includes('..')) {
        return 'Email address cannot contain consecutive dots';
      }
      return '';
    };

    if (!formData.email || validateEmail(formData.email)) {
      newErrors.email = true;
      newErrorMessages.email = validateEmail(formData.email) || 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = true;
      newErrorMessages.password = 'Password is required';
      isValid = false;
    } else {
      const minLength = formData.password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!minLength || !hasUpperCase || !hasNumber || !hasSpecial) {
        newErrors.password = true;
        newErrorMessages.password = 'Password does not meet requirements';
        isValid = false;
      }
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = true;
      newErrorMessages.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = true;
      newErrorMessages.agreeToTerms = 'You must agree to the terms';
      isValid = false;
    }
    
    setErrors(newErrors);
    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus({ submitting: true, success: false, error: null });

    try {
      // FIX 1: Pass arguments as separate variables, NOT as a single object
      const result = await register(
        formData.userName,
        formData.email,
        formData.password
      );

      // FIX 2: Check result.success (since register returns an object {success: true/false})
      if (result.success) {
        setFormStatus({
          submitting: false,
          success: true,
          error: null
        });

        // Redirect to dashboard immediately on success
        navigate('/dashboard');
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      let errorMessage = error.message || 'Registration failed';
      
      // Improve error readability
      if (errorMessage.includes('missing required information')) {
        errorMessage = 'Please fill in all required fields';
      } else if (errorMessage.includes('Existing user')) {
        errorMessage = 'An account with this email already exists';
      }

      setFormStatus({
        submitting: false,
        success: false,
        error: errorMessage
      });
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Create Account" />
      
      {formStatus.success && (
        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
          Account created successfully! Redirecting...
        </Alert>
      )}
      
      {formStatus.error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {formStatus.error}
        </Alert>
      )}
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <UsernameField
          value={formData.userName}
          onChange={handleChange}
          error={errors.userName}
          helperText={errorMessages.userName}
          autoFocus={true}
        />
        
        <EmailField
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helperText={errorMessages.email}
        />
        
        <PasswordField
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helperText={errorMessages.password}
          autoComplete="new-password"
        />
        
        {formData.password && <PasswordPolicy password={formData.password} />}
        
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          helperText={errorMessages.confirmPassword}
          autoComplete="new-password"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              color={errors.agreeToTerms ? "error" : "primary"}
              required
            />
          }
          label="I agree to the Terms and Conditions"
        />
        {errors.agreeToTerms && (
          <Box sx={{ mt: -1, ml: 2 }}>
            <Typography color="error" variant="caption">
              {errorMessages.agreeToTerms}
            </Typography>
          </Box>
        )}
        
        <AuthSubmitButton
          label="Create Account"
          isSubmitting={formStatus.submitting}
        />
      </Box>
      
      <AuthDivider />
      
      <AuthFooter
        message="Already have an account?"
        linkText="Sign In"
        linkPath="/signin"
      />
    </AuthLayout>
  );
}

export default SignUpPage;