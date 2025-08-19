import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, LogIn, LogOut, User } from 'lucide-react';
import config from '../config';

const ClockInOut = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchEmployees();
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeStatus(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeStatus = async (employeeId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/employee-status/${employeeId}`);
      setEmployeeStatus(response.data);
    } catch (error) {
      console.error('Error fetching employee status:', error);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) {
      setMessage('Please select an employee');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${config.API_URL}/api/clock-in`, {
        employee_id: selectedEmployee
      });
      setMessage('Successfully clocked in!');
      fetchEmployeeStatus(selectedEmployee);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error clocking in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) {
      setMessage('Please select an employee');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${config.API_URL}/api/clock-out`, {
        employee_id: selectedEmployee
      });
      setMessage(`Successfully clocked out! Hours worked: ${response.data.hours_worked}`);
      fetchEmployeeStatus(selectedEmployee);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error clocking out');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-6">Clock In/Out</h1>
      
      {/* Current Time Display */}
      <div className="card mb-6">
        <div className="flex items-center justify-center mb-4">
          <Clock size={32} color="#667eea" style={{ marginRight: '12px' }} />
          <h2 className="text-2xl font-bold">Current Time</h2>
        </div>
        <div className="clock-display">
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
        <p className="text-lg text-gray-600">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Employee Selection */}
      <div className="card mb-6">
        <div className="flex items-center justify-center mb-4">
          <User size={24} color="#667eea" style={{ marginRight: '8px' }} />
          <h2 className="text-xl font-bold">Select Employee</h2>
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="form-control text-center"
        >
          <option value="">Choose an employee...</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>

        {selectedEmployeeData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-lg">{selectedEmployeeData.name}</h3>
            <p className="text-gray-600">{selectedEmployeeData.position}</p>
            <p className="text-sm text-gray-500">{selectedEmployeeData.email}</p>
          </div>
        )}
      </div>

      {/* Status Display */}
      {selectedEmployee && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">Current Status</h3>
          <div className="flex justify-center">
            <span className={`status-badge text-lg px-6 py-2 ${
              employeeStatus.is_clocked_in ? 'status-in' : 'status-out'
            }`}>
              {employeeStatus.is_clocked_in ? 'Currently Working' : 'Not Clocked In'}
            </span>
          </div>
          {employeeStatus.current_record?.clock_in && (
            <p className="mt-2 text-sm text-gray-600">
              Clock in time: {new Date(employeeStatus.current_record.clock_in).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Clock In/Out Buttons */}
      <div className="grid grid-2 gap-6">
        <button
          onClick={handleClockIn}
          disabled={loading || !selectedEmployee || employeeStatus.is_clocked_in}
          className="btn btn-success text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn size={32} style={{ marginRight: '12px' }} />
          Clock In
        </button>
        
        <button
          onClick={handleClockOut}
          disabled={loading || !selectedEmployee || !employeeStatus.is_clocked_in}
          className="btn btn-danger text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={32} style={{ marginRight: '12px' }} />
          Clock Out
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.includes('Successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ClockInOut; 