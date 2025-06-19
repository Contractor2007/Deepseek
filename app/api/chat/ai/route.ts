export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

//Initialize OpenAi client with deepseek api key and base url
const opemai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    //Extract chatId and prompt from the requesr body
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    //Find Chat doc in the db based on userid and chatId
    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    //Create a user message prompt
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    //Call the Deepseek api to get chat completion

    const completion = await OpenAI.chat.completion.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true,
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.messages.push(message);
    data.save();

    return NextResponse.json({ sucess: true, data: message });
  } catch (error) {
    return NextResponse.json({ sucess: false, error: error.message });
  }
}
