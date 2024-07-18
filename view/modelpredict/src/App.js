import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import RegisterForm from './Register/RegisterForm';
import SignInForm from './Login/LoginForm';
import PredictionForm from './Predict/PredictionForm';
import ProtectedRoute from './ProtectedRoute';
import HomeForm from './Dashboard/HomeForm';
import Profile from './Profile/Profile';  // Ensure this is the correct path to your Profile component
import { ToastContainer } from 'react-toastify';
import Admin from './Admin/Admin';

function App() {
    return (
        <AuthProvider>
            <Router>
                <ToastContainer
                    position="top-right"
                    autoClose={1500}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    style={{ minWidth: '280px', padding: '0px' }}  // Adjust padding if necessary
                />
                <Routes>
                    <Route path="/" element={<Navigate replace to="/dashboard" />} />
                    <Route path="/dashboard" element={<HomeForm/>} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<SignInForm />} />
                    <Route path="/predict" element={
                        <ProtectedRoute>
                            <PredictionForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } /> 
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
