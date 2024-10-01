import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { env } from "./database.service";

export async function refreshFacts() {
  const apiKey = env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'You are an api that is designed to deliver fun facts for a telemedicine app, these facts need to be in 12 languages, "en", "es", "zh", "hi", "pt", "ar", "fr", "de", "ru", "ja", "ko", "it", these facts need to give some kind of general health advice in the form of a fact',
  });

  const generationConfig = {
    temperature: 1.55,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        facts: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              en: {
                type: SchemaType.STRING,
              },
              es: {
                type: SchemaType.STRING,
              },
              zh: {
                type: SchemaType.STRING,
              },
              hi: {
                type: SchemaType.STRING,
              },
              pt: {
                type: SchemaType.STRING,
              },
              ar: {
                type: SchemaType.STRING,
              },
              fr: {
                type: SchemaType.STRING,
              },
              de: {
                type: SchemaType.STRING,
              },
              ru: {
                type: SchemaType.STRING,
              },
              ja: {
                type: SchemaType.STRING,
              },
              ko: {
                type: SchemaType.STRING,
              },
              it: {
                type: SchemaType.STRING,
              },
            },
            required: [
              "en",
              "es",
              "zh",
              "hi",
              "pt",
              "ar",
              "fr",
              "de",
              "ru",
              "ja",
              "ko",
              "it",
            ],
          },
        },
      },
      required: ["facts"],
    },
  };
  const chatSession = model.startChat({
    generationConfig,
  });

  const result = await chatSession.sendMessage("give me 10 facts");
  console.log(JSON.parse(result.response.text()));
}
