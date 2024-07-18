import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust path if necessary

function ProtectedRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        // Redirect to login if there is no user
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
