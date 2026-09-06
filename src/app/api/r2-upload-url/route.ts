import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_TYPE_PREFIXES = ["image/", "video/"];

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function safeExtension(filename: string) {
  const match = /\.[a-zA-Z0-9]{1,8}$/.exec(filename);
  return match ? match[0].toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  const { filename, contentType, folder } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
  }
  if (!ALLOWED_TYPE_PREFIXES.some((p) => contentType.startsWith(p))) {
    return NextResponse.json({ error: "Only image or video uploads are allowed" }, { status: 400 });
  }

  const safeFolder = folder === "products" ? "products" : "uploads";
  const key = `${safeFolder}/${crypto.randomUUID()}${safeExtension(filename)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client(), command, { expiresIn: 3600 });
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
