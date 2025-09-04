import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
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
import enrollmentAndNavigationRoutes from "./models/EnrollmentAndNavigation/enrollmentAndEnrollment.routes";

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
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//makes sense na ni ari nga part
app.use("/enrollment", enrollmentAndNavigationRoutes);
app.use("/school-detail", schoolDetailRoutes);
app.use("/user", userRoutes);
app.use("/query", queryRoutes);
app.use("/session", sessionRoutes);
app.use("/feedback", feedbackRoutes);

app.use("/facility", facilitiesRoutes);
app.use("/scholarship", scholarshipRoutes); //complete data
app.use("/office", officeRoutes);
app.use("/student-org", studentOrgRoutes);
app.use("/contact", contactRoutes);
app.use("/course", couseRoutes);
app.use("/department", departmentRoutes);
app.use("/program", programRoutes);
app.use("/school-official", schoolOfficialRoutes); //complete data

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
