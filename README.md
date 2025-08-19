# Store Clock In/Out System

A modern web application for managing employee clock in/out times and tracking work hours for your store.

## Features

- **Employee Management**: Add and manage employee information
- **Clock In/Out**: Easy-to-use interface for employees to clock in and out
- **Real-time Dashboard**: View current status and daily statistics
- **Time Tracking**: Automatic calculation of hours worked
- **Records Management**: View and export time records with filtering
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (easily migratable to other databases)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project files**

2. **Install all dependencies** (run this from the root directory):
   ```bash
   npm run install-all
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

4. **Open your browser** and go to `http://localhost:3000`

## Project Structure

```
clockinout/
├── server/                 # Backend Node.js/Express server
│   ├── index.js           # Main server file with API endpoints
│   └── package.json       # Server dependencies
├── client/                # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── ClockInOut.js
│   │   │   ├── Employees.js
│   │   │   ├── Navigation.js
│   │   │   └── Records.js
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json       # Client dependencies
├── package.json           # Root package.json with scripts
└── README.md             # This file
```

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee

### Clock In/Out
- `POST /api/clock-in` - Clock in an employee
- `POST /api/clock-out` - Clock out an employee
- `GET /api/employee-status/:id` - Get employee's current status

### Records
- `GET /api/employee-hours/:id` - Get employee's time records
- `GET /api/today-records` - Get all today's clock records
- `GET /api/summary` - Get summary statistics

## Usage

### For Employees
1. Go to the **Clock In/Out** page
2. Select your name from the dropdown
3. Click **Clock In** when you start work
4. Click **Clock Out** when you finish work

### For Managers
1. **Dashboard**: View current status and daily statistics
2. **Employees**: Add new employees and manage employee information
3. **Records**: View detailed time records and export to CSV

## Sample Data

The system comes with 3 sample employees:
- John Doe (Cashier)
- Jane Smith (Manager)
- Mike Johnson (Stock Clerk)

## Customization

### Adding New Features
- Backend: Add new routes in `server/index.js`
- Frontend: Create new components in `client/src/components/`

### Styling
- Main styles: `client/src/index.css`
- App-specific styles: `client/src/App.css`

### Database
- Currently using SQLite for simplicity
- Can be easily migrated to PostgreSQL, MySQL, or MongoDB

## Production Deployment

### Backend
1. Set environment variables:
   ```bash
   PORT=5000
   NODE_ENV=production
   ```

2. Build and start:
   ```bash
   cd server
   npm start
   ```

### Frontend
1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Serve the `build` folder with a web server

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `server/index.js` or kill the process using the port
2. **Database errors**: Delete `server/database.sqlite` and restart the server
3. **CORS errors**: Ensure the backend is running on port 5000

### Development Tips

- The backend auto-refreshes with nodemon
- The frontend auto-refreshes with React's development server
- Check browser console for frontend errors
- Check terminal for backend errors

## License

MIT License - feel free to use this project for your store!

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the project repository. 