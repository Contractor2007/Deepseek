export const maxDuration = 60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Azure/GitHub Model config
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);

    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 1.0,
        top_p: 1.0,
        model: model,
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const message = {
      role: response.body.choices[0].message.role,
      content: response.body.choices[0].message.content,
      timestamp: Date.now()
    };

    data.messages.push(message);
    await data.save();

    return NextResponse.json({ success: true, data: message });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
