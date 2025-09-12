import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File is not an image" }, { status: 400 })
    }

    // Get the file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Get file type
    const fileType = file.type

    try {
      // Simplest possible processing with Sharp
      // Just resize slightly to trigger processing without complex operations
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
        .toBuffer()

      // Return the processed image
      return new NextResponse(optimizedBuffer, {
        headers: {
          "Content-Type": fileType,
          "Cache-Control": "public, max-age=31536000",
        },
      })
    } catch (sharpError) {
      console.error("Sharp processing error:", sharpError)

      // If Sharp fails, return the original image as fallback
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": fileType,
          "Cache-Control": "public, max-age=31536000",
        },
      })
    }
  } catch (error) {
    console.error("API route error:", error)

    // Return a proper error response
    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
