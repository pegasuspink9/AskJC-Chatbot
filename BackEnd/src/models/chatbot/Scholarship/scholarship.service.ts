import { prisma } from "../../../../prisma/client";
import { extractKeywords } from "../../../../utils/extractKeywords";
import { getDialogflowResponse } from "../../../../helper/diagflow.service";

export async function getScholarshipFaqAnswer(
  faqId: number,
  userMessage: string
) {
  const faq = await prisma.faq.findUnique({
    where: { id: faqId },
    include: { scholarships: true },
  });

  if (!faq) {
    return "Sorry, I couldn't retrieve the necessary information.";
  }

  const msg = userMessage.toLowerCase();

  // Who can I contact for scholarship assistance?
  if (
    msg.includes("contact") ||
    msg.includes("assistance") ||
    msg.includes("help")
  ) {
    return `You can contact the Student Affairs and Services Office (SASO) for scholarship assistance. Please visit their office for more details`;
  }

  if (msg.includes("offered")) {
    // What scholarships are offered?
    if (!faq.scholarships?.length) {
      return "I could not find a list of offered scholarships at this time.";
    }
    return `Here are the scholarships you can apply for:\n\n- ${faq.scholarships
      .map((s) => s.name)
      .join("\n- ")}`;
  }

  // Are there scholarships available for new students?
  if (
    msg.includes("new") ||
    msg.includes("freshman") ||
    msg.includes("first-year")
  ) {
    if (!faq.scholarships?.length) {
      return "I couldn't check for new student scholarships at this moment.";
    }
    const forNewStudents = faq.scholarships
      .filter(
        (s) =>
          s.description?.toLowerCase().includes("incoming students") ||
          s.name?.toLowerCase().includes("graduate discount")
      )
      .map((s) => `- **${s.name}**: ${s.description}`);

    if (forNewStudents.length > 0) {
      return `Yes, there are scholarships available for new students. Based on the data, these include:\n\n${forNewStudents.join(
        "\n\n"
      )}`;
    } else {
      return "Based on the provided data, there is no specific mention of scholarships exclusively for new students. However, new students may be eligible for general scholarships. Please check the eligibility for each one.";
    }
  }
  if (!faq.scholarships?.length) {
    return "Sorry, I couldn’t find information about that scholarship.";
  }

  const specificScholarship = faq.scholarships.find((s) =>
    msg.includes(s.name.toLowerCase())
  );

  //Who can apply for [scholarship name]
  if (specificScholarship) {
    if (msg.includes("eligibility") || msg.includes("who can apply")) {
      return `**${specificScholarship.name}**\n\nEligibility: ${
        specificScholarship.eligibility_criteria ||
        "Eligibility details not available."
      }`;
    }

    //Whar are the requirements needed for [scholarship name]
    if (msg.includes("requirement") || msg.includes("documents")) {
      return `**${specificScholarship.name}**\n\nRequirements: ${
        specificScholarship.required_document || "Requirements not available."
      }`;
    }

    //Tell me more about SJC scholarships
    if (
      msg.includes("about") ||
      msg.includes("information") ||
      msg.includes("detail")
    ) {
      return `**${specificScholarship.name}**\n\n${
        specificScholarship.description || "Description not available."
      }`;
    }
  }

  //Who can apply for scholarships?
  if (msg.includes("eligibility") || msg.includes("who can apply")) {
    return `Here’s who can apply for each scholarship:\n\n${faq.scholarships
      .map(
        (s) =>
          `**${s.name}**\n${
            s.eligibility_criteria || "Eligibility details not available."
          }`
      )
      .join("\n\n")}`;
  }

  //What are the requirements for scholarships?
  if (msg.includes("requirement") || msg.includes("documents")) {
    return `The following documents are required:\n\n${faq.scholarships
      .map(
        (s) =>
          `**${s.name}**\n${
            s.required_document || "Requirements not available."
          }`
      )
      .join("\n\n")}`;
  }

  return (
    faq.answer ||
    "Please visit the Student Affairs and Services Office (SASO) for more details."
  );
}

export const handleChatbotMessage = async (
  userId: number,
  message: string
): Promise<{ answer: string; source: string; queryId: number }> => {
  const keywords = extractKeywords(message);

  const session = await prisma.chatbotSession.upsert({
    where: { user_id: userId },
    update: { response_time: new Date(), total_queries: { increment: 1 } },
    create: { user_id: userId, response_time: new Date(), total_queries: 1 },
  });

  const query = await prisma.query.create({
    data: {
      user_id: userId,
      chatbot_session_id: session.id,
      query_text: message,
      users_data_inputed: keywords,
      created_at: new Date(),
    },
  });

  const dialogflowResponse = await getDialogflowResponse(message);

  if (dialogflowResponse) {
    console.log("Dialogflow returned a response. Sending it back.");
    return {
      answer: dialogflowResponse,
      source: "dialogflow",
      queryId: query.id,
    };
  }

  const faq = await prisma.faq.findFirst({
    where: {
      keywords: { some: { keyword: { in: keywords } } },
    },
    include: { scholarships: true },
  });

  if (faq) {
    if (faq.category === "Scholarship") {
      const answer = await getScholarshipFaqAnswer(faq.id, message);
      return { answer, source: "faq-scholarship", queryId: query.id };
    }
    return {
      answer: faq.answer || "Answer not available.",
      source: "faq",
      queryId: query.id,
    };
  }

  return {
    answer:
      "I'm not sure about that. Would you like me to connect you with an admin?",
    source: "fallback",
    queryId: query.id,
  };
};
