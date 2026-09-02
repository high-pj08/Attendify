import "./Pages.css";
import API from "../api";
import { useEffect, useState } from "react";

function Attendance() {

  // Get currently logged-in user's ID
  const userId = localStorage.getItem("userId");

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET ATTENDANCE HISTORY
  // ======================================================

  const getAttendance = async () => {

    if (!userId) {
      console.error("User ID not found");
      setAttendance([]);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const response = await API.get(
        `/attendance/history/${userId}`
      );

      console.log(
        "Attendance response:",
        response.data
      );

      setAttendance(
        response.data.attendance || []
      );

    } catch (error) {

      console.error(
        "Failed to get attendance:",
        error.response?.data ||
        error.message
      );

      setAttendance([]);

    } finally {

      setLoading(false);

    }
  };

  // ======================================================
  // LOAD ATTENDANCE
  // ======================================================

  useEffect(() => {

    getAttendance();

  }, [userId]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalDays = attendance.filter(
    (record) =>
      record.checkIn
  ).length;

  const completedDays = attendance.filter(
    (record) =>
      record.checkIn &&
      record.checkOut
  ).length;

  const totalHours = attendance.reduce(
    (total, record) =>
      total +
      (Number(record.workingHours) || 0),
    0
  );

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (time) => {

    if (!time) {
      return "--";
    }

    return new Date(
      time
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  // ======================================================
  // FORMAT STATUS
  // ======================================================

  const getStatus = (record) => {

    if (record.checkOut) {
      return "Completed";
    }

    if (record.checkIn) {
      return "Present";
    }

    return "Absent";
  };

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
            Attendance
          </h1>

          <p>
            View your attendance records and
            working hours.
          </p>

        </div>


        <button
          className="refresh-btn"
          onClick={getAttendance}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>

      </div>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="page-card">

        <h2>
          Attendance Overview
        </h2>

        <div className="info-grid">

          {/* PRESENT DAYS */}

          <div>

            <span>
              Present Days
            </span>

            <strong>
              {totalDays}
            </strong>

          </div>


          {/* COMPLETED DAYS */}

          <div>

            <span>
              Completed Days
            </span>

            <strong>
              {completedDays}
            </strong>

          </div>


          {/* TOTAL HOURS */}

          <div>

            <span>
              Total Working Hours
            </span>

            <strong>
              {totalHours.toFixed(2)} hrs
            </strong>

          </div>

        </div>

      </div>


      {/* ==================================================
          ATTENDANCE HISTORY
      ================================================== */}

      <div className="page-card">

        <h2>
          Attendance History
        </h2>

        <p>
          Your previous attendance records
        </p>


        {loading ? (

          <div className="admin-loading">
            Loading attendance...
          </div>

        ) : attendance.length === 0 ? (

          <div className="admin-empty">
            No attendance records found.
          </div>

        ) : (

          <div className="simple-table">

            {/* TABLE HEADER */}

            <div className="table-row table-heading">

              <span>
                Date
              </span>

              <span>
                Check In
              </span>

              <span>
                Check Out
              </span>

              <span>
                Working Hours
              </span>

              <span>
                Status
              </span>

            </div>


            {/* ATTENDANCE RECORDS */}

            {attendance.map(
              (record) => (

                <div
                  className="table-row"
                  key={record._id}
                >

                  {/* DATE */}

                  <span>
                    {record.date || "--"}
                  </span>


                  {/* CHECK IN */}

                  <span>
                    {formatTime(
                      record.checkIn
                    )}
                  </span>


                  {/* CHECK OUT */}

                  <span>
                    {formatTime(
                      record.checkOut
                    )}
                  </span>


                  {/* WORKING HOURS */}

                  <span>

                    {typeof record.workingHours ===
                    "number"

                      ? `${record.workingHours.toFixed(
                          2
                        )} hrs`

                      : record.workingHours

                      ? `${Number(
                          record.workingHours
                        ).toFixed(2)} hrs`

                      : "--"}

                  </span>


                  {/* STATUS */}

                  <span
                    className={
                      record.checkOut
                        ? "status-approved"
                        : record.checkIn
                        ? "status-present"
                        : ""
                    }
                  >

                    {getStatus(record)}

                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );
}

export default Attendance;