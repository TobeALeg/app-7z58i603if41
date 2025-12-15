// Debug script to test file upload limits and configurations

// Test file size constants
const TEST_FILE_SIZES = [
  { name: "1MB", size: 1 * 1024 * 1024 },
  { name: "50MB", size: 50 * 1024 * 1024 },
  { name: "100MB", size: 100 * 1024 * 1024 },
  { name: "150MB", size: 150 * 1024 * 1024 },
  { name: "200MB", size: 200 * 1024 * 1024 },
  { name: "250MB", size: 250 * 1024 * 1024 }, // This should fail
];

// Create a test file with specified size
function createTestFile(sizeInBytes, filename = "test-file.zip") {
  // For browsers that support it, create a fake file-like object
  const file = new File([new ArrayBuffer(sizeInBytes)], filename, {
    type: "application/zip",
  });
  return file;
}

// Test file upload against various limits
function testFileUploadLimits() {
  console.log("Testing file upload limits...");
  
  // Current frontend limit (defined in SubmitWorkPage.tsx)
  const FRONTEND_MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
  
  console.log(`Frontend max file size: ${formatBytes(FRONTEND_MAX_FILE_SIZE)}`);
  
  // Test different file sizes
  for (const fileSize of TEST_FILE_SIZES) {
    const file = createTestFile(fileSize.size);
    const withinFrontendLimit = file.size <= FRONTEND_MAX_FILE_SIZE;
    
    console.log(`\n--- Testing ${fileSize.name} file (${formatBytes(fileSize.size)}) ---`);
    console.log(`Within frontend limit: ${withinFrontendLimit ? 'YES' : 'NO'}`);
    
    // Check if file would be rejected by frontend
    if (!withinFrontendLimit) {
      console.log(`❌ Would be rejected by frontend: File exceeds ${formatBytes(FRONTEND_MAX_FILE_SIZE)} limit`);
      continue;
    }
    
    // Simulate backend checks
    console.log(`✅ Would pass frontend validation`);
  }
  
  console.log("\n--- Database Configuration Check ---");
  console.log("Database bucket configuration:");
  console.log("- Bucket ID: app-7z58i603if41_works_images");
  console.log("- Expected file_size_limit: 209715200 bytes (200MB)");
  console.log("- Expected allowed MIME types: image/* and various archive formats");
  
  console.log("\n--- How to verify database configuration ---");
  console.log("Run this SQL query in your Supabase SQL editor:");
  console.log(`
SELECT id, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'app-7z58i603if41_works_images';`);
}

// Format bytes to human readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the test
testFileUploadLimits();

console.log("\n--- Debug Instructions ---");
console.log("1. Open browser DevTools (F12)");
console.log("2. Go to Console tab");
console.log("3. Paste this entire file content and press Enter");
console.log("4. Check the output for file size analysis");
console.log("5. Run the suggested SQL query in Supabase dashboard to verify bucket configuration");