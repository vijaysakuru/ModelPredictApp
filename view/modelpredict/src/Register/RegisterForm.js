import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RegisterForm.css';

function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChange_Number = (e) => {
    const { name, value } = e.target;
    // Allow updates for non-phoneNumber inputs or phone numbers within length limits
    if (name !== 'phoneNumber' || value.length <= 10) {
      setFormData({ ...formData, [name]: value });
    }
  };


  //New
  const [passwordError, setPasswordError] = useState('');
  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasSpecial = /[\W_]/.test(value);
    const isValidLength = value.length >= 8;
  
    let errorMsg = '';
    if (!isValidLength) errorMsg += 'Password must be at least 8 characters long. ';
    if (!hasNumber) errorMsg += 'Include a number. ';
    if (!hasUpper) errorMsg += 'Include an uppercase letter. ';
    if (!hasSpecial) errorMsg += 'Include a special character. ';
  
    setPasswordError(errorMsg); // Update the error message state
    setFormData({ ...formData, [name]: value }); // Always update the form data
  };  
  
  const handleChangeConfirmPassword = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  
  

  const handleKeyDown = (e) => {
    // Allow only digits, backspace, and navigation keys for phone number input
    if (e.target.name === 'phoneNumber' && !['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle again
  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      if(formData.first_name === '') {
        alert('First Name can\'t be Empty');
        return;
      }

      if(formData.last_name === '') {
        alert('Last Name can\'t be Empty');
        return;
      }

      // Validate phone number length
      if (formData.phoneNumber.length !== 10) {
        alert('Phone number must be 10 digits');
        return;
      }

      // Validate email format
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      const registrationData = {...formData};
      delete registrationData.confirmPassword; // Exclude confirmPassword

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        toast.success(`Profile Created`, {
            autoClose: 2000,
            style: { minWidth: '500px', padding: '8px 16px', wordBreak: 'keep-all' }
        });
        navigate('/login');
      } else {
          toast.error(`Email already exists`, {
              autoClose: 2000,
              style: { minWidth: '550px', padding: '8px 16px', wordBreak: 'keep-all' }
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
    <div className="register-page">
        <div className="register-form">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
            <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange_Number} onKeyDown={handleKeyDown} placeholder="Phone Number" maxLength="10"/>
            <input type="password" name="password" value={formData.password} onChange={handleChangePassword} placeholder="Password" />
            {passwordError && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>{passwordError}</div>}
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChangeConfirmPassword} placeholder="Confirm Password" />
            <button type="submit">Register</button>
          </form>
          <p style={{ color: 'black', marginTop: '10px' }}>
            Already have an account? <Link to="/login" style={{ color: 'blue' }}>Login</Link>
          </p>
        </div>
    </div>
  );
}

export default RegisterForm;
