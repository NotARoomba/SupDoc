import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { env } from "./database.service";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: env.GCP_ID,
  credentials: JSON.parse(Buffer.from(env.GCP_SERVICE_ACCOUNT, 'base64').toString('utf-8')),
});

// Helper function to upload image to Google Cloud Storage
export async function uploadImageToStorage(
  base64Image: string,
): Promise<string | null> {
  if (!base64Image) return null;

  // Extract the MIME type and base64 string
  const matches = base64Image.match(/^data:(.*);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    console.error("Invalid base64 image string");
    return null;
  }

  const mimeType = matches[1]; // e.g., "image/png"
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Create a unique file name with extension based on the MIME type
  const extension = mimeType.split("/")[1]; // e.g., "image/png" -> "png"
  const fileName = `${uuidv4()}-${Date.now()}.${extension}`;
  console.log(fileName)
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
};

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

  export async function generateSignedUrl(fileName: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
  
    // Get a signed URL for the file
    const [url] = await storage
        .bucket(env.GCP_BUCKET)
        .file(fileName)
        .getSignedUrl(options);
  
    console.log(`The signed url for ${fileName} is ${url}`);
    return url;
  }