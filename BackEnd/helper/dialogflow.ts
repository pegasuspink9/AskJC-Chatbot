import { SessionsClient, protos } from "@google-cloud/dialogflow";

export interface DialogflowResponse {
  intent: string;
  action: string;
  fulfillmentText: string;
  parameters: { [key: string]: any };
  confidence: number;
}
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
if (!projectId) {
  throw new Error("Dialogflow project ID is not configured.");
}

const sessionClient = new SessionsClient();

export const getDialogflowResponse = async (
  userMessage: string,
  sessionPath: string,
  conversationHistory: string[] = []
): Promise<DialogflowResponse | null> => {
  const request: any = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: "en-US",
      },
    },
  };

  if (conversationHistory.length > 0) {
    const currentSessionIdForContext = sessionPath.split("/").pop();

    request.queryParams = {
      contexts: conversationHistory.map((msg, index) => ({
        name: `projects/${projectId}/agent/sessions/${currentSessionIdForContext}/contexts/history_context_${index}`, // Use currentSessionIdForContext
        lifespanCount: 1,
        parameters: {
          message: { stringValue: msg },
        },
      })),
    };
  }

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult;

    console.log("📡 FULL DIALOGFLOW RAW RESPONSE:");
    console.log(JSON.stringify(result, null, 2));

    if (result && result.intent) {
      const parameters = structProtoToJson(result.parameters);

      return {
        intent: result.intent.displayName || "Unknown Intent",
        action: result.action || "",
        fulfillmentText: result.fulfillmentText || "",
        parameters,
        confidence: result.intentDetectionConfidence || 0,
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
        json[key] =
          value.listValue.values
            ?.map((v) => {
              if (v.stringValue) return v.stringValue;
              if (v.numberValue) return v.numberValue;
              if (v.boolValue !== undefined) return v.boolValue;
              return null;
            })
            .filter((v) => v !== null) || [];
      } else if (value.boolValue !== undefined) {
        json[key] = value.boolValue;
      } else if (value.structValue) {
        json[key] = structProtoToJson(value.structValue);
      }
    }
  }
  return json;
}
