export const maxDuration = 60;
import conexport const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
      const { userId } = getAuth(req);

          //Extract chatId and prompt from the request body
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

                                                                                                    // Call the Google Gemini API to get chat completion
                                                                                                        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                                                                                                            const result = await model.generateContent(prompt);
                                                                                                                const response = await result.response;
                                                                                                                    const text = response.text();

                                                                                                                        const message = {
                                                                                                                              role: "assistant",
                                                                                                                                    content: text,
                                                                                                                                          timestamp: Date.now()
                                                                                                                                              };
                                                                                                                                                  
                                                                                                                                                      data.messages.push(message);
                                                                                                                                                          data.save();

                                                                                                                                                              return NextResponse.json({ success: true, data: message });
                                                                                                                                                                } catch (error) {
                                                                                                                                                                    return NextResponse.json({ success: false, error: error.message });
                                                                                                                                                                      }
                                                                                                                                                                      }