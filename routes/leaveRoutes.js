const express = require("express");
const Leave = require("../models/Leave");

const router = express.Router();


// APPLY FOR LEAVE
router.post("/apply", async (req, res) => {
    try {
        const { userId, startDate, endDate, reason } = req.body;

        const leave = new Leave({
            userId,
            startDate,
            endDate,
            reason
        });

        await leave.save();

        res.status(201).json({
            message: "Leave request submitted successfully",
            leave
        });

    } catch (error) {
        res.status(500).json({
            message: "Leave request failed",
            error: error.message
        });
    }
});


// GET USER LEAVE HISTORY
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const leaves = await Leave.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Leave history",
            leaves
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get leave history",
            error: error.message
        });
    }
});

// GET ALL LEAVE REQUESTS
router.get("/all", async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate("userId", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All leave requests",
            leaves
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get leave requests",
            error: error.message
        });
    }
});


// APPROVE LEAVE
router.put("/approve/:leaveId", async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leave = await Leave.findByIdAndUpdate(
            leaveId,
            { status: "approved" },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            message: "Leave approved successfully",
            leave
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to approve leave",
            error: error.message
        });
    }
});


// REJECT LEAVE
router.put("/reject/:leaveId", async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leave = await Leave.findByIdAndUpdate(
            leaveId,
            { status: "rejected" },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            message: "Leave rejected successfully",
            leave
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reject leave",
            error: error.message
        });
    }
});

module.exports = router;