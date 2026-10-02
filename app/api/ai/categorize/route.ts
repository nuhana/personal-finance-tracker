import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();

    const note = typeof body.note === "string" ? body.note.trim() : "";
    const type = body.type;

    if (!note) {
      return NextResponse.json({ error: "Note is required" }, { status: 400 });
    }

    if (type !== undefined && type !== "EXPENSE" && type !== "INCOME") {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { userId, ...(type ? { type } : {}) },
      select: { id: true, name: true, type: true },
    });

    if (categories.length === 0) {
      return NextResponse.json({ categoryId: null, categoryName: null });
    }

    // Only category names go to the LLM, never database IDs; the chosen name
    // is mapped back to an ID below.
    const categoryNames = Array.from(new Set(categories.map((c) => c.name)));
    const categoryList = categoryNames.map((name) => `- ${name}`).join("\n");

    const prompt = [
      "Pick the category that best fits this personal finance transaction.",
      "Only choose from the categories listed. If none fits, return null for categoryName.",
      "",
      "Categories:",
      categoryList,
      "",
      `Transaction note: ${note}`,
      type ? `Type: ${type}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            categoryName: {
              type: ["string", "null"],
              enum: [...categoryNames, null],
            },
          },
          required: ["categoryName"],
        },
      },
    });

    const parsed = JSON.parse(interaction.output_text ?? "{}");

    // Never trust the model's answer blindly; it must be one of this user's
    const match = categories.find(
      (c) => c.name === parsed.categoryName
    );

    return NextResponse.json({
      categoryId: match?.id ?? null,
      categoryName: match?.name ?? null,
    });
  } catch (error) {
    console.error("❌ Error categorizing transaction:", error);

    if ((error as { status?: number })?.status === 429) {
      return NextResponse.json(
        { error: "AI rate limit reached, try again later" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to categorize transaction" },
      { status: 500 }
    );
  }
}
