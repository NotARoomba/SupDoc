import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { collections, env } from "./database.service";
import { LanguageCodes } from "../models/util";
import Fact from "../models/fact";
import { getStartAndEndOfDay } from "../routers/facts.router";

export async function refreshFacts() {
  const { startOfDay, endOfDay } = getStartAndEndOfDay();
  const randomFacts = (await collections.facts
    .find({
      timestamp: {
        $gte: startOfDay.getTime(),
        $lte: endOfDay.getTime(),
      },
    })
    .toArray()) as Fact[];
  if (randomFacts.length > 0) return 
  const apiKey = env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'You are an api that is designed to deliver fun facts for a telemedicine app, these facts need to be in 12 languages, "en", "es", "zh", "hi", "pt", "ar", "fr", "de", "ru", "ja", "ko", "it", these facts need to give some kind of general health advice in the form of a fact OR a random fact about the human body or health in general, all requests should be fufilled with the correct number of facts sent back in the response',
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

  const result = await chatSession.sendMessage("give me 5 facts");
  const facts = JSON.parse(result.response.text()).facts;
  //facs from a day before
  await collections.facts.insertMany(facts.map((text: {[locale in LanguageCodes]: string}) => ({text, likes: [], dislikes: [], timestamp: new Date(new Date().toLocaleDateString()).getTime()} as Fact)))
  // websocket to tell the doctors to update their facts
}
