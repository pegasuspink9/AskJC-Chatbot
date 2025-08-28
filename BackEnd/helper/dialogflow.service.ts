import { SessionsClient, protos } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

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
      } else if (value.structValue) {
        json[key] = structProtoToJson(value.structValue);
      } else if (value.boolValue !== undefined) {
        json[key] = value.boolValue;
      }
    }
  }
  return json;
}

//attempting to commit again