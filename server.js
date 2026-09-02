const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());


// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);


// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
    res.send("Employee Attendance API is running!");
});


// ===============================
// MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(process.env.PORT, () => {
            console.log(
                `Server running on http://localhost:${process.env.PORT}`
            );
        });
    })
    .catch((error) => {
        console.log(
            "MongoDB connection failed:",
            error.message
        );
    });