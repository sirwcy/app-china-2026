import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const mediaType = validTypes.includes(file.type)
    ? (file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
    : "image/jpeg";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Extract only the text visible in this image. Return just the raw text with no explanation, no quotes, no extra formatting. If it contains Chinese characters, preserve them exactly.",
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";

  return NextResponse.json({ text });
}
