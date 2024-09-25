import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { env } from "./database.service";
import fs from 'node:fs'
import path from "node:path";
import multer from "multer";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: env.GCP_ID,
  credentials: JSON.parse(Buffer.from(env.GCP_SERVICE_ACCOUNT, 'base64').toString('utf-8')),
});


export const upload = multer({storage: multer.diskStorage({filename: function (req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  cb(null, `${uniqueSuffix}.${file.mimetype.split("/")[1]}`)
}}), limits: {fieldSize: 25 * 1024 * 1024}});

// Helper function to upload image to Google Cloud Storage
export async function uploadImageToStorage(
  fileInput: string, // This can be either a file path or a base64 string
  isBase64: boolean = false // Boolean flag to indicate if it's base64
): Promise<string | null> {
  if (!fileInput) return null;

  let buffer: Buffer;
  let mimeType: string;

  if (isBase64) {
    // Handle base64 input
    const matches = fileInput.match(/^data:(.*);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      console.error("Invalid base64 image string");
      return null;
    }

    mimeType = matches[1]; // e.g., "image/png"
    const base64Data = matches[2];
    buffer = Buffer.from(base64Data, "base64");
  } else {
    // Handle file path input
    const filePath = fileInput;
    buffer = fs.readFileSync(filePath); // Read file into buffer
    mimeType = `image/${path.extname(filePath).slice(1)}`; // Derive MIME type from file extension
  }

  // Create a unique file name with extension based on the MIME type
  const extension = mimeType.split("/")[1]; // e.g., "image/png" -> "png"
  const fileName = `${uuidv4()}-${Date.now()}.${extension}`;
  const bucket = storage.bucket(env.GCP_BUCKET);
  const file = bucket.file(fileName);

  return new Promise((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType, // Set MIME type
      },
    });

    stream.on("error", (err) => {
      console.error("Error uploading image: ", err);
      reject(null);
    });

    stream.on("finish", async () => {
      resolve(`https://storage.googleapis.com/${env.GCP_BUCKET}/${fileName}`);
    });

    stream.end(buffer);
  });
}

export async function removeImageFromStorage(fileUrl: string): Promise<boolean> {
    if (!fileUrl) {
      console.error("Invalid file URL");
      return false;
    }
  
    try {
      // Extract the file name from the URL
      const fileName = fileUrl.split("/").pop();
      if (!fileName) {
        console.error("File name extraction failed");
        return false;
      }
  
      const bucket = storage.bucket(env.GCP_BUCKET);
      const file = bucket.file(fileName);
  
      // Delete the file
      await file.delete();
      console.log(`File ${fileName} deleted successfully.`);
      return true;
    } catch (err) {
      console.error("Error deleting file from Google Cloud Storage: ", err);
      return false;
    }
  };

  export async function generateSignedUrl(fileUrl: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: "read",
      expires: Date.now() + (1 * 60 * 1000),
    };
    const fileName = fileUrl.split("/").pop() as string;
    // Get a signed URL for the file
    const [url] = await storage
        .bucket(env.GCP_BUCKET)
        .file(fileName)
        .getSignedUrl(options);
  
    console.log(`The signed url for ${fileName} is ${url}`);
    return url;
  }