import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (response.ok) {
        // Get stored user data from signup
        const storedUsers = JSON.parse(localStorage.getItem('eventcraft_users') || '[]');
        const existingUser = storedUsers.find(u => u.email === formData.email);
        
        // Update first login date if not set
        if (existingUser && !existingUser.firstLoginDate) {
          existingUser.firstLoginDate = new Date().toISOString();
          localStorage.setItem('eventcraft_users', JSON.stringify(storedUsers));
        }
        
        const userData = {
          name: data.user?.name || existingUser?.name || formData.email.split('@')[0],
          email: data.user?.email || formData.email,
          phone: existingUser?.phone || '',
          location: existingUser?.location || '',
          signupDate: existingUser?.signupDate || new Date().toISOString(),
          firstLoginDate: existingUser?.firstLoginDate || new Date().toISOString()
        };
        login(userData);
        alert('Login successful!');
        navigate('/'); // Redirect to home page
      } else {
        alert(data.error || 'Login failed!');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      // For demo purposes, check localStorage for user data from signup
      const storedUsers = JSON.parse(localStorage.getItem('eventcraft_users') || '[]');
      const existingUser = storedUsers.find(u => u.email === formData.email);
      
      // Update first login date if not set
      if (existingUser && !existingUser.firstLoginDate) {
        existingUser.firstLoginDate = new Date().toISOString();
        localStorage.setItem('eventcraft_users', JSON.stringify(storedUsers));
      }
      
      const userData = {
        name: existingUser?.name || formData.email.split('@')[0],
        email: formData.email,
        phone: existingUser?.phone || '',
        location: existingUser?.location || '',
        signupDate: existingUser?.signupDate || new Date().toISOString(),
        firstLoginDate: existingUser?.firstLoginDate || new Date().toISOString()
      };
      login(userData);
      alert('Login successful!');
      navigate('/'); // Redirect to home page
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button">Sign In</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
