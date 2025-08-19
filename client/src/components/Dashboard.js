import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import config from '../config';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_employees: 0,
    clocked_in_today: 0,
    total_hours_today: 0
  });
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, recordsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/summary`),
        axios.get(`${config.API_URL}/api/today-records`)
      ]);
      setSummary(summaryRes.data);
      setTodayRecords(recordsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="clock-display">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">Store Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-3 mb-6">
        <div className="card text-center">
          <Users size={48} color="#667eea" className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600">{summary.total_employees}</p>
        </div>
        
        <div className="card text-center">
          <Clock size={48} color="#10b981" className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Currently Working</h3>
          <p className="text-3xl font-bold text-green-600">{summary.clocked_in_today}</p>
        </div>
        
        <div className="card text-center">
          <TrendingUp size={48} color="#f59e0b" className="mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Hours Today</h3>
          <p className="text-3xl font-bold text-orange-600">{summary.total_hours_today.toFixed(1)}</p>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Calendar size={24} color="#667eea" style={{ marginRight: '8px' }} />
          <h2 className="text-2xl font-bold">Today's Activity</h2>
        </div>
        
        {todayRecords.length === 0 ? (
          <p className="text-center text-gray-500">No activity recorded today</p>
        ) : (
          <div className="grid gap-4">
            {todayRecords.map((record) => (
              <div key={record.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-bold">{record.name}</h4>
                  <p className="text-sm text-gray-600">{record.position}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Clock In</p>
                      <p className="font-semibold">{formatTime(record.clock_in)}</p>
                    </div>
                    {record.clock_out && (
                      <div>
                        <p className="text-sm text-gray-600">Clock Out</p>
                        <p className="font-semibold">{formatTime(record.clock_out)}</p>
                      </div>
                    )}
                    <div>
                      <span className={`status-badge ${record.clock_out ? 'status-out' : 'status-in'}`}>
                        {record.clock_out ? 'Clocked Out' : 'Working'}
                      </span>
                    </div>
                  </div>
                  {record.hours_worked && (
                    <p className="text-sm text-gray-600 mt-1">
                      Hours: {record.hours_worked.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 