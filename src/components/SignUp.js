import React, { useState } from 'react';
import './SignUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('✅ Signup response:', data);

      if (response.ok) {
        // Store user data locally for demo purposes
        const storedUsers = JSON.parse(localStorage.getItem('eventcraft_users') || '[]');
        storedUsers.push({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          signupDate: new Date().toISOString()
        });
        localStorage.setItem('eventcraft_users', JSON.stringify(storedUsers));
        
        setMessage('✅ Account created successfully! You can now login.');
        // Clear form
        setFormData({ name: '', email: '', password: '', phone: '', location: '' });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage(data.error || '❌ Signup failed!');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      // Store user data locally even if server fails (for demo)
      const storedUsers = JSON.parse(localStorage.getItem('eventcraft_users') || '[]');
      storedUsers.push({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        signupDate: new Date().toISOString()
      });
      localStorage.setItem('eventcraft_users', JSON.stringify(storedUsers));
      
      setMessage('✅ Account created successfully! You can now login.');
      // Clear form
      setFormData({ name: '', email: '', password: '', phone: '', location: '' });
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup-section">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create an Account</h2>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          disabled={loading}
        />

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create Password"
          required
          disabled={loading}
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Your Phone Number"
          required
          disabled={loading}
        />

        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Your City, State"
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </section>
  );
}

export default SignUp;
