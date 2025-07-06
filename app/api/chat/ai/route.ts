// pages/api/chat/ai.ts (or wherever your API is)

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";

// Optional: Allowed models whitelist
const allowedModels = [
  "xai/grok-3",
  "openai/gpt-4.1",
  "meta/Llama-4-Scout-17B-16E-Instruct",
  "microsoft/Phi-4",
  "mistral-ai/mistral-medium-2505",
];

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt, model } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate model selection or fallback to default
    const selectedModel = allowedModels.includes(model) ? model : "openai/gpt-4.1";

    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      });
    }

    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    data.messages.push(userMessage);

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const messagesForModel = [
      { role: "system", content: "You are a helpful assistant." },
      ...data.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await client.path("/chat/completions").post({
      body: {
        messages: messagesForModel,
        temperature: 1.0,
        top_p: 1.0,
        model: selectedModel,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const aiMessage = {
      role: response.body.choices[0].message.role,
      content: response.body.choices[0].message.content,
      timestamp: Date.now(),
    };

    data.messages.push(aiMessage);
    await data.save();

    return NextResponse.json({ success: true, data: aiMessage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
