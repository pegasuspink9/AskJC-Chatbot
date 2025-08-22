import express from "express";
import userRoutes from "./models/User/user.routes";
import queryRoutes from "./models/Query/query.routes";
import sessionRoutes from "./models/ChatbotSession/chatbotSession.routes";
import feedbackRoutes from "./models/Feedback/feedback.routes";
import teacherRoutes from "./models/Teacher/teacher.routes";
import couseRoutes from "./models/Course/course.routes";
import faqRoutes from "./models/Faq/faq.routes";
import keywordRoutes from "./models/QuestionKeyword/keyword.routes";
import greetRoutes from "./models/Greeting/greet.routes";
import schoolDetailRoutes from "./models/SchoolDetail/schoolDetail.routes";
import schoolFaqRoutes from "./models/SchoolFaq/schoolFaq.routes";

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

app.use("/user", userRoutes);

app.use("/query", queryRoutes);
app.use("/session", sessionRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/teacher", teacherRoutes);
app.use("/course", couseRoutes);
app.use("/faq", faqRoutes);
app.use("/keyword", keywordRoutes);
app.use("/greet", greetRoutes);
app.use("school-detail", schoolDetailRoutes);
app.use("/school-faq", schoolFaqRoutes);

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
