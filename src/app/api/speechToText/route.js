import { NextResponse } from "next/server";
import fs from "fs";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { env } from "../../config/env";

dotenv.config();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const base64Audio = body.audio;
  const audio = Buffer.from(base64Audio, "base64");
  const filePath = "tmp/input.wav";

  try {
    fs.writeFileSync(filePath, audio);
    const readStream = fs.createReadStream(filePath);
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });
    // Remove the file after use
    fs.unlinkSync(filePath);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}
