import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import SignUp from './components/SignUp';

import Login from './components/Login';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        

        
      </Routes>
    </Router>
  );
}

export default App;