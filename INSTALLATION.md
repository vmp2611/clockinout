# Installation Guide for Clock In/Out System

## Step 1: Install Node.js

Since Node.js is not currently installed on your system, you'll need to install it first.

### Option A: Download from Official Website (Recommended)
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the installer and follow the installation wizard
4. Make sure to check "Add to PATH" during installation

### Option B: Using Chocolatey (if you have it installed)
```bash
choco install nodejs
```

### Option C: Using Winget (Windows Package Manager)
```bash
winget install OpenJS.NodeJS
```

## Step 2: Verify Installation

After installation, restart your terminal/PowerShell and run:
```bash
node --version
npm --version
```

Both commands should return version numbers if installation was successful.

## Step 3: Install Project Dependencies

Once Node.js is installed, navigate to your project directory and run:

```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

## Step 4: Start the Application

```bash
# Start both backend and frontend servers
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

## Step 5: Access the Application

Open your web browser and go to: **http://localhost:3000**

## Alternative: Manual Installation

If the `npm run install-all` command doesn't work, you can install dependencies manually:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

## Troubleshooting

### If npm is still not recognized after installation:
1. Restart your terminal/PowerShell
2. Restart your computer
3. Check if Node.js is in your system PATH

### If you get permission errors:
Run PowerShell as Administrator

### If ports are already in use:
- Change the port in `server/index.js` (line 8)
- Or kill the process using the port

## System Requirements

- Windows 10 or later
- Node.js 14.0 or higher
- At least 100MB free disk space
- Modern web browser (Chrome, Firefox, Edge, Safari)

## What the Application Does

Once running, you'll have access to:

1. **Dashboard**: Overview of current employee status and daily statistics
2. **Clock In/Out**: Main interface for employees to clock in and out
3. **Employees**: Manage employee information and add new employees
4. **Records**: View detailed time records and export to CSV

The system comes with 3 sample employees to get you started:
- John Doe (Cashier)
- Jane Smith (Manager)  
- Mike Johnson (Stock Clerk)

## Need Help?

If you encounter any issues during installation, please:
1. Check that Node.js is properly installed
2. Ensure you're running commands from the project root directory
3. Try restarting your terminal/computer
4. Check the main README.md file for additional troubleshooting tips 