<template>
  <div class="blank-page">
    <div class="q-pa-md">
      <div class="row q-mb-md">
        <div class="col-12 col-md-6 q-pa-md">
          <p>Model Image</p>
          <div class="row q-mb-sm">
            <q-file
              v-model="modelImage"
              label="Select model image"
              filled
              accept=".jpg, .jpeg, .png, image/*"
              @update:model-value="onModelImageChange"
              class="col"
              :disable="showModelCamera || showGarmentCamera"
            >
              <template v-slot:append>
                <q-icon name="photo" />
              </template>
            </q-file>
            <q-btn 
              flat 
              round 
              :icon="showModelCamera ? 'close' : 'camera_alt'" 
              @click="toggleModelCamera" 
              class="q-ml-sm"
              :disable="showGarmentCamera"
              :color="showModelCamera ? 'negative' : 'primary'"
            />
          </div>
          
          <div v-if="!showModelCamera" class="image-preview-container q-mt-md">
            <q-img
              v-if="modelImagePreview"
              :src="modelImagePreview"
              class="preview-image"
            />
            <div v-else class="no-image-placeholder">
              <q-icon name="person" size="48px" color="grey-5" />
              <div class="text-grey-6 q-mt-sm">Selecciona una imagen o usa la cámara</div>
            </div>
          </div>
          <div v-else class="camera-container q-mt-md">
            <video ref="modelVideoElement" autoplay playsinline class="camera-video"></video>
            <div class="camera-controls">
              <q-btn 
                round 
                color="primary" 
                icon="photo_camera" 
                size="lg" 
                class="capture-btn" 
                @click="captureModelImage" 
              />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 q-pa-md">
          <p>Garment Image</p>
          <div class="row q-mb-sm">
            <q-file
              v-model="garmentImage"
              label="Select garment image"
              filled
              accept=".jpg, .jpeg, .png, image/*"
              @update:model-value="onGarmentImageChange"
              class="col"
              :disable="showModelCamera || showGarmentCamera"
            >
              <template v-slot:append>
                <q-icon name="photo" />
              </template>
            </q-file>
            <q-btn 
              flat 
              round 
              :icon="showGarmentCamera ? 'close' : 'camera_alt'" 
              @click="toggleGarmentCamera" 
              class="q-ml-sm"
              :disable="showModelCamera"
              :color="showGarmentCamera ? 'negative' : 'primary'"
            />
          </div>
          
          <div v-if="!showGarmentCamera" class="image-preview-container q-mt-md">
            <q-img
              v-if="garmentImagePreview"
              :src="garmentImagePreview"
              class="preview-image"
            />
            <div v-else class="no-image-placeholder">
              <q-icon name="checkroom" size="48px" color="grey-5" />
              <div class="text-grey-6 q-mt-sm">Selecciona una imagen o usa la cámara</div>
            </div>
          </div>
          <div v-else class="camera-container q-mt-md">
            <video ref="garmentVideoElement" autoplay playsinline class="camera-video"></video>
            <div class="camera-controls">
              <q-btn 
                round 
                color="primary" 
                icon="photo_camera" 
                size="lg" 
                class="capture-btn" 
                @click="captureGarmentImage" 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="row justify-center q-mt-lg">
        <q-btn 
          color="primary" 
          label="Try it on!" 
          :loading="loading" 
          :disabled="!modelImage || !garmentImage || showModelCamera || showGarmentCamera"
          @click="tryItOn" 
        />
      </div>

      <!-- Información de timeout y estado -->
      <div class="row justify-center q-mt-md">
        <div class="text-caption text-center">
          <p v-if="!loading">La API puede tardar entre 15-30 segundos en procesar las imágenes</p>
          <p v-else-if="processing">
            {{ processingMessage }}
            <q-spinner color="primary" size="1em" class="q-ml-xs" />
          </p>
          <p v-if="errorMessage" class="text-negative">
            <q-icon name="error" size="sm" />
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Results overlay -->
    <div v-if="resultImage" class="result-overlay">
      <div class="result-container">
        <q-btn 
          round 
          color="dark" 
          icon="close" 
          class="close-btn" 
          @click="closeResult" 
        />
        <div class="result-image-container">
          <img 
            :src="resultImage" 
            class="result-image"
            alt="Result"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Loading, Notify } from 'quasar';

// Image files and previews
const modelImage = ref(null);
const garmentImage = ref(null);
const modelImagePreview = ref(null);
const garmentImagePreview = ref(null);

// Cámara
const modelVideoElement = ref(null);
const garmentVideoElement = ref(null);
const showModelCamera = ref(false);
const showGarmentCamera = ref(false);
let modelMediaStream = null;
let garmentMediaStream = null;

// API response
const resultImage = ref(null);
const loading = ref(false);
const processing = ref(false);
const processingMessage = ref('');
const errorMessage = ref('');
const requestTimeout = ref(null);

// FashnAI API key
const FASHNIA_API_KEY = import.meta.env.VITE_FASHNIA_API_KEY || process.env.FASHNIA_API_KEY || 'YOUR_API_KEY_HERE';

