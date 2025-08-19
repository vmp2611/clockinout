import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Mail, Briefcase, Edit, Trash2 } from 'lucide-react';
import config from '../config';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: ''
  });
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    email: '',
    position: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      await axios.post(`${config.API_URL}/api/employees`, newEmployee);
      setMessage('Employee added successfully!');
      setNewEmployee({ name: '', email: '', position: '' });
      setShowAddForm(false);
      fetchEmployees();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error adding employee');
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    
    if (!editEmployee.name || !editEmployee.email || !editEmployee.position) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      await axios.put(`${config.API_URL}/api/employees/${selectedEmployee.id}`, editEmployee);
      setMessage('Employee updated successfully!');
      setShowEditForm(false);
      setSelectedEmployee(null);
      setEditEmployee({ name: '', email: '', position: '' });
      fetchEmployees();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating employee');
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${config.API_URL}/api/employees/${employeeId}`);
      setMessage('Employee deleted successfully!');
      fetchEmployees();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error deleting employee');
    }
  };

  const openEditForm = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      position: employee.position
    });
    setShowEditForm(true);
    setMessage('');
  };

  const handleInputChange = (e, formType) => {
    if (formType === 'new') {
      setNewEmployee({
        ...newEmployee,
        [e.target.name]: e.target.value
      });
    } else {
      setEditEmployee({
        ...editEmployee,
        [e.target.name]: e.target.value
      });
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          Add Employee
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
          <form onSubmit={handleAddEmployee}>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newEmployee.name}
                  onChange={(e) => handleInputChange(e, 'new')}
                  className="form-control"
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={(e) => handleInputChange(e, 'new')}
                  className="form-control"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={newEmployee.position}
                onChange={(e) => handleInputChange(e, 'new')}
                className="form-control"
                placeholder="Enter job position"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-success">
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewEmployee({ name: '', email: '', position: '' });
                  setMessage('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <form onSubmit={handleEditEmployee}>
              <div className="form-group">
                <label htmlFor="edit-name">Full Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editEmployee.name}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="form-control"
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editEmployee.email}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="form-control"
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-position">Position</label>
                <input
                  type="text"
                  id="edit-position"
                  name="position"
                  value={editEmployee.position}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="form-control"
                  placeholder="Enter job position"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-success">
                  Update Employee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedEmployee(null);
                    setEditEmployee({ name: '', email: '', position: '' });
                    setMessage('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Employees List */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Users size={24} color="#667eea" style={{ marginRight: '8px' }} />
          <h2 className="text-xl font-bold">Employee List</h2>
        </div>
        
        {employees.length === 0 ? (
          <p className="text-center text-gray-500">No employees found</p>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{employee.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase size={16} style={{ marginRight: '4px' }} />
                      {employee.position}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail size={16} style={{ marginRight: '4px' }} />
                      {employee.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-500">
                      ID: {employee.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      Added: {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditForm(employee)}
                    className="btn btn-secondary p-2"
                    title="Edit Employee"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                    className="btn btn-danger p-2"
                    title="Delete Employee"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees; 