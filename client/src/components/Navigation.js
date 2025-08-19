import React from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, Users, BarChart3, Home } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="nav">
      <ul className="nav-list">
        <li>
          <NavLink to="/" className="nav-link">
            <Home size={20} style={{ marginRight: '8px' }} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/clock" className="nav-link">
            <Clock size={20} style={{ marginRight: '8px' }} />
            Clock In/Out
          </NavLink>
        </li>
        <li>
          <NavLink to="/employees" className="nav-link">
            <Users size={20} style={{ marginRight: '8px' }} />
            Employees
          </NavLink>
        </li>
        <li>
          <NavLink to="/records" className="nav-link">
            <BarChart3 size={20} style={{ marginRight: '8px' }} />
            Records
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 