// Control de errores - observar cambios en las imágenes
watch(modelImage, (newVal) => {
  if (newVal && showModelCamera.value) {
    closeModelCamera();
  }
});

watch(garmentImage, (newVal) => {
  if (newVal && showGarmentCamera.value) {
    closeGarmentCamera();
  }
});

// Funciones de cámara
const startCamera = async (videoRef) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' }, 
      audio: false 
    });
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      return stream;
    }
    return null;
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    errorMessage.value = 'No se pudo acceder a la cámara. Verifica los permisos.';
    Notify.create({
      message: 'No se pudo acceder a la cámara. Verifica los permisos del navegador.',
      color: 'negative',
      position: 'top',
      timeout: 3000
    });
    return null;
  }
};

const stopCamera = (stream) => {
  if (stream) {
    try {
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error al detener la cámara:', error);
    }
  }
};

const toggleModelCamera = async () => {
  // Si la cámara ya está abierta, la cerramos
  if (showModelCamera.value) {
    closeModelCamera();
    return;
  }
  
  // Si la otra cámara está abierta, mostramos un error
  if (showGarmentCamera.value) {
    Notify.create({
      message: 'Solo puedes tener una cámara abierta a la vez. Por favor, cierra la otra cámara primero.',
      color: 'warning',
      position: 'top',
      timeout: 3000
    });
    return;
  }
  
  showModelCamera.value = true;
  modelMediaStream = await startCamera(modelVideoElement);
  
  // Si no se pudo iniciar la cámara, ocultamos la interfaz
  if (!modelMediaStream) {
    showModelCamera.value = false;
  }
};

const closeModelCamera = () => {
  stopCamera(modelMediaStream);
  modelMediaStream = null;
  showModelCamera.value = false;
};

const toggleGarmentCamera = async () => {
  // Si la cámara ya está abierta, la cerramos
  if (showGarmentCamera.value) {
    closeGarmentCamera();
    return;
  }
  
  // Si la otra cámara está abierta, mostramos un error
  if (showModelCamera.value) {
    Notify.create({
      message: 'Solo puedes tener una cámara abierta a la vez. Por favor, cierra la otra cámara primero.',
      color: 'warning',
      position: 'top',
      timeout: 3000
    });
    return;
  }
  
  showGarmentCamera.value = true;
  garmentMediaStream = await startCamera(garmentVideoElement);
  
  // Si no se pudo iniciar la cámara, ocultamos la interfaz
  if (!garmentMediaStream) {
    showGarmentCamera.value = false;
  }
};

const closeGarmentCamera = () => {
  stopCamera(garmentMediaStream);
  garmentMediaStream = null;
  showGarmentCamera.value = false;
};

