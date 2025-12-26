// app/api/chat/ai/route.ts (for App Router)
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const endpoint = process.env.AZURE_INFERENCE_ENDPOINT || "https://models.inference.ai.azure.com";
const apiKey = process.env.AZURE_INFERENCE_KEY; // More standard naming

// Optional: Allowed models whitelist
const allowedModels = [
  "xai/grok-3",
  "openai/gpt-4.1",
  "meta/Llama-4-Scout-17B-16E-Instruct",
  "microsoft/Phi-4",
  "mistral-ai/mistral-medium-2505",
];

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated"
      }, { status: 401 });
    }

    const { chatId, prompt, model } = await req.json();

    if (!prompt || !chatId) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: prompt and chatId"
      }, { status: 400 });
    }

    // Validate model selection or fallback to default
    const selectedModel = allowedModels.includes(model) ? model : "openai/gpt-4.1";

    await connectDB();
    
    // Find and validate chat belongs to user
    const data = await Chat.findOne({ 
      _id: chatId,
      userId: user.id 
    });

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "Chat not found"
      }, { status: 404 });
    }

    // Add user message
    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    data.messages.push(userMessage);
    await data.save(); // Save immediately to preserve user message

    // Prepare messages for AI
    const messagesForModel = [
      { role: "system", content: "You are a helpful assistant." },
      ...data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Initialize AI client
    if (!apiKey) {
      throw new Error("AI inference API key not configured");
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));

    // Get AI response
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messagesForModel,
        temperature: 0.7, // Lowered for more consistent responses
        top_p: 0.9,
        model: selectedModel,
        max_tokens: 1000,
      },
    });

    if (isUnexpected(response)) {
      throw new Error(response.body?.error?.message || "AI request failed");
    }

    // Add AI response
    const aiMessage = {
      role: response.body.choices[0].message?.role || "assistant",
      content: response.body.choices[0].message?.content || "",
      timestamp: new Date(),
    };

    data.messages.push(aiMessage);
    await data.save();

    return NextResponse.json({ 
      success: true, 
      data: aiMessage 
    });

  } catch (error: any) {
    console.error("Chat AI Error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}
