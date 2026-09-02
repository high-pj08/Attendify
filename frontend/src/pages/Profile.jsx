import "./Pages.css";
import API from "../api";
import { useEffect, useState } from "react";

function Profile() {

  // Get logged-in user ID
  const userId = localStorage.getItem("userId");

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET PROFILE
  // ======================================================

  const getProfile = async () => {

    if (!userId) {
      console.error("User ID not found");
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const response = await API.get(
        `/auth/employees/${userId}`
      );

      console.log(
        "Profile response:",
        response.data
      );

      const user =
        response.data.user ||
        response.data.employee ||
        response.data;

      setEmployee(user);

    } catch (error) {

      console.error(
        "Failed to get profile:",
        error.response?.data ||
        error.message
      );

      setEmployee(null);

    } finally {

      setLoading(false);

    }
  };

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {

    getProfile();

  }, [userId]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (
      <div className="page-container">

        <div className="page-header">

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              View your employee information.
            </p>
          </div>

        </div>

        <div className="profile-page-card">

          <h2>
            Loading profile...
          </h2>

        </div>

      </div>
    );
  }

  // ======================================================
  // PROFILE NOT FOUND
  // ======================================================

  if (!employee) {

    return (
      <div className="page-container">

        <div className="page-header">

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              View your employee information.
            </p>
          </div>

        </div>

        <div className="profile-page-card">

          <div className="profile-page-avatar">
            ?
          </div>

          <h2>
            Profile not found
          </h2>

          <p>
            Unable to load your employee information.
          </p>

          <button
            className="refresh-btn"
            onClick={getProfile}
          >
            ↻ Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // EMPLOYEE DATA
  // ======================================================

  const name =
    employee.name || "Employee";

  const initial =
    name
      .charAt(0)
      .toUpperCase();

  const role =
    employee.role === "hr"
      ? "HR Administrator"
      : "Software Developer";

  const department =
    employee.department ||
    "Not assigned";

  const email =
    employee.email ||
    "No email";

  const employeeId =
    employee._id
      ? `EMP-${employee._id
          .slice(-3)
          .toUpperCase()}`
      : "N/A";

  const joinedDate =
    employee.createdAt
      ? new Date(
          employee.createdAt
        ).toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric"
          }
        )
      : "N/A";

  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="page-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="page-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            View your employee information.
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={getProfile}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ==================================================
          PROFILE CARD
      ================================================== */}

      <div className="profile-page-card">

        {/* AVATAR */}

        <div className="profile-page-avatar">
          {initial}
        </div>


        {/* NAME */}

        <h2>
          {name}
        </h2>


        {/* POSITION */}

        <p>
          {role}
        </p>


        {/* DETAILS */}

        <div className="profile-details">

          {/* EMPLOYEE ID */}

          <div>

            <span>
              Employee ID
            </span>

            <strong>
              {employeeId}
            </strong>

          </div>


          {/* EMAIL */}

          <div>

            <span>
              Email
            </span>

            <strong>
              {email}
            </strong>

          </div>


          {/* DEPARTMENT */}

          <div>

            <span>
              Department
            </span>

            <strong>
              {department}
            </strong>

          </div>


          {/* POSITION */}

          <div>

            <span>
              Position
            </span>

            <strong>
              {role}
            </strong>

          </div>


          {/* JOINED */}

          <div>

            <span>
              Joined
            </span>

            <strong>
              {joinedDate}
            </strong>

          </div>


          {/* ROLE */}

          <div>

            <span>
              Role
            </span>

            <strong>
              {employee.role === "hr"
                ? "HR Administrator"
                : "Employee"}
            </strong>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Profile;