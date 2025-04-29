
import { toast } from "@/hooks/use-toast";
import { listS3Objects, getS3Object } from "./s3-client";

// Configure these values based on your S3 setup
const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME || "patient-data-bucket";
const PREFIX = "reports/";

// Store the timer ID so we can clear it if needed
let fetchTimerId: number | null = null;

// Add status tracking
let lastFetchTime: Date | null = null;
let currentlyFetching = false;
let lastFetchObjectCount = 0;
let lastFetchError: string | null = null;

// Main function to fetch data from S3
export const fetchDataFromS3 = async () => {
  try {
    console.log("Fetching data from S3...");
    currentlyFetching = true;
    
    // List all objects in the specified bucket with prefix
    const objects = await listS3Objects(BUCKET_NAME, PREFIX);
    
    if (!objects || objects.length === 0) {
      console.log("No objects found in S3 bucket");
      lastFetchObjectCount = 0;
      return [];
    }
    
    // Get the content of each object (adjust as needed for your use case)
    const results = await Promise.all(
      objects.map(async (object) => {
        if (object.Key) {
          const data = await getS3Object(BUCKET_NAME, object.Key);
          return { key: object.Key, data };
        }
        return null;
      })
    );
    
    const validResults = results.filter(Boolean);
    lastFetchObjectCount = validResults.length;
    lastFetchTime = new Date();
    lastFetchError = null;
    
    console.log(`Successfully fetched ${lastFetchObjectCount} objects from S3`);
    return validResults;
  } catch (error) {
    console.error("Error in fetchDataFromS3:", error);
    lastFetchError = error instanceof Error ? error.message : "Unknown error";
    toast({
      title: "Error fetching data",
      description: "Failed to fetch data from S3. Please try again later.",
      variant: "destructive",
    });
    return [];
  } finally {
    currentlyFetching = false;
  }
};

// Function to manually trigger a sync
export const syncNow = async () => {
  if (currentlyFetching) {
    toast({
      title: "Sync in progress",
      description: "Please wait for the current sync to complete.",
    });
    return null;
  }
  
  toast({
    title: "Sync started",
    description: "Fetching data from S3...",
  });
  
  const results = await fetchDataFromS3();
  
  if (!lastFetchError) {
    toast({
      title: "Sync completed",
      description: `Successfully fetched ${lastFetchObjectCount} objects from S3.`,
    });
  }
  
  return results;
};

// Get current fetch status
export const getFetchStatus = () => {
  return {
    lastFetchTime,
    currentlyFetching,
    objectCount: lastFetchObjectCount,
    error: lastFetchError,
  };
};

// Start the periodic fetch (every 1 hour)
export const startPeriodicS3Fetch = () => {
  if (fetchTimerId) {
    console.log("Periodic S3 fetch is already running");
    return;
  }
  
  console.log("Starting periodic S3 fetch (every hour)");
  
  // Immediately fetch data when started
  fetchDataFromS3();
  
  // Set up the hourly timer (3600000 ms = 1 hour)
  fetchTimerId = window.setInterval(fetchDataFromS3, 3600000);
  
  return () => {
    if (fetchTimerId) {
      clearInterval(fetchTimerId);
      fetchTimerId = null;
      console.log("Stopped periodic S3 fetch");
    }
  };
};

// Stop the periodic fetch
export const stopPeriodicS3Fetch = () => {
  if (fetchTimerId) {
    clearInterval(fetchTimerId);
    fetchTimerId = null;
    console.log("Stopped periodic S3 fetch");
  }
};

