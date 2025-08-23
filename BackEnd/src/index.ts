import express from "express";
import userRoutes from "./models/User/user.routes";
import queryRoutes from "./models/Query/query.routes";
import sessionRoutes from "./models/ChatbotSession/chatbotSession.routes";
import feedbackRoutes from "./models/Feedback/feedback.routes";
import studentOrgRoutes from "./models/StudentOrg/studentOrg.routes";
import couseRoutes from "./models/Course/course.routes";
import faqRoutes from "./models/Faq/faq.routes";
import keywordRoutes from "./models/QuestionKeyword/keyword.routes";
import greetRoutes from "./models/Greeting/greet.routes";
import schoolDetailRoutes from "./models/SchoolDetail/schoolDetail.routes";
import schoolFaqRoutes from "./models/SchoolFaq/schoolFaq.routes";
import departmentRoutes from "./models/Department/department.routes";
import contactRoutes from "./models/Contact/contact.routes";
import schoolOfficialRoutes from "./models/SchoolOfficial/schoolOfficial.routes";
import programRoutes from "./models/Program/program.routes";
import officeRoutes from "./models/Office/office.routes";

const app = express();

app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credential: true,
  })
);

app.use("/faq", faqRoutes);
app.use("/keyword", keywordRoutes);
app.use("/greet", greetRoutes);
app.use("school-detail", schoolDetailRoutes);
app.use("/school-faq", schoolFaqRoutes);

//makes sense na ni ari nga part
app.use("/user", userRoutes);
app.use("/query", queryRoutes);
app.use("/session", sessionRoutes);
app.use("/feedback", feedbackRoutes);

app.use("/office", officeRoutes);
app.use("/student-org", studentOrgRoutes);
app.use("/contact", contactRoutes);
app.use("/course", couseRoutes);
app.use("/department", departmentRoutes);
app.use("/program", programRoutes);
app.use("/school-official", schoolOfficialRoutes); //already added the data

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
