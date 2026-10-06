import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AiRateLimitError, generateJson } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();

    const note = typeof body.note === "string" ? body.note.trim() : "";
    // Set when the user picked Income/Expense themselves; the model then only
    // picks a category. Otherwise the model infers the type from the note.
    const userType = body.type;

    if (!note) {
      return NextResponse.json({ error: "Note is required" }, { status: 400 });
    }

    if (
      userType !== undefined &&
      userType !== "EXPENSE" &&
      userType !== "INCOME"
    ) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { userId, ...(userType ? { type: userType } : {}) },
      select: { id: true, name: true, type: true },
    });

    // Nothing for the model to decide.
    if (userType && categories.length === 0) {
      return NextResponse.json({
        type: userType,
        categoryId: null,
        categoryName: null,
      });
    }

    const types: ("INCOME" | "EXPENSE")[] = userType
      ? [userType]
      : ["INCOME", "EXPENSE"];

    // Only category names go to the LLM, never database IDs; the chosen name
    // is mapped back to an ID below.
    const listFor = (type: "INCOME" | "EXPENSE") =>
      categories
        .filter((c) => c.type === type)
        .map((c) => `- ${c.name}`)
        .join("\n") || "(none)";
    const categoryNames = Array.from(new Set(categories.map((c) => c.name)));

    const prompt = [
      "Classify this personal finance transaction.",
      userType
        ? `type: ${userType} (chosen by the user).`
        : "type: INCOME if money came in (salary, refund, gift received...), EXPENSE if money went out.",
      "categoryName: the best fitting category of that same type, chosen only from the lists below. If none fits, return null.",
      ...types.flatMap((type) => ["", `${type} categories:`, listFor(type)]),
      "",
      `Transaction note: ${note}`,
    ].join("\n");

    const parsed = (await generateJson({
      prompt,
      schema: {
        type: "object",
        properties: {
          type: { type: "string", enum: types },
          // An enum of just [null] can be rejected by providers, so when the
          // user has no categories, only allow null.
          categoryName:
            categoryNames.length > 0
              ? { type: ["string", "null"], enum: [...categoryNames, null] }
              : { type: "null" },
        },
        required: ["type", "categoryName"],
      },
    })) as { type?: unknown; categoryName?: unknown };

    if (!types.includes(parsed.type as "INCOME" | "EXPENSE")) {
      throw new Error(`Unexpected type from model: ${parsed.type}`);
    }

    // Never trust the model's answer blindly; it must be one of this user's
    // categories, and of the type the model picked.
    const match = categories.find(
      (c) => c.name === parsed.categoryName && c.type === parsed.type
    );

    return NextResponse.json({
      type: parsed.type,
      categoryId: match?.id ?? null,
      categoryName: match?.name ?? null,
    });
  } catch (error) {
    console.error("❌ Error categorizing transaction:", error);

    if (error instanceof AiRateLimitError) {
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
