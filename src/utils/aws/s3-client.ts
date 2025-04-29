
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Initialize the S3 client
// These credentials should be securely stored in environment variables
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Function to list objects in an S3 bucket
export const listS3Objects = async (bucketName: string, prefix: string = "") => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    console.log(`Successfully listed objects from ${bucketName}:`, response.Contents);
    return response.Contents;
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    throw error;
  }
};

// Function to get a specific object from an S3 bucket
export const getS3Object = async (bucketName: string, key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    // Convert the response stream to a string or blob as needed
    if (response.Body) {
      const bodyContents = await response.Body.transformToString();
      console.log(`Successfully retrieved ${key} from ${bucketName}`);
      return bodyContents;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting S3 object ${key}:`, error);
    throw error;
  }
};
