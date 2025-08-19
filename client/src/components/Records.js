import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Filter, Download } from 'lucide-react';
import config from '../config';

const Records = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchEmployees();
    // Set default date range to current week
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedEmployee && startDate && endDate) {
      fetchRecords();
    }
  }, [selectedEmployee, startDate, endDate]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/employee-hours/${selectedEmployee}`, {
        params: { start_date: startDate, end_date: endDate }
      });
      setRecords(response.data);
      calculateSummary(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (recordsData) => {
    const totalHours = recordsData.reduce((sum, record) => sum + (record.hours_worked || 0), 0);
    const totalDays = recordsData.length;
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;

    setSummary({
      totalHours: totalHours.toFixed(2),
      totalDays,
      avgHoursPerDay: avgHoursPerDay.toFixed(2)
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
    const csvContent = [
      ['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours Worked'],
      ...records.map(record => [
        selectedEmployeeData?.name || 'Unknown',
        formatDate(record.date),
        formatTime(record.clock_in),
        record.clock_out ? formatTime(record.clock_out) : 'N/A',
        record.hours_worked ? record.hours_worked.toFixed(2) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEmployeeData?.name || 'employee'}_timesheet_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Time Records</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <Filter size={24} color="#667eea" style={{ marginRight: '8px' }} />
          <h2 className="text-xl font-bold">Filters</h2>
        </div>
        
        <div className="grid grid-3 gap-4">
          <div className="form-group">
            <label htmlFor="employee">Employee</label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="form-control"
            >
              <option value="">Select an employee...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {selectedEmployee && summary.totalDays > 0 && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <Calendar size={24} color="#667eea" style={{ marginRight: '8px' }} />
            <h2 className="text-xl font-bold">Summary</h2>
          </div>
          
          <div className="grid grid-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-lg">Total Hours</h3>
              <p className="text-2xl font-bold text-blue-600">{summary.totalHours}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-lg">Days Worked</h3>
              <p className="text-2xl font-bold text-green-600">{summary.totalDays}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-lg">Avg Hours/Day</h3>
              <p className="text-2xl font-bold text-orange-600">{summary.avgHoursPerDay}</p>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Clock size={24} color="#667eea" style={{ marginRight: '8px' }} />
            <h2 className="text-xl font-bold">Time Records</h2>
          </div>
          {records.length > 0 && (
            <button onClick={exportToCSV} className="btn btn-secondary">
              <Download size={20} style={{ marginRight: '8px' }} />
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="clock-display">Loading...</div>
          </div>
        ) : !selectedEmployee ? (
          <p className="text-center text-gray-500 py-8">Please select an employee to view records</p>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No records found for the selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-bold">Date</th>
                  <th className="text-left p-3 font-bold">Clock In</th>
                  <th className="text-left p-3 font-bold">Clock Out</th>
                  <th className="text-left p-3 font-bold">Hours Worked</th>
                  <th className="text-left p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-semibold">{formatDate(record.date)}</td>
                    <td className="p-3">{formatTime(record.clock_in)}</td>
                    <td className="p-3">
                      {record.clock_out ? formatTime(record.clock_out) : '-'}
                    </td>
                    <td className="p-3 font-semibold">
                      {record.hours_worked ? `${record.hours_worked.toFixed(2)}h` : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`status-badge ${
                        record.clock_out ? 'status-out' : 'status-in'
                      }`}>
                        {record.clock_out ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Records; 