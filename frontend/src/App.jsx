import "./App.css";
import API from "./api";
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate
} from "react-router-dom";

import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";


// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {

  // Your current MongoDB user ID
  const userId = localStorage.getItem("userId");

  const location = useLocation();
  const navigate = useNavigate();

  

  const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("userId");

  navigate("/login", { replace: true });
};

  // ======================================================
  // STATES
  // ======================================================

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [leaves, setLeaves] = useState([]);

  const [employee, setEmployee] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);

  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const [leaveStartDate, setLeaveStartDate] = useState("");

  const [leaveEndDate, setLeaveEndDate] = useState("");

  const [leaveReason, setLeaveReason] = useState("");

  // Used to refresh working time while employee is checked in
  const [, setCurrentTime] = useState(new Date());


  // ======================================================
  // GET TODAY'S ATTENDANCE
  // ======================================================

  const getTodayAttendance = async () => {

    try {

      const response = await API.get(
        `/attendance/today/${userId}`
      );

      setTodayAttendance(
        response.data.attendance || null
      );

    } catch (error) {

      console.error(
        "Failed to get today's attendance:",
        error
      );

      setTodayAttendance(null);

    }

  };

  // ======================================================
// GET ATTENDANCE HISTORY
// ======================================================

const getAttendanceHistory = async () => {
  try {
    const response = await API.get(
      `/attendance/history/${userId}`
    );

    setAttendanceHistory(
      response.data.attendance || []
    );

  } catch (error) {
    console.error(
      "Failed to get attendance history:",
      error
    );

    setAttendanceHistory([]);
  }
};

  // ======================================================
  // GET LEAVE HISTORY
  // ======================================================

  const getLeaveHistory = async () => {

    try {

      const response = await API.get(
        `/leave/history/${userId}`
      );

      setLeaves(
        response.data.leaves || []
      );

    } catch (error) {

      console.error(
        "Failed to get leave history:",
        error
      );

      setLeaves([]);

    }

  };

// ======================================================
// GET EMPLOYEE PROFILE
// ======================================================

