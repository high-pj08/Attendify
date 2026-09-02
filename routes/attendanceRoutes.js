const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();


// CHECK-IN
router.post("/check-in", async (req, res) => {
    try {
        const { userId } = req.body;

        const today = new Date().toISOString().split("T")[0];

        let attendance = await Attendance.findOne({
            userId,
            date: today
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({
                message: "Already checked in today"
            });
        }

        if (!attendance) {
            attendance = new Attendance({
                userId,
                date: today,
                checkIn: new Date()
            });
        } else {
            attendance.checkIn = new Date();
        }

        await attendance.save();

        res.status(200).json({
            message: "Check-in successful",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Check-in failed",
            error: error.message
        });
    }
});


// CHECK-OUT
router.post("/check-out", async (req, res) => {
    try {
        const { userId } = req.body;

        const today = new Date().toISOString().split("T")[0];

        const attendance = await Attendance.findOne({
            userId,
            date: today
        });

        if (!attendance) {
            return res.status(400).json({
                message: "Please check in first"
            });
        }

        if (!attendance.checkIn) {
            return res.status(400).json({
                message: "Please check in first"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                message: "Already checked out today"
            });
        }

        attendance.checkOut = new Date();

const timeDifference =
    attendance.checkOut - attendance.checkIn;

attendance.workingHours =
    timeDifference / (1000 * 60 * 60);

await attendance.save();
        res.status(200).json({
            message: "Check-out successful",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Check-out failed",
            error: error.message
        });
    }
});

// GET ATTENDANCE HISTORY
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const attendance = await Attendance.find({ userId })
            .sort({ date: -1 });

        res.status(200).json({
            message: "Attendance history",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get attendance history",
            error: error.message
        });
    }
});
// GET ALL EMPLOYEE ATTENDANCE
router.get("/all", async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("userId", "name email department role")
            .sort({ date: -1 });

        res.status(200).json({
            message: "All attendance records",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attendance",
            error: error.message
        });
    }
});
// MONTHLY ATTENDANCE SUMMARY
router.get("/summary/:userId/:year/:month", async (req, res) => {
    try {
        const { userId, year, month } = req.params;

        const monthString = String(month).padStart(2, "0");

        const startDate = `${year}-${monthString}-01`;

        const endDate = new Date(
            Number(year),
            Number(month),
            0
        );

        const lastDay = String(endDate.getDate()).padStart(2, "0");

        const endDateString = `${year}-${monthString}-${lastDay}`;

        const attendance = await Attendance.find({
            userId,
            date: {
                $gte: startDate,
                $lte: endDateString
            }
        });

        const presentDays = attendance.filter(
            record => record.checkIn
        ).length;

        const completedDays = attendance.filter(
            record => record.checkIn && record.checkOut
        ).length;

        const totalWorkingHours = attendance.reduce(
            (total, record) => total + (record.workingHours || 0),
            0
        );

        res.status(200).json({
            message: "Monthly attendance summary",
            summary: {
                year: Number(year),
                month: Number(month),
                presentDays,
                completedDays,
                totalWorkingHours: Number(totalWorkingHours.toFixed(2))
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate summary",
            error: error.message
        });
    }
});

// GET TODAY'S ATTENDANCE
router.get("/today/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const today = new Date().toISOString().split("T")[0];

        const attendance = await Attendance.findOne({
            userId,
            date: today
        });

        if (!attendance) {
            return res.status(200).json({
                message: "No attendance record for today",
                attendance: null
            });
        }

        res.status(200).json({
            message: "Today's attendance",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get today's attendance",
            error: error.message
        });
    }
});
module.exports = router;