const captureImage = (videoElement) => {
  if (!videoElement) {
    Notify.create({
      message: 'Error al capturar la imagen. La cámara no está disponible.',
      color: 'negative'
    });
    return null;
  }
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.png`, { type: 'image/png' });
          resolve(file);
        } else {
          Notify.create({
            message: 'Error al procesar la imagen capturada',
            color: 'negative'
          });
          resolve(null);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error al capturar imagen:', error);
    Notify.create({
      message: 'Error al capturar la imagen',
      color: 'negative'
    });
    return null;
  }
};

const captureModelImage = async () => {
  try {
    const file = await captureImage(modelVideoElement.value);
    if (file) {
      modelImage.value = file;
      modelImagePreview.value = URL.createObjectURL(file);
      closeModelCamera();
      Notify.create({
        message: 'Imagen de modelo capturada correctamente',
        color: 'positive',
        position: 'top',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Error en captureModelImage:', error);
    errorMessage.value = 'Error al capturar la imagen del modelo';
  }
};

const captureGarmentImage = async () => {
  try {
    const file = await captureImage(garmentVideoElement.value);
    if (file) {
      garmentImage.value = file;
      garmentImagePreview.value = URL.createObjectURL(file);
      closeGarmentCamera();
      Notify.create({
        message: 'Imagen de prenda capturada correctamente',
        color: 'positive',
        position: 'top',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Error en captureGarmentImage:', error);
    errorMessage.value = 'Error al capturar la imagen de la prenda';
  }
};

// Handle image selection
const onModelImageChange = (file) => {
  try {
    if (file) {
      modelImagePreview.value = URL.createObjectURL(file);
      // Si había una cámara abierta, la cerramos
      if (showModelCamera.value) {
        closeModelCamera();
      }
    } else {
      modelImagePreview.value = null;
    }
  } catch (error) {
    console.error('Error al cargar la imagen del modelo:', error);
    errorMessage.value = 'Error al cargar la imagen del modelo';
    modelImage.value = null;
    modelImagePreview.value = null;
  }
};

const onGarmentImageChange = (file) => {
  try {
    if (file) {
      garmentImagePreview.value = URL.createObjectURL(file);
      // Si había una cámara abierta, la cerramos
      if (showGarmentCamera.value) {
        closeGarmentCamera();
      }
    } else {
      garmentImagePreview.value = null;
    }
  } catch (error) {
    console.error('Error al cargar la imagen de la prenda:', error);
    errorMessage.value = 'Error al cargar la imagen de la prenda';
    garmentImage.value = null;
    garmentImagePreview.value = null;
  }
};

// Convert image file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// FashnAI API call
const tryItOn = async () => {
  // Verificamos que las cámaras estén cerradas
  if (showModelCamera.value || showGarmentCamera.value) {
    errorMessage.value = 'Por favor, cierra las cámaras antes de continuar';
    Notify.create({
      message: 'Por favor, cierra las cámaras y captura las imágenes antes de continuar',
      color: 'warning',
      position: 'top'
    });
    return;
  }

  if (!modelImage.value || !garmentImage.value) {
    errorMessage.value = 'Por favor, selecciona las imágenes de modelo y prenda';
    return;
  }

  try {
    // Limpiar errores anteriores
    errorMessage.value = '';
    loading.value = true;
    processing.value = true;
    processingMessage.value = 'Enviando imágenes...';
    
    // Timeout global para la operación completa (2 minutos)
    const timeoutPromise = new Promise((_, reject) => {
      requestTimeout.value = setTimeout(() => {
        reject(new Error('La operación ha tardado demasiado tiempo. Por favor, inténtalo de nuevo.'));
      }, 120000); // 2 minutos
    });
    
    // Convert images to base64
    const modelImageBase64 = await fileToBase64(modelImage.value);
    const garmentImageBase64 = await fileToBase64(garmentImage.value);
    
    processingMessage.value = 'Procesando petición...';
    
    // Call FashnAI API with timeout handling
    const fetchPromise = fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      body: JSON.stringify({
        model_image: modelImageBase64,
        garment_image: garmentImageBase64,
        category: 'tops'
      }),
      headers: {
        'Authorization': `Bearer ${FASHNIA_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Error: ${data.error}`);
    }
    
    processingMessage.value = 'Generando imagen...';
    
    // Poll for results
    await checkStatus(data.id);
    
  } catch (error) {
    console.error('Error:', error);
    errorMessage.value = error.message || 'Se ha producido un error inesperado';
    loading.value = false;
    processing.value = false;
    
    Notify.create({
      message: errorMessage.value,
      color: 'negative',
      position: 'top',
      timeout: 5000
    });
  } finally {
    // Clear timeout if it exists
    if (requestTimeout.value) {
      clearTimeout(requestTimeout.value);
      requestTimeout.value = null;
    }
  }
};

// Poll FashnAI API for results
const checkStatus = async (id) => {
  try {
    // Max number of retries and counter
    const maxRetries = 15; // ~45 segundos con 3 segundos de espera
    let retryCount = 0;
    
    const checkStatusInternal = async () => {
      try {
        processingMessage.value = `Generando imagen... (${retryCount+1}/${maxRetries})`;
        
        const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
          headers: {
            'Authorization': `Bearer ${FASHNIA_API_KEY}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al verificar estado: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Error: ${data.error}`);
        }
        
        if (data.status === 'completed') {
          // Use the first output image if available
          if (data.output && data.output.length > 0) {
            resultImage.value = data.output[0];
            loading.value = false;
            processing.value = false;
          } else {
            throw new Error('No se recibieron imágenes en la respuesta');
          }
        } else if (data.status === 'failed') {
          throw new Error('El procesamiento de imagen ha fallado');
        } else {
          // Still processing
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw new Error('Se ha excedido el tiempo máximo de espera');
          }
          
          // Check again after delay
          setTimeout(checkStatusInternal, 3000);
        }
      } catch (error) {
        loading.value = false;
        processing.value = false;
        throw error;
      }
    };
    
    await checkStatusInternal();
    
  } catch (error) {
    console.error('Error checking status:', error);
    errorMessage.value = error.message || 'Error al verificar el estado del procesamiento';
    loading.value = false;
    processing.value = false;
    
    Notify.create({
      message: errorMessage.value,
      color: 'negative',
      position: 'top',
      timeout: 5000
    });
  }
};

// Close result image
const closeResult = () => {
  resultImage.value = null;
};

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (requestTimeout.value) {
    clearTimeout(requestTimeout.value);
  }
  
  // Detener todas las cámaras al desmontar el componente
  closeModelCamera();
  closeGarmentCamera();
  
  // Liberar URLs de objetos
  if (modelImagePreview.value) {
    URL.revokeObjectURL(modelImagePreview.value);
  }
  if (garmentImagePreview.value) {
    URL.revokeObjectURL(garmentImagePreview.value);
  }
});
</script>

<style scoped>
.blank-page {
  height: 100vh;
  width: 100%;
  background-color: white;
  position: relative;
}

.image-preview-container {
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.camera-container {
  width: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.4);
}

.capture-btn {
  width: 70px;
  height: 70px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  transition: all 0.2s ease;
}

.capture-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.6);
}

.close-camera-btn {
  position: absolute;
  left: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.result-container {
  position: relative;
  width: 90%;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  overflow: hidden;
}

.result-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.result-image {
  max-width: 100%;
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style> 