const getEmployeeProfile = async () => {
  try {
    setProfileLoading(true);

    const response = await API.get(
      `/auth/employees/${userId}`
    );

    console.log("PROFILE API RESPONSE:", response.data);

    // Backend may return employee or user
    const employeeData =
      response.data.employee ||
      response.data.user ||
      response.data;

    if (employeeData && employeeData._id) {
      setEmployee(employeeData);
    } else {
      console.error("Employee data not found:", response.data);
      setEmployee(null);
    }

  } catch (error) {
    console.error(
      "Failed to get employee profile:",
      error.response?.data || error.message
    );

    setEmployee(null);

  } finally {
    setProfileLoading(false);
  }
};


  // ======================================================
  // LOAD ALL DATA
  // ======================================================

  useEffect(() => {

  getTodayAttendance();

  getAttendanceHistory();

  getLeaveHistory();

  getEmployeeProfile();

}, []);


  // ======================================================
  // LIVE WORKING TIME
  // ======================================================

  useEffect(() => {

    if (!todayAttendance?.checkIn) {
      return;
    }

    if (todayAttendance?.checkOut) {
      return;
    }

    const timer = setInterval(() => {

      setCurrentTime(new Date());

    }, 60000);

    return () => clearInterval(timer);

  }, [
    todayAttendance?.checkIn,
    todayAttendance?.checkOut
  ]);


  // ======================================================
  // WORKING HOURS
  // ======================================================

  const getWorkingHours = () => {

    if (!todayAttendance?.checkIn) {

      return "00h 00m";

    }

    const start = new Date(
      todayAttendance.checkIn
    );

    const end = todayAttendance.checkOut
      ? new Date(todayAttendance.checkOut)
      : new Date();

    const difference = Math.max(
      0,
      end - start
    );

    const hours = Math.floor(
      difference /
      (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference %
        (1000 * 60 * 60)) /
      (1000 * 60)
    );

    return `${String(hours).padStart(
      2,
      "0"
    )}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;

  };


  // ======================================================
  // REMAINING TIME
  // ======================================================

  const getRemainingTime = () => {

    if (!todayAttendance?.checkIn) {

      return "08h 00m";

    }

    const start = new Date(
      todayAttendance.checkIn
    );

    const end = todayAttendance.checkOut
      ? new Date(todayAttendance.checkOut)
      : new Date();

    const workedMilliseconds = Math.max(
      0,
      end - start
    );

    const expectedMilliseconds =
      8 * 60 * 60 * 1000;

    const remainingMilliseconds =
      Math.max(
        0,
        expectedMilliseconds -
        workedMilliseconds
      );

    const hours = Math.floor(
      remainingMilliseconds /
      (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (remainingMilliseconds %
        (1000 * 60 * 60)) /
      (1000 * 60)
    );

    return `${String(hours).padStart(
      2,
      "0"
    )}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;

  };


  // ======================================================
  // CHECK IN
  // ======================================================

  const handleCheckIn = async () => {

    try {

      const response = await API.post(
        "/attendance/check-in",
        {
          userId
        }
      );

      alert(
        response.data.message
      );

      await getTodayAttendance();
      await getAttendanceHistory();

    } catch (error) {

      console.error(
        "Check-in error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Check-in failed"
      );

    }

  };


  // ======================================================
  // CHECK OUT
  // ======================================================

  const handleCheckOut = async () => {

    try {

      const response = await API.post(
        "/attendance/check-out",
        {
          userId
        }
      );

      alert(
        response.data.message
      );

      await getTodayAttendance();
      await getAttendanceHistory();
    } catch (error) {

      console.error(
        "Check-out error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Check-out failed"
      );

    }

  };


  // ======================================================
  // APPLY FOR LEAVE
  // ======================================================

  const handleApplyLeave = async () => {

    if (
      !leaveStartDate ||
      !leaveEndDate ||
      !leaveReason.trim()
    ) {

      alert(
        "Please fill all leave details"
      );

      return;

    }


    if (
      new Date(leaveEndDate) <
      new Date(leaveStartDate)
    ) {

      alert(
        "End date cannot be before start date"
      );

      return;

    }


    try {

      const response = await API.post(
        "/leave/apply",
        {
          userId,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason.trim()
        }
      );

      alert(
        response.data.message
      );


      // Clear form

      setLeaveStartDate("");

      setLeaveEndDate("");

      setLeaveReason("");

      setShowLeaveForm(false);


      // Refresh leave history

      await getLeaveHistory();

    } catch (error) {

      console.error(
        "Leave error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Leave request failed"
      );

    }

  };


  // ======================================================
  // TODAY'S DATE
  // ======================================================

  const todayDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  // ======================================================
  // EMPLOYEE INFORMATION
  // ======================================================

  const employeeName =
    employee?.name || "Employee";

  const employeeInitial =
    employeeName
      .charAt(0)
      .toUpperCase();

  const employeeDepartment =
    employee?.department ||
    "Not assigned";

  const employeeEmail =
    employee?.email ||
    "No email";

  const employeeRole =
    employee?.role === "hr"
      ? "HR Administrator"
      : "Software Developer";

  const employeeId =
    employee?._id
      ? `EMP-${employee._id
          .slice(-3)
          .toUpperCase()}`
      : "N/A";

        // ======================================================
        // DASHBOARD STATISTICS
        // ======================================================

        const presentDays = attendanceHistory.filter(
          (record) => record.checkIn
        ).length;

        const completedDays = attendanceHistory.filter(
          (record) =>
            record.checkIn &&
            record.checkOut
        ).length;

        const totalWorkingHours = attendanceHistory.reduce(
          (total, record) =>
            total + (Number(record.workingHours) || 0),
          0
        );

        // Attendance percentage
        const attendancePercentage =
          attendanceHistory.length > 0
            ? (
                (presentDays / attendanceHistory.length) *
                100
              ).toFixed(1)
            : "0.0";

       
  return (

    <div className="app">


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            EA
          </div>

          <div>

            <h2>
              Attendify
            </h2>

            <span>
              Employee Portal
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav>

          <Link
            to="/"
            className={`nav-item ${
              location.pathname === "/"
                ? "active"
                : ""
            }`}
          >
            <span>▦</span>
            Dashboard
          </Link>


          <Link
            to="/attendance"
            className={`nav-item ${
              location.pathname === "/attendance"
                ? "active"
                : ""
            }`}
          >
            <span>◷</span>
            Attendance
          </Link>


          <Link
            to="/leave"
            className={`nav-item ${
              location.pathname === "/leave"
                ? "active"
                : ""
            }`}
          >
            <span>▤</span>
            Leave
          </Link>


          <Link
            to="/profile"
            className={`nav-item ${
              location.pathname === "/profile"
                ? "active"
                : ""
            }`}
          >
            <span>◉</span>
            My Profile
          </Link>

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="help-box">

            <div className="help-icon">
              ?
            </div>

            <div>

              <strong>
                Need help?
              </strong>

              <p>
                Contact HR support
              </p>

            </div>

          </div>


           <button
              type="button"
              className="logout"
              onClick={handleLogout}
            >
              ⇥ &nbsp; Logout
            </button>

        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="main">


        {/* ==================================================
            TOPBAR
        ================================================== */}

        <header className="topbar">

          <div>

            <h1>
              Good morning, {employeeName} 👋
            </h1>

            <p>
              Here's what's happening with
              your attendance today.
            </p>

          </div>


          <div className="top-actions">

            <button className="notification">
              ♢
              <span></span>
            </button>


            <div className="profile">

              <div className="avatar">
                {profileLoading
                  ? "P"
                  : employeeInitial}
              </div>


              <div>

                <strong>
                  {profileLoading
                    ? "Loading..."
                    : employeeName}
                </strong>

                <small>
                  {profileLoading
                    ? "Loading..."
                    : employeeRole}
                </small>

              </div>


              <b>
                ⌄
              </b>

            </div>

          </div>

        </header>


        {/* ==================================================
            STATS
        ================================================== */}

        <section className="stats">


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Attendance
              </span>

              <div className="stat-icon blue">
                ✓
              </div>

            </div>

            <h2>
                 {attendancePercentage}%
              </h2>

              <p>
               Based on attendance records
              </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Working Days
              </span>

              <div className="stat-icon purple">
                ◷
              </div>

            </div>

            <h2>
              {presentDays} 
            </h2>

           <p>
              Present days
           </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Leave Balance
              </span>

              <div className="stat-icon orange">
                ▣
              </div>

            </div>

            <h2>
              12 <small>days</small>
            </h2>

            <p>
              2 days used this month
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Working Hours
              </span>

              <div className="stat-icon green">
                ⌛
              </div>

            </div>

            <h2>
              {totalWorkingHours.toFixed(2)}
            </h2>

            <p>
              Total working hours
            </p>
          </div>

        </section>


        {/* ==================================================
            DASHBOARD GRID
        ================================================== */}

        <section className="dashboard-grid">


          {/* ==================================================
              TODAY ATTENDANCE
          ================================================== */}

          <div className="card attendance-card">

            <div className="card-header">

              <div>

                <h3>
                  Today's Attendance
                </h3>

                <p>
                  {todayDate}
                </p>

              </div>


              <span className="status">

                ●{" "}

                {todayAttendance?.checkIn
                  ? "Present"
                  : "Not Present"}

              </span>

            </div>


            {/* CHECK IN / CHECK OUT */}

            <div className="attendance-times">


              <div className="time-box">

                <span className="time-label">
                  CHECK IN
                </span>


                <strong>

                  {todayAttendance?.checkIn

                    ? new Date(
                        todayAttendance.checkIn
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit"
                        }
                      )

                    : "-- : --"}

                </strong>


                <small>

                  {todayAttendance?.checkIn
                    ? "Checked in"
                    : "Not checked in"}

                </small>

              </div>


              <div className="time-line">
                <div></div>
              </div>


              <div className="time-box">

                <span className="time-label">
                  CHECK OUT
                </span>


                <strong>

                  {todayAttendance?.checkOut

                    ? new Date(
                        todayAttendance.checkOut
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit"
                        }
                      )

                    : "-- : --"}

                </strong>


                <small>

                  {todayAttendance?.checkOut
                    ? "Checked out"
                    : "Not checked out"}

                </small>

              </div>

            </div>


            {/* HOURS */}

            <div className="hours">

              <div>

                <span>
                  Working time
                </span>

                <strong>
                  {getWorkingHours()}
                </strong>

              </div>


              <div>

                <span>
                  Expected
                </span>

                <strong>
                  08h 00m
                </strong>

              </div>


              <div>

                <span>
                  Remaining
                </span>

                <strong>
                  {getRemainingTime()}
                </strong>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="attendance-buttons">

              <button
                className="check-in"
                onClick={handleCheckIn}
                disabled={
                  !!todayAttendance?.checkIn
                }
              >

                {todayAttendance?.checkIn
                  ? "✓ Checked In"
                  : "✓ Check In"}

              </button>


              <button
                className="check-out"
                onClick={handleCheckOut}
                disabled={
                  !todayAttendance?.checkIn ||
                  !!todayAttendance?.checkOut
                }
              >

                {todayAttendance?.checkOut
                  ? "✓ Checked Out"
                  : "⇥ Check Out"}

              </button>

            </div>

          </div>


          {/* ==================================================
    PROFILE CARD
================================================== */}

