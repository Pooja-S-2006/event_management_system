import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  
  const [user, setUser] = useState({
    name: authUser?.name || 'User',
    email: authUser?.email || 'user@example.com',
    phone: authUser?.phone || '',
    location: authUser?.location || '',
    joinDate: authUser?.firstLoginDate ? new Date(authUser.firstLoginDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not available',
    eventsPlanned: 5,
    upcomingEvents: 2
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  // Update user state when authUser changes
  useEffect(() => {
    if (authUser) {
      const updatedUser = {
        name: authUser.name || 'User',
        email: authUser.email || 'user@example.com',
        phone: authUser.phone || '',
        location: authUser.location || '',
        joinDate: authUser.firstLoginDate ? new Date(authUser.firstLoginDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'Not available',
        eventsPlanned: 5,
        upcomingEvents: 2
      };
      setUser(updatedUser);
      setEditForm(updatedUser);
    }
  }, [authUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...user });
  };

  const handleSave = () => {
    setUser({ ...editForm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div className="profile-info">
          <h1>Welcome, {user.name}!</h1>
          <p>Event Management Dashboard</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEdit}>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <label>Full Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{user.name}</span>
              )}
            </div>

            <div className="detail-row">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{user.email}</span>
              )}
            </div>

            <div className="detail-row">
              <label>Phone:</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{user.phone}</span>
              )}
            </div>

            <div className="detail-row">
              <label>Location:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{user.location}</span>
              )}
            </div>

            <div className="detail-row">
              <label>Member Since:</label>
              <span>{user.joinDate}</span>
            </div>
          </div>
        </div>


        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Plan New Event</button>
            <button className="action-btn secondary">View My Events</button>
            <button className="action-btn secondary">Event History</button>
            <button className="action-btn secondary">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
