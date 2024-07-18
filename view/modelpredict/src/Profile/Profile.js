import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css'; // Import the CSS file

const Profile = () => {
    const location = useLocation();
    const { profileData } = location.state;
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/predict');
    };

    return (
        <div className="profile-page">
            <span className="back-link-profile" onClick={handleBackClick}>Back</span>
            <div className="profile-wrapper">
                <div className="profile-container">
                    <h1 className="profile-title">User Profile</h1>
                    <div className="profile-details">
                        <h2><strong>First Name:</strong> {profileData.first_name}</h2>
                        <h2><strong>Last Name:</strong> {profileData.last_name}</h2>
                        <h2><strong>Email:</strong> {profileData.email}</h2>
                        <h2><strong>Phone Number:</strong> {profileData.phoneNumber}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
