import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess, sendError } from "../../utils/response";
import { env } from "../../config/env";

const router = Router();

const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().uuid().optional(),
  context: z.enum(["academic", "general", "doubt"]).default("academic"),
});

const SYSTEM_PROMPT = `You are **D-Chemistry AI** — an expert chemistry tutor for Indian students preparing for JEE, NEET, ISC, and ICSE exams.

Your capabilities:
1. **Academic Questions**: Solve and explain chemistry problems (Physical, Organic, Inorganic) with step-by-step solutions. Use LaTeX for formulas when appropriate.
2. **Concept Explanations**: Break down complex concepts into simple, clear explanations with real-world analogies.
3. **Exam Strategy**: Provide exam-specific tips for JEE Main, JEE Advanced, NEET, ISC, and ICSE chemistry.
4. **D-Chemistry Platform Help**: Answer questions about courses, batches, tests, live classes, and how to use the platform.
5. **Motivation**: Encourage students and help them overcome academic challenges.

Rules:
- Always be encouraging and supportive
- Use simple English; if the student writes in Bengali, respond in Bengali
- For numerical problems, show complete working with proper units
- Reference specific JEE/NEET patterns when relevant
- If unsure, say so honestly and suggest the student ask their teacher via the "Ask a Doubt" feature
- Keep responses concise but thorough
- Format chemical equations properly
- Use bullet points and numbered steps for clarity

You are part of D-Chemistry — Institute of Chemistry by Debajyoti Haldar.`;

// POST /chat/message — send message to AI chatbot
router.post(
  "/message",
  authenticate,
  validate(chatMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, conversationId, context } = req.body;
      const userId = req.user!.id;

      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        const conversation = await prisma.chatConversation.create({
          data: {
            userId,
            title: message.substring(0, 100),
            context,
          },
        });
        convId = conversation.id;
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: "user",
          content: message,
        },
      });

      // Get conversation history (last 20 messages for context)
      const history = await prisma.chatMessage.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: "asc" },
        take: 20,
      });

      // Build messages for Gemini API
      const geminiContents = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Call Gemini API
      const aiResponse = await callGeminiAPI(geminiContents);

      // Save AI response
      const savedResponse = await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: "assistant",
          content: aiResponse,
        },
      });

      sendSuccess(res, {
        conversationId: convId,
        message: savedResponse,
        response: aiResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /chat/conversations — list user's conversations
router.get(
  "/conversations",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await prisma.chatConversation.findMany({
        where: { userId: req.user!.id },
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          _count: { select: { messages: true } },
        },
      });

      sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }
);

// GET /chat/conversations/:id — get conversation with messages
router.get(
  "/conversations/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await prisma.chatConversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation) {
        sendError(res, "Conversation not found", 404);
        return;
      }

      sendSuccess(res, conversation);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /chat/conversations/:id — delete conversation
router.delete(
  "/conversations/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.chatConversation.deleteMany({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
      });
      sendSuccess(res, null, "Conversation deleted");
    } catch (error) {
      next(error);
    }
  }
);

// ── Gemini API Integration ──────────────────────────────────

async function callGeminiAPI(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    return "I'm currently offline. Please try again later or use the **Ask a Doubt** feature to get help from your teacher. 🧪";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.9,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return "I'm having trouble connecting right now. Please try again in a moment! 🔄";
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? "I couldn't generate a response. Please try rephrasing your question! 🤔";
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "I'm experiencing technical difficulties. Please try again later or ask your teacher directly! 🔧";
  }
}

export { router as chatRoutes };
