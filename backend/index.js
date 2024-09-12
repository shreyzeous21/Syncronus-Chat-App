import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth-routes.js";
import errorMiddleware from "./src/middlewares/error-middleware.js";
import contactsRoutes from "./src/routes/contact-routes.js";
import setupSocket from "./socket.js";
import messageRoutes from "./src/routes/messages-route.js";
import channelRoutes from "./src/routes/channel-routes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 2001;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/channel", channelRoutes);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send(`
    <html">
      <head>
        <title>API Status</title>
        <script>
          function updateTime() {
            const date = new Date();
            const idn = new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'full',
              timeStyle: 'long',
              timeZone: 'Asia/Jakarta',
            }).format(date);
            document.getElementById("timestamp").textContent = idn;
          }
          setInterval(updateTime, 1000);
        </script>
      </head>
      <body style="font-family: Arial, sans-serif; background:#999999; color:#000000; text-align: center; width:100%; height:100vh; display:flex; justify-content:center; align-items:center; overflow:hidden;">
        <h1 ">API is running</h1>
        <p ">Status: <strong>success</strong></p>
        <p ">Timestamp: <strong id="timestamp">${new Date().toISOString()}</strong></p>
        <img src="https://firebasestorage.googleapis.com/v0/b/android-7c309.appspot.com/o/111111212121.png?alt=media&token=1dba2219-a414-4758-b4b6-a0fbb2f1b75f" alt="API Image" style="width:100px; height:100px; margin-top: 20px;">
      </body>
    </html>
  `);
});

const connectDB = async () => {
  try {
    await mongoose.connect(databaseURL);

    console.log("Success connect to DB");
  } catch (error) {
    console.log(error);
  }
};

const server = app.listen(port, () => {
  connectDB();

  console.log("Server is running in port " + port);
});

setupSocket(server);
