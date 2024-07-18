import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeForm.css'; // Make sure to link the CSS file

function HomeForm() {
    const navigate = useNavigate();

    const handleSignInButton = () => {
        navigate("/login");
    };

    const handleRegisterButton = () => {
        navigate("/register"); // Fixed typo in 'register'
    };

    return (
        <div>
            <div className="home-container">
                <div className="main-head">Trend Anticipator
                    <br></br><br></br>
                        <p className= "ul-class">Select Your Model, Predict Your Business Targets.</p>
                </div>
                    <button onClick={handleRegisterButton} className="home-button">Register</button>
                    <button onClick={handleSignInButton} className="home-button">Login</button>
                </div>
        </div>
    );
    
}

export default HomeForm;
