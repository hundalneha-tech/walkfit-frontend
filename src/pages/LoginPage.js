import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const googleToken = credentialResponse.credential;
      
      // Try to verify with backend, but if it fails, use the Google token directly
      try {
        const response = await authAPI.verifyToken(googleToken);
        const token = response.data.token || googleToken;
        login(token);
      } catch (backendError) {
        console.warn('Backend verification failed, using Google token directly:', backendError.message);
        // Use Google token directly if backend is not available
        login(googleToken);
      }
      
      // Give the auth context a moment to update before navigating
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 500);
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="container">
        <h1>Login to WalkFit</h1>
        <p>Sign in with your Google account</p>
        {error && <p style={{ color: '#f5576c', marginBottom: '20px' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading}
          />
        </div>
        {loading && <p style={{ marginTop: '20px', color: '#666666' }}>Processing login...</p>}
      </div>
    </div>
  );
}
