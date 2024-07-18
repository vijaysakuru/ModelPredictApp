import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Adjust path if necessary
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import './LoginForm.css';

function SignInForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from AuthContext

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });
    
            if (response.ok) {
                const userData = await response.json();
                login({ email: formData.email, ...userData });
                toast.success(`Successful SignIn`, {
                    autoClose: 1500,
                    style: { 
                        minWidth: '280px',
                        width: 'auto',
                        padding: '8px 16px',
                        wordBreak: 'keep-all'
                    }
                });
                
                if (userData.is_admin) {
                    navigate('/admin');
                } else {
                    navigate('/predict');
                }
            } else {
                toast.error('SignIn Failed', {
                    autoClose: 1500,
                    style: { minWidth: '280', width: 'auto', padding: '8px 16px', wordBreak: 'keep-all' }
                });
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else if (!navigator.onLine) {
                alert('No internet connection. Please check your network settings.');
            } else if (error.message.includes('Failed to fetch')) {
                alert('Backend is down, we are working on it!');
            } else {
                console.error('Fetch error:', error);
                alert('An unexpected error occurred. Please try again later.');
            }
        }
    };
    

    return (
        <div className="login-page">
            {/* <button className="home-button" onClick={() => navigate('/dashboard')}>Dashboard</button> */}
                <div className="login-form">
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" />
                        <button type="submit">Sign In</button>
                    </form>
                    <p style={{ color: 'black', marginTop: '10px' }}>
                        Don&apos;t have an account? <Link to="/register" style={{ color: 'blue' }}>Register</Link>
                    </p>
                </div>
        </div>

    );
}

export default SignInForm;
