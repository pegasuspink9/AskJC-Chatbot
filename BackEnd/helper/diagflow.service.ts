import { SessionsClient, protos } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export interface DialogflowResponse {
  intent: string;
  action: string;
  fulfillmentText: string;
  parameters: { [key: string]: any };
}

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
if (!projectId) {
  throw new Error("Dialogflow project ID is not configured.");
}

const sessionClient = new SessionsClient();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const getDialogflowResponse = async (
  userMessage: string
): Promise<DialogflowResponse | null> => {
  const sessionId = uuidv4();
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: "en",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult;

    console.log("======================================================");
    console.log("📡 FULL DIALOGFLOW RAW RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
    console.log("======================================================");

    if (result && result.intent) {
      const parameters = structProtoToJson(result.parameters);

      return {
        intent: result.intent.displayName || "Unknown Intent",
        action: result.action || "",
        fulfillmentText: result.fulfillmentText || "",
        parameters: parameters,
      };
    }

    return null;
  } catch (error) {
    console.error("Dialogflow error:", error);
    throw new Error("Error in Dialogflow API");
  }
};

function structProtoToJson(
  proto: protos.google.protobuf.IStruct | undefined | null
): { [key: string]: any } {
  if (!proto || !proto.fields) {
    return {};
  }

  const json: { [key: string]: any } = {};
  for (const key in proto.fields) {
    if (Object.prototype.hasOwnProperty.call(proto.fields, key)) {
      const value = proto.fields[key];
      if (value.stringValue) {
        json[key] = value.stringValue;
      } else if (value.numberValue) {
        json[key] = value.numberValue;
      } else if (value.listValue) {
        json[key] = value.listValue.values?.map((v) => v.stringValue) || [];
      }
    }
  }
  return json;
}

//a question for a single question about scholarship
export async function fetchScholarshipFromDB(params: any): Promise<string> {
  const scholarshipName = params["scholarship-name"];
  let scholarshipDetail = params["scholarship-detail"];

  if (!scholarshipName || !scholarshipDetail) {
    return "I could not find enough details to answer your question.";
  }

  if (Array.isArray(scholarshipDetail)) {
    scholarshipDetail = scholarshipDetail[0];
  }

  const detailMap: Record<string, keyof import("@prisma/client").Scholarship> =
    {
      category: "category",
      description: "description",
      "offered by": "offeredBy",
      eligibility: "eligibility_criteria",
      "application process": "application_process",
      "required documents": "required_document",
      "award amount": "award_amount",
      "contact office": "contact_office",
      eligibility_criteria: "eligibility_criteria",
    };

  const field = detailMap[scholarshipDetail.toLowerCase()];
  if (!field) {
    return `Sorry, I don’t recognize the detail "${scholarshipDetail}".`;
  }

  try {
    const result = await db.scholarship.findFirst({
      where: { name: scholarshipName },
      select: { [field]: true },
    });

    if (result && result[field]) {
      return String(result[field]);
    } else {
      return `Sorry, I couldn't find ${scholarshipDetail} for ${scholarshipName}.`;
    }
  } catch (err) {
    console.error("Database query error:", err);
    return "There was an error retrieving scholarship details.";
  }
}
