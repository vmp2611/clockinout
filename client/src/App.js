import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ClockInOut from './components/ClockInOut';
import Employees from './components/Employees';
import Records from './components/Records';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clock" element={<ClockInOut />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 