<div className="card profile-card">

  <div className="profile-cover"></div>

  <div className="profile-content">

    {/* AVATAR */}

    <div className="large-avatar">
      {employee?.name
        ? employee.name.charAt(0).toUpperCase()
        : "P"}
    </div>


    {/* LOADING */}

    {profileLoading ? (

      <p>
        Loading profile...
      </p>

    ) : employee ? (

      <>

        {/* NAME */}

        <h3>
          {employee.name}
        </h3>


        {/* POSITION */}

        <p>
          {employee.role === "hr"
            ? "HR Administrator"
            : "Software Developer"}
        </p>


        {/* INFORMATION */}

        <div className="profile-info">

          {/* DEPARTMENT */}

          <div>

            <span>
              Department
            </span>

            <strong>
              {employee.department || "Not assigned"}
            </strong>

          </div>


          {/* EMPLOYEE ID */}

          <div>

            <span>
              Employee ID
            </span>

            <strong>
              {employee._id
                ? `EMP-${employee._id
                    .slice(-3)
                    .toUpperCase()}`
                : "N/A"}
            </strong>

          </div>


          {/* EMAIL */}

          <div>

            <span>
              Email
            </span>

            <strong>
              {employee.email || "N/A"}
            </strong>

          </div>


          {/* JOINED */}

          <div>

            <span>
              Joined
            </span>

            <strong>
              {employee.createdAt
                ? new Date(
                    employee.createdAt
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric"
                    }
                  )
                : "N/A"}
            </strong>

          </div>

        </div>


        {/* VIEW PROFILE */}

        <Link
          to="/profile"
          className="profile-button"
        >
          View Profile →
        </Link>

      </>

    ) : (

      <>

        <h3>
          Profile not found
        </h3>

        <p>
          Unable to load employee details
        </p>

        <button
          className="profile-button"
          onClick={getEmployeeProfile}
        >
          Try Again ↻
        </button>

      </>

    )}

  </div>

