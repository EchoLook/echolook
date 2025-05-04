<template>
  <div class="justify-center">
    <div class="video-container">
      <div v-if="!photo" class="q-pa-md flex flex-center">
        <video ref="videoElement" autoplay playsinline></video>
      </div>
      <div v-else class="q-pa-md flex flex-center">
        <q-img :src="photo" class="q-mb-md" style="width: 100%; height: 100vh;" />
      </div>
    </div>
    <div>
      <div v-if="streaming" class="camera-bottom-bar fixed-bottom q-pa-md row justify-around items-center">
        <q-btn flat round icon="image" @click="triggerFileUpload" size="md" :disabled="cameraButtonClicked" />
        <input ref="fileInput" type="file" accept=".jpg, .png, image/*" style="display: none;"
          @change="handleFileChange" />
          <div>
        <q-btn round unelevated color="white" size="md" class="q-ma-md shadow-10 border-photo-btn" @click="makePhoto" :disabled="cameraButtonClicked">
          <div style="color: black;">{{ useCountdown ? countDown : '' }}</div>  
        </q-btn>
        </div>
        <q-btn flat icon="timer" round unelevated color="black" size="md" class="q-ma-md shadow-10 border-photo-btn" :style="useCountdown ? '' : 'opacity: 0.6'" @click="changeUseCountDown" :disabled="cameraButtonClicked" />
      </div>
    </div>
  </div>

</template>

<style scoped>
.camera-bottom-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.border-photo-btn {
  border: 6px solid #ddd;
  border-radius: 50% !important;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100vh;
  /* o ajusta según tu diseño */
  overflow: hidden;
  background: black;
}

video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
  /* MUY IMPORTANTE */
  width: 100%;
  height: 100%;
}
</style>

<script setup>
import { Loading } from 'quasar';
import { useRouter } from 'vue-router';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import imageService from "../services/imageService";
import { setImageData } from "../modules/userState";

const router = useRouter();
const videoElement = ref(null);
const streaming = ref(false);
let mediaStream = null;
const useFrontCamera = ref(true);
let photo = ref(null);
let countDown = ref(5)
let useCountdown = ref(false)
let cameraButtonClicked = ref(false)

const filesImages = ref(null);
const fileInput = ref(null);

async function doCountDown() {
  for (let i = countDown.value; i > 0; i--) {
    countDown.value--
    await new Promise(r => setTimeout(r, 1000));
  }
}

function changeUseCountDown() {
  useCountdown.value = !useCountdown.value
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: {
        facingMode: useFrontCamera.value ? 'user' : 'environment'
      }, audio: false });
    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream;
      streaming.value = true;
    }
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
  }
}

const flipCamera = async () => {
  useFrontCamera.value = !useFrontCamera.value;
  await startCamera();
};

onBeforeUnmount(() => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
});

const sendPhotoToFormat = async (image) => {
  try {
    Loading.show();
    const imageData = await imageService.sendImageToFormat({ image });
    setImageData(imageData);

    router.push('/image');
  } catch (error) {
    console.log(error.response?.data?.error);
  } finally {
    Loading.hide();
  }
}

const makePhoto = async () => {
  if (!videoElement.value) {
    return;
  }

  cameraButtonClicked.value = true

  if (useCountdown.value) {
    await doCountDown()
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], 'foto.png', { type: 'image/png' });
      photo.value = URL.createObjectURL(file);
      sendPhotoToFormat(file);
    }
  }, 'image/png')
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    filesImages.value = file;
    photo.value = URL.createObjectURL(file);
    sendPhotoToFormat(filesImages.value)
  }
};

const onRejected = (rejectedEntries) => {
  dialog({
    title: 'Error',
    message: `El archivo ${rejectedEntries[0].name} no es una imagen válida.`,
  });
};

onMounted(() => {
  startCamera();
});
</script>
