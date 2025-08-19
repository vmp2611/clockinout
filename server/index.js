const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
const buildPath = path.join(__dirname, '../client/build');
const indexPath = path.join(buildPath, 'index.html');

// Check if build files exist
if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
} else {
  console.log('Build files not found. Running in API-only mode.');
}

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Employees table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      position TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Clock records table
    db.run(`CREATE TABLE IF NOT EXISTS clock_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      clock_in DATETIME,
      clock_out DATETIME,
      hours_worked REAL,
      date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees (id)
    )`);

    // Insert sample employees if table is empty
    db.get("SELECT COUNT(*) as count FROM employees", (err, row) => {
      if (row.count === 0) {
        const sampleEmployees = [
          { id: uuidv4(), name: 'John Doe', email: 'john@store.com', position: 'Cashier' },
          { id: uuidv4(), name: 'Jane Smith', email: 'jane@store.com', position: 'Manager' },
          { id: uuidv4(), name: 'Mike Johnson', email: 'mike@store.com', position: 'Stock Clerk' }
        ];

        const stmt = db.prepare("INSERT INTO employees (id, name, email, position) VALUES (?, ?, ?, ?)");
        sampleEmployees.forEach(emp => {
          stmt.run(emp.id, emp.name, emp.email, emp.position);
        });
        stmt.finalize();
        console.log('Sample employees added');
      }
    });
  });
}

// API Routes

// Get all employees
app.get('/api/employees', (req, res) => {
  db.all("SELECT * FROM employees ORDER BY name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new employee
app.post('/api/employees', (req, res) => {
  const { name, email, position } = req.body;
  const id = uuidv4();

  db.run("INSERT INTO employees (id, name, email, position) VALUES (?, ?, ?, ?)",
    [id, name, email, position],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, email, position });
    });
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, position } = req.body;

  db.run("UPDATE employees SET name = ?, email = ?, position = ? WHERE id = ?",
    [name, email, position, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json({ id, name, email, position });
    });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;

  // First check if employee has any clock records
  db.get("SELECT COUNT(*) as count FROM clock_records WHERE employee_id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: 'Cannot delete employee with existing clock records. Please delete their records first.' });
      return;
    }

    // If no clock records, proceed with deletion
    db.run("DELETE FROM employees WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json({ message: 'Employee deleted successfully' });
    });
  });
});

// Clock in
app.post('/api/clock-in', (req, res) => {
  const { employee_id } = req.body;
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const today = moment().format('YYYY-MM-DD');

  // Check if already clocked in today
  db.get("SELECT * FROM clock_records WHERE employee_id = ? AND date = ? AND clock_out IS NULL",
    [employee_id, today], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        res.status(400).json({ error: 'Already clocked in today' });
        return;
      }

      const record_id = uuidv4();
      db.run("INSERT INTO clock_records (id, employee_id, clock_in, date) VALUES (?, ?, ?, ?)",
        [record_id, employee_id, now, today],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Clocked in successfully', record_id, clock_in: now });
        });
    });
});

// Clock out
app.post('/api/clock-out', (req, res) => {
  const { employee_id } = req.body;
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const today = moment().format('YYYY-MM-DD');

  // Find today's clock in record
  db.get("SELECT * FROM clock_records WHERE employee_id = ? AND date = ? AND clock_out IS NULL",
    [employee_id, today], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(400).json({ error: 'No active clock in record found' });
        return;
      }

      // Calculate hours worked
      const clockIn = moment(row.clock_in);
      const clockOut = moment(now);
      const hoursWorked = clockOut.diff(clockIn, 'hours', true);

      db.run("UPDATE clock_records SET clock_out = ?, hours_worked = ? WHERE id = ?",
        [now, hoursWorked, row.id],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ 
            message: 'Clocked out successfully', 
            clock_out: now, 
            hours_worked: hoursWorked.toFixed(2) 
          });
        });
    });
});

// Get employee status
app.get('/api/employee-status/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const today = moment().format('YYYY-MM-DD');

  db.get("SELECT * FROM clock_records WHERE employee_id = ? AND date = ? ORDER BY clock_in DESC LIMIT 1",
    [employee_id, today], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        is_clocked_in: row ? !row.clock_out : false,
        current_record: row 
      });
    });
});

// Get employee hours for a date range
app.get('/api/employee-hours/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { start_date, end_date } = req.query;

  let query = "SELECT * FROM clock_records WHERE employee_id = ?";
  let params = [employee_id];

  if (start_date && end_date) {
    query += " AND date BETWEEN ? AND ?";
    params.push(start_date, end_date);
  }

  query += " ORDER BY date DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all clock records for today
app.get('/api/today-records', (req, res) => {
  const today = moment().format('YYYY-MM-DD');

  db.all(`SELECT cr.*, e.name, e.position 
          FROM clock_records cr 
          JOIN employees e ON cr.employee_id = e.id 
          WHERE cr.date = ? 
          ORDER BY cr.clock_in DESC`, [today], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get summary statistics
app.get('/api/summary', (req, res) => {
  const today = moment().format('YYYY-MM-DD');

  db.get("SELECT COUNT(*) as total_employees FROM employees", (err, empCount) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.get("SELECT COUNT(*) as clocked_in_today FROM clock_records WHERE date = ? AND clock_out IS NULL", 
      [today], (err, clockedIn) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get("SELECT SUM(hours_worked) as total_hours_today FROM clock_records WHERE date = ? AND clock_out IS NOT NULL", 
        [today], (err, totalHours) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({
          total_employees: empCount.total_employees,
          clocked_in_today: clockedIn.clocked_in_today,
          total_hours_today: totalHours.total_hours_today || 0
        });
      });
    });
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: 'Clock In/Out System API is running',
      status: 'Backend is ready',
      note: 'Frontend build files not found. Please check the build process.',
      api_endpoints: [
        '/api/employees',
        '/api/clock-in',
        '/api/clock-out',
        '/api/today-records',
        '/api/summary'
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 