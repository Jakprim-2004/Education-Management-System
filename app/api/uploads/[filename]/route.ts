import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    let contentType = "image/jpeg";
    if (filename.endsWith(".png")) contentType = "image/png";
    else if (filename.endsWith(".gif")) contentType = "image/gif";
    else if (filename.endsWith(".webp")) contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });

  } catch (error) {
    console.error("Serve Image Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
