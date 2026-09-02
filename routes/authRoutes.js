const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            department
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            department: department || "",
            role: "employee"
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});


// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});


// ===============================
// GET ALL EMPLOYEES
// ===============================
router.get("/employees", async (req, res) => {
    try {

        const employees = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Employees fetched successfully",
            employees
        });

    } catch (error) {

        console.error("Get employees error:", error);

        res.status(500).json({
            message: "Failed to fetch employees",
            error: error.message
        });
    }
});


// ===============================
// GET SINGLE EMPLOYEE PROFILE
// ===============================
router.get("/employees/:userId", async (req, res) => {
    try {

        const {
            userId
        } = req.params;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee profile",
            user
        });

    } catch (error) {

        console.error("Get employee profile error:", error);

        res.status(500).json({
            message: "Failed to get employee profile",
            error: error.message
        });
    }
});


module.exports = router;