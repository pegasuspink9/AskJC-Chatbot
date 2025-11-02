import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../prisma/client";

import userRoutes from "./models/User/user.routes";
import queryRoutes from "./models/Query/query.routes";
import sessionRoutes from "./models/ChatbotSession/chatbotSession.routes";
import feedbackRoutes from "./models/Feedback/feedback.routes";
import studentOrgRoutes from "./models/StudentOrg/studentOrg.routes";
import couseRoutes from "./models/Course/course.routes";
import schoolDetailRoutes from "./models/SchoolDetail/schoolDetail.routes";
import departmentRoutes from "./models/Department/department.routes";
import contactRoutes from "./models/Contact/contact.routes";
import schoolOfficialRoutes from "./models/SchoolOfficial/schoolOfficial.routes";
import programRoutes from "./models/Program/program.routes";
import officeRoutes from "./models/Office/office.routes";
import scholarshipRoutes from "./models/Scholarship/scholarship.routes";
import facilitiesRoutes from "./models/OfficeAndFacilities/officeAndFacilities.routes";
import enrollmentRoutes from "./models/Enrollment/enrollment.routes";
import navigationRoutes from "./models/Navigation/navigation.routes";
import devRoutes from "./models/DevInfo/devInfo.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

const cors = require("cors");
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:3000",
      "http://localhost:19006",
      "https://ask-jc-chatbot.vercel.app",
      "https://askjc-chatbot.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "AskJC Backend API is running!" });
});

// Routes
app.use("/dev", devRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use("/navigation", navigationRoutes);
app.use("/school-detail", schoolDetailRoutes);
app.use("/user", userRoutes);
app.use("/query", queryRoutes);
app.use("/session", sessionRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/facility", facilitiesRoutes);
app.use("/scholarship", scholarshipRoutes);
app.use("/office", officeRoutes);
app.use("/student-org", studentOrgRoutes);
app.use("/contact", contactRoutes);
app.use("/course", couseRoutes);
app.use("/department", departmentRoutes);
app.use("/program", programRoutes);
app.use("/school-official", schoolOfficialRoutes);

const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);

    const staleSessions = await prisma.chatbotSession.findMany({
      where: {
        response_time: { lt: cutoff },
      },
    });

    if (staleSessions.length === 0) return;

    for (const session of staleSessions) {
      try {
        await prisma.query.deleteMany({
          where: { chatbot_session_id: session.id },
        });

        await prisma.chatbotSession.deleteMany({
          where: { id: session.id },
        });

        await prisma.user.delete({
          where: { id: session.user_id },
        });

        console.log(
          `Cleanup: removed user ${session.user_id}, their queries, and session ${session.id} due to ${INACTIVITY_THRESHOLD_MS}ms inactivity`
        );
      } catch (innerErr) {
        console.error(`Error cleaning session ${session.id}:`, innerErr);
      }
    }
  } catch (err) {
    console.error("Error running cleanup job:", err);
  }
}, CLEANUP_INTERVAL_MS);

export default app;
