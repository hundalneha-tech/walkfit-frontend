import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target?.result;
        
        // Update user profile with new picture
        const updatedUser = {
          ...user,
          picture: base64Image
        };
        updateUser(updatedUser);
        
        // Save to localStorage
        localStorage.setItem('userProfilePicture', base64Image);
        
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="profile-picture-container">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="profile-picture"
                onClick={handleProfilePictureClick}
                style={{ cursor: 'pointer' }}
                title="Click to change profile picture"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <button 
              onClick={handleProfilePictureClick}
              className="btn btn-upload"
              disabled={uploading}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              {uploading ? 'Uploading...' : 'Change Picture'}
            </button>
          </div>
          <h1>Welcome, {user?.name || 'User'}!</h1>
          {user?.email && <p className="user-email">{user.email}</p>}
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h2>Your Profile</h2>
            <div className="profile-info">
              {user?.picture && (
                <div className="info-item">
                  <strong>Picture:</strong>
                  <img src={user.picture} alt="Profile" style={{ maxWidth: '150px', borderRadius: '8px', marginTop: '8px' }} />
                </div>
              )}
              {user?.name && (
                <div className="info-item">
                  <strong>Name:</strong> {user.name}
                </div>
              )}
              {user?.email && (
                <div className="info-item">
                  <strong>Email:</strong> {user.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
}
