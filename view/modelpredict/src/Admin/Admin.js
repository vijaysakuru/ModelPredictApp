import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; // Ensure the CSS file is linked properly
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Admin() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}getNonAdminUsers/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error('Error fetching non-admin users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleBackClick = () => {
        navigate('/login');
    };

    const handleDelete = async (user) => {
        // Add a confirmation dialog
        const confirm = window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`);

        if (confirm) {
            console.log("Delete user with ID:", user.user_id);
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}delete_user/${user.user_id}/`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    console.log("User deleted successfully");
                    toast.success(`Successfully Deleted ${user.first_name} ${user.last_name}`, {
                      autoClose: 2000,
                      style: { minWidth: '300px', padding: '8px 16px', wordBreak: 'keep-all', color: 'red' }, // Correct way to set text color
                    });
                    setUsers(prevUsers => prevUsers.filter(u => u.user_id !== user.user_id));
                } else {
                    throw new Error('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        } else {
            // If the user cancels, do nothing
            console.log("User deletion cancelled");
        }
    };

    return (
        <div className="admin-page">
            <span className="back-link-admin" onClick={handleBackClick}>Logout</span>
            <div className="admin-wrapper">
                
                <div className="admin-container">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-list">
                        <div className="admin-heading">
                            <div>First Name</div>
                            <div>Last Name</div>
                            <div>Email</div>
                            <div>Operation</div>
                        </div>
                        {users.map(user => (
                            <div key={user.user_id} className="admin-item">
                                <div>{user.first_name}</div>
                                <div>{user.last_name}</div>
                                <div>{user.email}</div>
                                <div>
                                    <button className="delete-button" onClick={() => handleDelete(user)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Admin;