</div>
          {/* ==================================================
              WEEKLY CHART
          ================================================== */}

          <div className="card chart-card">

            <div className="card-header">

              <div>

                <h3>
                  Weekly Attendance
                </h3>

                <p>
                  Your working hours this week
                </p>

              </div>


              <select>

                <option>
                  This Week
                </option>

                <option>
                  Last Week
                </option>

              </select>

            </div>


            <div className="chart">

              <div className="chart-y">

                <span>10h</span>
                <span>8h</span>
                <span>6h</span>
                <span>4h</span>
                <span>2h</span>
                <span>0h</span>

              </div>


              <div className="chart-area">

                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>


                <div className="bars">


                  <div className="bar-wrap">

                    <div
                      className="bar"
                      style={{ height: "75%" }}
                    ></div>

                    <span>Mon</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar"
                      style={{ height: "88%" }}
                    ></div>

                    <span>Tue</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar"
                      style={{ height: "68%" }}
                    ></div>

                    <span>Wed</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar"
                      style={{ height: "92%" }}
                    ></div>

                    <span>Thu</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar today"
                      style={{ height: "70%" }}
                    ></div>

                    <span>Fri</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar weekend"
                      style={{ height: "10%" }}
                    ></div>

                    <span>Sat</span>

                  </div>


                  <div className="bar-wrap">

                    <div
                      className="bar weekend"
                      style={{ height: "5%" }}
                    ></div>

                    <span>Sun</span>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              LEAVE CARD
          ================================================== */}

          <div className="card leave-card">

            <div className="card-header">

              <div>

                <h3>
                  Recent Leave Requests
                </h3>

                <p>
                  Your latest leave applications
                </p>

              </div>


              <Link
                to="/leave"
                className="view-all"
              >
                View all
              </Link>

            </div>


            {/* LEAVE LIST */}

            {leaves.length === 0 ? (

              <p className="no-leaves">
                No leave requests yet.
              </p>

            ) : (

              leaves
                .slice(0, 3)
                .map((leave) => (

                  <div
                    className="leave-item"
                    key={leave._id}
                  >

                    <div className="leave-icon">
                      🌴
                    </div>


                    <div className="leave-details">

                      <strong>
                        Leave Request
                      </strong>


                      <span>
                        {leave.startDate} –{" "}
                        {leave.endDate}
                      </span>


                      <small>
                        {leave.reason}
                      </small>

                    </div>


                    <span
                      className={
                        leave.status === "approved"
                          ? "approved"
                          : leave.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }
                    >

                      {leave.status
                        ? leave.status
                            .charAt(0)
                            .toUpperCase() +
                          leave.status.slice(1)
                        : "Pending"}

                    </span>

                  </div>

                ))

            )}


            {/* APPLY LEAVE */}

            <button
              className="apply-leave"
              onClick={() =>
                setShowLeaveForm(true)
              }
            >
              + Apply for Leave
            </button>


            {/* LEAVE FORM */}

            {showLeaveForm && (

              <div className="leave-form">

                <h3>
                  Apply for Leave
                </h3>


                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  value={leaveStartDate}
                  onChange={(e) =>
                    setLeaveStartDate(
                      e.target.value
                    )
                  }
                />


                <label>
                  End Date
                </label>

                <input
                  type="date"
                  value={leaveEndDate}
                  onChange={(e) =>
                    setLeaveEndDate(
                      e.target.value
                    )
                  }
                />


                <label>
                  Reason
                </label>

                <textarea
                  placeholder="Enter reason for leave"
                  value={leaveReason}
                  onChange={(e) =>
                    setLeaveReason(
                      e.target.value
                    )
                  }
                />


                <div className="leave-form-buttons">

                  <button
                    onClick={() => {
                      setShowLeaveForm(false);
                      setLeaveStartDate("");
                      setLeaveEndDate("");
                      setLeaveReason("");
                    }}
                  >
                    Cancel
                  </button>


                  <button
                    onClick={handleApplyLeave}
                  >
                    Submit Leave
                  </button>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer>

          © 2026 Attendify · Employee Attendance
          Management System

        </footer>

      </main>

    </div>

  );

}


