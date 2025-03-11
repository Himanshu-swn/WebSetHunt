const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const clientIdentifier = require("./middlewares/clientIdentifier");
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  // allowedHeaders: ["Content-Type", "Authorization"],
};

const leaderRoutes = require("./routes/LeaderRoutes");
// const quesRoutes = require("./routes/QuesRoutes");
const quizRoutes = require("./routes/QuizRoutes");
const userRoutes = require("./routes/UserRoutes");
const connectToMongo = require("./connectDB");

const app = express();

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log("Database connected successfully");
//   })
//   .catch((error) => {
//     console.log(error.message);
//   });

// Middleware
app.use(connectToMongo);
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(clientIdentifier);
// app.use("/api/auth/login", clientLimiter);
// Routes
app.use("/api/leaderboard", leaderRoutes);
app.use("/api/dashboard", quizRoutes);
// app.use("/api/que", quesRoutes);
app.use("/api/auth", userRoutes);

app.listen(port, () => {
  console.log(`App is running on the port ${port}`);
});

module.exports = app;
