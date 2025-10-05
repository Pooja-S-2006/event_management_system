import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import ConfirmationPage from './components/ConfirmationPage';
import BookingSuccess from './components/BookingSuccess';
import EventBookingForm from './components/EventBookingForm';
import AboutUs from './pages/AboutUs';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Payment from './pages/Payment';
import PackageSelection from './pages/PackageSelection';

function AppContent() {
  const { isLoggedIn } = useAuth();
  
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/confirm-booking" element={
          <ConfirmationPage />
        } />
        <Route path="/booking-success" element={
          <BookingSuccess />
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/select-package" element={
          <ProtectedRoute>
            <PackageSelection />
          </ProtectedRoute>
        } />
        <Route path="/book-event" element={
          <ProtectedRoute>
            <EventBookingForm />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;