// ======================================================
// APP ROUTES
// ======================================================

function App() {
  const userData =
    localStorage.getItem("user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );

    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    user = null;
  }

  const isLoggedIn = !!user;

  const isHR =
    user?.role === "hr";

  return (
    <Routes>

      {/* ==================================================
          LOGIN
      ================================================== */}

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            isHR ? (
              <Navigate
                to="/admin"
                replace
              />
            ) : (
              <Navigate
                to="/"
                replace
              />
            )
          ) : (
            <Login />
          )
        }
      />


      {/* ==================================================
          EMPLOYEE DASHBOARD
      ================================================== */}

      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Navigate
              to="/login"
              replace
            />
          ) : isHR ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Dashboard />
          )
        }
      />


      {/* ==================================================
          ATTENDANCE
      ================================================== */}

      <Route
        path="/attendance"
        element={
          !isLoggedIn ? (
            <Navigate
              to="/login"
              replace
            />
          ) : isHR ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Attendance />
          )
        }
      />


      {/* ==================================================
          LEAVE
      ================================================== */}

      <Route
        path="/leave"
        element={
          !isLoggedIn ? (
            <Navigate
              to="/login"
              replace
            />
          ) : isHR ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Leave />
          )
        }
      />


      {/* ==================================================
          PROFILE
      ================================================== */}

      <Route
        path="/profile"
        element={
          !isLoggedIn ? (
            <Navigate
              to="/login"
              replace
            />
          ) : isHR ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Profile />
          )
        }
      />


      {/* ==================================================
          ADMIN DASHBOARD
      ================================================== */}

      <Route
        path="/admin"
        element={
          !isLoggedIn ? (
            <Navigate
              to="/login"
              replace
            />
          ) : !isHR ? (
            <Navigate
              to="/"
              replace
            />
          ) : (
            <AdminDashboard />
          )
        }
      />


      {/* ==================================================
          UNKNOWN URL
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              !isLoggedIn
                ? "/login"
                : isHR
                ? "/admin"
                : "/"
            }
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;