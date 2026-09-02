import "./Pages.css";
import API from "../api";
import { useEffect, useState } from "react";

function Leave() {

  // Get logged-in user's ID
  const userId = localStorage.getItem("userId");

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // ======================================================
  // GET LEAVE HISTORY
  // ======================================================

  const getLeaves = async () => {

    if (!userId) {
      console.error("User ID not found");
      setLeaves([]);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const response = await API.get(
        `/leave/history/${userId}`
      );

      console.log(
        "Leave response:",
        response.data
      );

      setLeaves(
        response.data.leaves || []
      );

    } catch (error) {

      console.error(
        "Failed to get leave history:",
        error.response?.data || error.message
      );

      setLeaves([]);

    } finally {

      setLoading(false);

    }
  };

  // ======================================================
  // LOAD LEAVES
  // ======================================================

  useEffect(() => {

    getLeaves();

  }, [userId]);

  // ======================================================
  // APPLY FOR LEAVE
  // ======================================================

  const handleApplyLeave = async (e) => {

    e.preventDefault();

    if (!userId) {
      alert("User not logged in");
      return;
    }

    if (
      !startDate ||
      !endDate ||
      !reason.trim()
    ) {

      alert(
        "Please fill all leave details"
      );

      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {

      alert(
        "End date cannot be before start date"
      );

      return;
    }

    try {

      setSubmitting(true);

      const response = await API.post(
        "/leave/apply",
        {
          userId,
          startDate,
          endDate,
          reason: reason.trim()
        }
      );

      alert(
        response.data.message ||
        "Leave request submitted successfully"
      );

      // Clear form
      setStartDate("");
      setEndDate("");
      setReason("");

      setShowForm(false);

      // Refresh leave history
      await getLeaves();

    } catch (error) {

      console.error(
        "Leave application error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to apply for leave"
      );

    } finally {

      setSubmitting(false);

    }
  };

  // ======================================================
  // SUMMARY
  // ======================================================

  const approvedLeaves = leaves.filter(
    (leave) =>
      leave.status === "approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) =>
      !leave.status ||
      leave.status === "pending"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) =>
      leave.status === "rejected"
  ).length;

  // ======================================================
  // FORMAT STATUS
  // ======================================================

  const formatStatus = (status) => {

    if (status === "approved") {
      return "Approved";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Pending";
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {

    if (!date) {
      return "--";
    }

    const parts = date.split("-");

    if (parts.length === 3) {

      return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      ).toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
    }

    return date;
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
            Leave Management
          </h1>

          <p>
            View and track your leave requests.
          </p>

        </div>

        <div>

          <button
            className="refresh-btn"
            onClick={getLeaves}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "↻ Refresh"}
          </button>

        </div>

      </div>


      {/* ==================================================
          LEAVE SUMMARY
      ================================================== */}

      <div className="page-card">

        <h2>
          Leave Overview
        </h2>

        <div className="info-grid">

          <div>

            <span>
              Leave Balance
            </span>

            <strong>
              12 Days
            </strong>

          </div>


          <div>

            <span>
              Approved
            </span>

            <strong>
              {approvedLeaves}
            </strong>

          </div>


          <div>

            <span>
              Pending
            </span>

            <strong>
              {pendingLeaves}
            </strong>

          </div>


          <div>

            <span>
              Rejected
            </span>

            <strong>
              {rejectedLeaves}
            </strong>

          </div>

        </div>

      </div>


      {/* ==================================================
          APPLY LEAVE
      ================================================== */}

      <div className="page-card">

        <div className="page-card-header">

          <div>

            <h2>
              Apply for Leave
            </h2>

            <p>
              Submit a new leave request
            </p>

          </div>

          {!showForm && (

            <button
              className="apply-leave"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Apply for Leave
            </button>

          )}

        </div>


        {showForm && (

          <form
            className="leave-form"
            onSubmit={handleApplyLeave}
          >

            {/* START DATE */}

            <label>
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              required
            />


            {/* END DATE */}

            <label>
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              required
            />


            {/* REASON */}

            <label>
              Reason
            </label>

            <textarea
              placeholder="Enter reason for leave"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              required
            />


            {/* BUTTONS */}

            <div className="leave-form-buttons">

              <button
                type="button"
                onClick={() => {

                  setShowForm(false);
                  setStartDate("");
                  setEndDate("");
                  setReason("");

                }}
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Leave"}
              </button>

            </div>

          </form>

        )}

      </div>


      {/* ==================================================
          LEAVE HISTORY
      ================================================== */}

      <div className="page-card">

        <h2>
          My Leave Requests
        </h2>

        <p>
          Your previous leave applications
        </p>


        {loading ? (

          <div className="admin-loading">
            Loading leave requests...
          </div>

        ) : leaves.length === 0 ? (

          <div className="admin-empty">
            No leave requests found.
          </div>

        ) : (

          <div className="simple-table">

            {/* TABLE HEADER */}

            <div className="table-row table-heading">

              <span>
                Dates
              </span>

              <span>
                Reason
              </span>

              <span>
                Status
              </span>

              <span>
                Result
              </span>

            </div>


            {/* LEAVE DATA */}

            {leaves.map(
              (leave) => (

                <div
                  className="table-row"
                  key={leave._id}
                >

                  {/* DATES */}

                  <span>

                    {formatDate(
                      leave.startDate
                    )}

                    {" → "}

                    {formatDate(
                      leave.endDate
                    )}

                  </span>


                  {/* REASON */}

                  <span>

                    {leave.reason ||
                      "No reason provided"}

                  </span>


                  {/* STATUS */}

                  <span
                    className={
                      leave.status ===
                      "approved"
                        ? "status-approved"
                        : leave.status ===
                          "rejected"
                        ? "status-rejected"
                        : "status-pending"
                    }
                  >

                    {formatStatus(
                      leave.status
                    )}

                  </span>


                  {/* RESULT */}

                  <span>

                    {leave.status ===
                    "approved"

                      ? "✓ Approved"

                      : leave.status ===
                        "rejected"

                      ? "✕ Rejected"

                      : "Waiting for approval"}

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

export default Leave;