import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface ConversationTurn {
    id: string;
    agent: "Humor AI" | "Serious AI";
    text: string;
    timestamp: number;
}

/**
 * Initiates an AI conversation on a given topic by prompting Gemini for an opening statement.
 */
export async function generateOpeningStatement(topic: string, agent: "Humor AI" | "Serious AI"): Promise<string> {
    const persona = agent === "Humor AI"
        ? "You are a highly humorous, sarcastic, and witty AI. You joke around and find the funny side of everything."
        : "You are a very serious, analytical, and logical AI. You focus on facts, consequences, and deep philosophical or practical implications.";

    const promptText = `
    ${persona}
    You are starting a talk show debate. The topic is: "${topic}".
    Please provide an opening statement for the debate directly addressing the topic. Keep it under 3 sentences.
  `;

    try {
        const result = await model.generateContent(promptText);
        const response = await result.response;
        return response.text() || "Could not generate response.";
    } catch (error) {
        console.error("Error generating opening statement:", error);
        return "Error generating response.";
    }
}

/**
 * Generates the next response in the conversation based on the previous message.
 */
export async function generateResponse(topic: string, currentAgent: "Humor AI" | "Serious AI", previousMessage: string): Promise<string> {
    const persona = currentAgent === "Humor AI"
        ? "You are a highly humorous, sarcastic, and witty AI. You joke around and find the funny side of everything. You often poke fun at your serious counterpart."
        : "You are a very serious, analytical, and logical AI. You focus on facts and logic. You often find your humorous counterpart annoying or irrelevant.";

    const promptText = `
    ${persona}
    You are in a talk show debate about "${topic}".
    The other AI just said: "${previousMessage}"
    Provide a direct response to their statement, maintaining your persona. Keep it under 3 sentences.
  `;

    try {
        const result = await model.generateContent(promptText);
        const response = await result.response;
        return response.text() || "Could not generate response.";
    } catch (error) {
        console.error("Error generating response:", error);
        return "Error generating response.";
    }
}
