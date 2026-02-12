import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleAuthCallback();
        navigate('/app/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, handleAuthCallback]);

  return (
    <div className="auth-callback">
      <div className="container">
        <p>Processing authentication...</p>
      </div>
    </div>
  );
}
