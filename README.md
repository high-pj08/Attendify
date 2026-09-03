# Attendify – Employee Attendance Management System

Attendify is a web-based Employee Attendance Management System developed using the MERN stack.

## Source Code

GitHub:
https://github.com/high-pj08/Attendify

## Features

- Employee Login & Registration
- Attendance Check-In / Check-Out
- Working Hours Calculation
- Leave Management
- HR Dashboard
- Employee Dashboard
- Attendance Status Tracking
- Leave Approval / Rejection
- Employee Profile

## Technology Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt.js
- CORS

## Demo Login Credentials

### HR Account
Email: `ganesh2@example.com`
Password: `123456`
After login please refresh page same for logout

### Employee Account
Email: `dipak2@gmail.com`
Password: `123456`

> These credentials are provided for evaluation and demonstration purposes.

## Employee Registration

New employees can register using the **Register** option on the Login page.

Registration creates an account with the Employee role.

## How to Run Locally

### 1. Clone the repository

git clone https://github.com/high-pj08/Attendify.git

### 2. Install backend dependencies

cd Attendify
npm install

### 3. Configure backend environment variables

Create a `.env` file:

MONGO_URI=your_mongodb_connection_string
PORT=5000

### 4. Start backend

npm start

### 5. Install frontend dependencies

cd frontend
npm install

### 6. Configure frontend environment variables

Create `.env`:

VITE_API_URL=http://localhost:5000/api

### 7. Start frontend

npm run dev

## Project Structure

Attendify/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── models/
├── routes/
├── server.js
├── package.json
└── README.md

## Database

MongoDB is used as the database.

Main collections/models:
- User
- Attendance
- Leave


