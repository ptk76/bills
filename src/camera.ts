<!-- HTML Structure -->
<video id="video" width="640" height="480" autoplay playsinline></video>
<button id="snap">Take Photo</button>
<canvas id="canvas" width="640" height="480"></canvas>

<script>
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const snapButton = document.getElementById('snap');

  // Request access to the user's camera
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Camera access denied or unavailable: ", err);
    });

  // Capture the frame when the button is clicked
  snapButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, 640, 480);
  });
</script>