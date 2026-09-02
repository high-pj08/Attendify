import "../App.css";
import API from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);

  // ======================================================
  // CURRENT USER
  // ======================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  // ======================================================
  // CHECK ADMIN LOGIN
  // ======================================================

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.role !== "hr") {
      alert("Access denied. HR administrators only.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ======================================================
  // GET ALL ATTENDANCE
  // ======================================================

  const getAttendance = async () => {
    try {
      const response = await API.get("/attendance/all");

      console.log(
        "ATTENDANCE RESPONSE:",
        response.data
      );

      setAttendance(
        response.data.attendance || []
      );
    } catch (error) {
      console.error(
        "Failed to get attendance:",
        error.response?.data || error.message
      );

      setAttendance([]);
    }
  };

  // ======================================================
  // GET ALL LEAVES
  // ======================================================

  const getLeaves = async () => {
    try {
      const response = await API.get("/leave/all");

      console.log(
        "LEAVE RESPONSE:",
        response.data
      );

      setLeaves(
        response.data.leaves || []
      );
    } catch (error) {
      console.error(
        "Failed to get leaves:",
        error.response?.data || error.message
      );

      setLeaves([]);
    }
  };

  // ======================================================
  // GET ALL EMPLOYEES
  // ======================================================

  const getEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const response = await API.get(
        "/auth/employees"
      );

      console.log(
        "EMPLOYEES RESPONSE:",
        response.data
      );

      const employeeData =
        response.data.employees ||
        response.data.users ||
        response.data.employee ||
        [];

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to get employees:",
        error.response?.data || error.message
      );

      setEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // ======================================================
  // LOAD ALL DATA
  // ======================================================

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "hr") {
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        getAttendance(),
        getLeaves(),
        getEmployees()
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ======================================================
  // APPROVE LEAVE
  // ======================================================

  const handleApprove = async (leaveId) => {
    if (!leaveId) {
      alert("Invalid leave request.");
      return;
    }

    try {
      const response = await API.put(
        `/leave/approve/${leaveId}`
      );

      alert(
        response.data.message ||
        "Leave approved successfully"
      );

      setLeaves((currentLeaves) =>
        currentLeaves.map((leave) =>
          leave._id === leaveId
            ? {
                ...leave,
                status: "approved"
              }
            : leave
        )
      );
    } catch (error) {
      console.error(
        "Approve leave error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to approve leave"
      );
    }
  };

  // ======================================================
  // REJECT LEAVE
  // ======================================================

  const handleReject = async (leaveId) => {
    if (!leaveId) {
      alert("Invalid leave request.");
      return;
    }

    try {
      const response = await API.put(
        `/leave/reject/${leaveId}`
      );

      alert(
        response.data.message ||
        "Leave rejected successfully"
      );

      setLeaves((currentLeaves) =>
        currentLeaves.map((leave) =>
          leave._id === leaveId
            ? {
                ...leave,
                status: "rejected"
              }
            : leave
        )
      );
    } catch (error) {
      console.error(
        "Reject leave error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to reject leave"
      );
    }
  };

  // ======================================================
  // REFRESH EVERYTHING
  // ======================================================

  const refreshData = async () => {
    setLoading(true);

    await Promise.all([
      getAttendance(),
      getLeaves(),
      getEmployees()
    ]);

    setLoading(false);
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    // Optional: clear any token if you use one
    localStorage.removeItem("token");

    // Go back to login
    navigate("/login", {
      replace: true
    });
  };

  // ======================================================
  // TODAY
  // ======================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ======================================================
  // TODAY ATTENDANCE
  // ======================================================

  const todayAttendance = attendance.filter(
    (record) => {
      if (!record.date) {
        return false;
      }

      return (
        String(record.date).split("T")[0] ===
        today
      );
    }
  );

  // ======================================================
  // PRESENT TODAY
  // ======================================================

  const presentToday =
    todayAttendance.filter(
      (record) => record.checkIn
    ).length;

  // ======================================================
  // CHECKED OUT
  // ======================================================

  const checkedOut =
    todayAttendance.filter(
      (record) => record.checkOut
    ).length;

  // ======================================================
  // PENDING LEAVES
  // ======================================================

  const pendingLeaves =
    leaves.filter(
      (leave) =>
        !leave.status ||
        leave.status === "pending"
    ).length;

  // ======================================================
  // TOTAL EMPLOYEES
  // ======================================================

  const totalEmployees =
    employees.filter(
      (employee) =>
        employee.role !== "hr"
    ).length;

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (time) => {
    if (!time) {
      return "--";
    }

    const date = new Date(time);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ======================================================
  // FORMAT LEAVE STATUS
  // ======================================================

  const getLeaveStatusClass = (status) => {
    if (status === "approved") {
      return "approved";
    }

    if (status === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // ======================================================
  // GET CURRENT USER FOR HEADER
  // ======================================================

  const currentUser = getCurrentUser();

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="admin-header">

        <div>
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage employee attendance and
            leave requests
          </p>
        </div>

        <div className="admin-header-actions">

          {/* ADMIN PROFILE */}

          <div className="admin-profile">

            <div className="admin-avatar">
              HR
            </div>

            <div>

              <strong>
                {currentUser?.name ||
                  "HR Admin"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </header>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <section className="admin-stats">

        {/* TOTAL EMPLOYEES */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon blue">
            👥
          </div>

          <div>

            <span>
              Total Employees
            </span>

            <h2>
              {employeeLoading
                ? "..."
                : totalEmployees}
            </h2>

          </div>

        </div>


        {/* PRESENT TODAY */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon green">
            ✓
          </div>

          <div>

            <span>
              Present Today
            </span>

            <h2>
              {presentToday}
            </h2>

          </div>

        </div>


        {/* CHECKED OUT */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon purple">
            ⏱
          </div>

          <div>

            <span>
              Checked Out
            </span>

            <h2>
              {checkedOut}
            </h2>

          </div>

        </div>


        {/* PENDING LEAVES */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon orange">
            📝
          </div>

          <div>

            <span>
              Pending Leaves
            </span>

            <h2>
              {pendingLeaves}
            </h2>

          </div>

        </div>

      </section>


      {/* ==================================================
          EMPLOYEES
      ================================================== */}

      <section className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Employees
            </h2>

            <p>
              Registered employees
            </p>

          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={getEmployees}
          >
            ↻ Refresh
          </button>

        </div>


        {employeeLoading ? (

          <div className="admin-loading">
            Loading employees...
          </div>

        ) : employees.length === 0 ? (

          <div className="admin-empty">
            No employees found.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Role
                  </th>

                </tr>

              </thead>

              <tbody>

                {employees
                  .filter(
                    (employee) =>
                      employee.role !== "hr"
                  )
                  .slice(0, 10)
                  .map((employee) => (

                    <tr
                      key={employee._id}
                    >

                      <td>

                        <div className="employee-cell">

                          <div className="employee-avatar">

                            {employee.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}

                          </div>

                          <div>

                            <strong>
                              {employee.name ||
                                "Unknown"}
                            </strong>

                          </div>

                        </div>

                      </td>

                      <td>
                        {employee.email ||
                          "No email"}
                      </td>

                      <td>
                        {employee.department ||
                          "Not assigned"}
                      </td>

                      <td>
                        Employee
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ==================================================
          ATTENDANCE
      ================================================== */}

      <section className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Employee Attendance
            </h2>

            <p>
              Latest attendance records
            </p>

          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={refreshData}
          >
            ↻ Refresh
          </button>

        </div>


        {loading ? (

          <div className="admin-loading">
            Loading attendance...
          </div>

        ) : attendance.length === 0 ? (

          <div className="admin-empty">
            No attendance records found.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Check In
                  </th>

                  <th>
                    Check Out
                  </th>

                  <th>
                    Working Hours
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {attendance
                  .slice(0, 10)
                  .map((record) => (

                    <tr
                      key={record._id}
                    >

                      <td>

                        <div className="employee-cell">

                          <div className="employee-avatar">

                            {record.userId?.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}

                          </div>

                          <div>

                            <strong>
                              {record.userId?.name ||
                                "Unknown"}
                            </strong>

                            <small>
                              {record.userId?.email ||
                                "No email"}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>
                        {record.date
                          ? String(
                              record.date
                            ).split("T")[0]
                          : "--"}
                      </td>

                      <td>
                        {formatTime(
                          record.checkIn
                        )}
                      </td>

                      <td>
                        {formatTime(
                          record.checkOut
                        )}
                      </td>

                      <td>

                        {typeof record.workingHours ===
                        "number"
                          ? `${record.workingHours.toFixed(
                              2
                            )} hrs`
                          : "--"}

                      </td>

                      <td>

                        <span
                          className={
                            record.checkOut
                              ? "admin-status completed"
                              : record.checkIn
                              ? "admin-status present"
                              : "admin-status absent"
                          }
                        >

                          {record.checkOut
                            ? "Completed"
                            : record.checkIn
                            ? "Present"
                            : "Absent"}

                        </span>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ==================================================
          LEAVE REQUESTS
      ================================================== */}

      <section className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Leave Requests
            </h2>

            <p>
              Review employee leave applications
            </p>

          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={getLeaves}
          >
            ↻ Refresh
          </button>

        </div>


        {leaves.length === 0 ? (

          <div className="admin-empty">
            No leave requests found.
          </div>

        ) : (

          <div className="leave-admin-list">

            {leaves
              .slice(0, 10)
              .map((leave) => (

                <div
                  className="admin-leave-item"
                  key={leave._id}
                >

                  <div className="admin-leave-icon">
                    📅
                  </div>


                  <div className="admin-leave-details">

                    <strong>
                      {leave.userId?.name ||
                        "Unknown Employee"}
                    </strong>

                    <span>

                      {leave.startDate ||
                        "--"}

                      {" → "}

                      {leave.endDate ||
                        "--"}

                    </span>

                    <small>

                      Reason:{" "}

                      {leave.reason ||
                        "No reason provided"}

                    </small>

                  </div>


                  <div className="admin-leave-actions">

                    <span
                      className={getLeaveStatusClass(
                        leave.status
                      )}
                    >

                      {formatStatus(
                        leave.status
                      )}

                    </span>


                    {(!leave.status ||
                      leave.status ===
                        "pending") && (

                      <div className="leave-buttons">

                        <button
                          type="button"
                          className="approve-btn"
                          onClick={() =>
                            handleApprove(
                              leave._id
                            )
                          }
                        >
                          ✓ Approve
                        </button>


                        <button
                          type="button"
                          className="reject-btn"
                          onClick={() =>
                            handleReject(
                              leave._id
                            )
                          }
                        >
                          ✕ Reject
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              ))}

          </div>

        )}

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="admin-footer">

        © 2026 Attendify · Admin Management Panel

      </footer>

    </div>
  );
}

export default AdminDashboard;