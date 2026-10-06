const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const snapButton = document.getElementById("snap");

// 1. Start Camera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing camera:", err);
  });

// 2. Capture and Send
snapButton.addEventListener("click", async () => {
  // Draw the current video frame to the canvas
  context.drawImage(video, 0, 0, 640, 480);

  // Convert canvas content to a Blob (binary data)
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    try {
      // Send the image to your Cloudflare Worker
      const response = await fetch("https://your-worker-url.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      // Handle response
      const result = await response.json();
      console.log("AI Description:", result.description);
      alert("AI says: " + result.description);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, "image/jpeg");
});
