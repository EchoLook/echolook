<template>
  <div class="row justify-center items-center full-height">
    <img v-if="state" ref="imageRef" style="height: 720px" :src="state.image.result.picture.url" @load="onImageLoad" />
    <div v-for="(point, index) in points" :key="index" :style="getPointStyle(point)" class="point"
      @click="handlePointClick($event, point)">
      <q-menu>
        <q-list style="min-width: 100px" v-if="actualSegments.length > 0">
          <q-item v-close-popup name="handlePointClick" clickable>
            <a class="row" :href="actualSegments[0].link">
              <q-item-section>
                <q-item-label>{{ actualSegments[0].name }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge v-if="actualSegments[0].price.value.original" color="red">
                  <s>{{ actualSegments[0].price.value.original }} {{ actualSegments[0].price.currency }}</s>
                </q-badge>
                <q-badge color="black">
                  {{ actualSegments[0].price.value.current }} {{ actualSegments[0].price.currency }}
                </q-badge>
              </q-item-section>
            </a>
          </q-item>
          <q-item v-if="!showMore" clickable>
            <q-item-section @click="showMoreClothes">Show more</q-item-section>
          </q-item>
          <div v-if="showMore">
            <q-item clickable :key="index" v-for="(segment, index) in actualSegments.slice(1)">
              <a class="row" :href="segment.link">
                <q-item-section>
                  <q-item-label>{{ segment.name }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge v-if="segment.price.value.original" color="red">
                    <s>{{ segment.price.value.original }} {{ segment.price.currency }}</s>
                  </q-badge>
                  <q-badge color="black">
                    {{ segment.price.value.current }} {{ segment.price.currency }}
                  </q-badge>
                </q-item-section>
              </a>
            </q-item>
          </div>
        </q-list>
        <q-list style="min-width: 100px" v-else-if="loadingSegments">
          <q-item v-close-popup name="handlePointClick">
            <q-item-section>
              <q-item-label>Loading...</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-list style="min-width: 100px" v-else>
          <q-item v-close-popup name="handlePointClick">
            <q-item-section>
              <q-item-label>No results</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>
  </div>
  <div class="sound-wave-container" :class="{ 'recording': isRecording }">
    <div class="wave wave1"></div>
    <div class="wave wave2"></div>
    <div class="wave wave3"></div>
  </div>
  <div class="fixed-bottom-right q-ma-xl" style="z-index: 11;">
    <q-btn round color="black" text-color="white" :icon="isRecording ? 'stop' : 'mic'" class="circular-button"
      @click="toggleRecord" />
  </div>
  <q-dialog v-model="showAudioSearchDialog" persistent :maximized="showAudioSearchDialogMaximized"
    transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-primary text-white">
      <q-bar>
        <q-space />

        <q-btn dense flat icon="minimize" @click="showAudioSearchDialogMaximized = false"
          :disable="!showAudioSearchDialogMaximized">
          <q-tooltip v-if="showAudioSearchDialogMaximized" class="bg-white text-primary">Minimize</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="crop_square" @click="showAudioSearchDialogMaximized = true"
          :disable="showAudioSearchDialogMaximized">
          <q-tooltip v-if="!showAudioSearchDialogMaximized" class="bg-white text-primary">Maximize</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <div v-if="audioSearchResult.length === 0" class="text-h5 q-ml-md">
        No Results
      </div>
      <div v-if="audioSearchResult.length > 0" class="text-h5 q-ml-md">
        Results:
      </div>
      <q-card-section v-for="(product, index) in audioSearchResult" :key="index">
        <div v-if="product?.description">Description: {{ product.description }}</div>
        <div v-if="product?.maxPrice">Maximum price: {{ product.maxPrice }}</div>
        <q-card-section clickable v-for="(result, index) in product.results" :key="index">
          <a class="row" :href="result.link">
            <q-item-section>
              <q-item-label style="color: white">{{ result.name }}</q-item-label>
            </q-item-section>

            <q-item-section v-if="result.brand === 'zara'" color="white">
              <q-btn flat color="white" @click.stop.prevent="onTryClick(result)" label="Try it on!" />
              </q-item-section>

            <q-item-section side>
              <q-badge v-if="result.price.value.original" color="red">
                <s>{{ result.price.value.original }} {{ result.price.currency }}</s>
              </q-badge>
              <q-badge color="black">
                {{ result.price.value.current }} {{ result.price.currency }}
              </q-badge>
            </q-item-section>
          </a>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped>
.point {
  border: 1px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.q-dialog--positioned {
  position: absolute !important;
  z-index: 11;
}

a {
  text-decoration: none;
  color: black;
}

.q-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q-item-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.q-item-section:last-child {
  margin-left: 10px;
}
</style>
<script>
import { ref } from 'vue';
import { state } from '../modules/userState'
import imageService from "../services/imageService";
import searchService from "../services/searchService";
import { Loading } from 'quasar';

export default {
  name: 'ImageWithStaticPoints',
  setup() {
    const imageRef = ref(null);
    const imageHeight = ref(0);
    const imageWidth = ref(0);
    const isRecording = ref(false);
    let mediaRecorder = null;
    const audioChunks = ref([]);
    let showAudioSearchDialog = ref(false)
    let showAudioSearchDialogMaximized = ref(true)
    let audioSearchResult = ref([])
    let pointsList = []
    state.image.result.segments.forEach(segment =>
      pointsList.push({ id: segment._id, x: segment.coords.x, y: segment.coords.y }
      ));
    const points = ref(pointsList);
    const selectedPoint = ref({});
    let showMore = ref(false)
    let actualSegments = ref([]);
    let loadingSegments = ref(false);
    let actualImageId = ref(state.image.result.picture._id);

    const onImageLoad = (event) => {
      imageHeight.value = event.target.naturalHeight;
      imageWidth.value = event.target.naturalWidth;
    };

    const getPointStyle = (point) => {
      const top = (point.y / imageHeight.value) * 100;
      const left = (point.x / imageWidth.value) * 100;

      return {
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        cursor: 'pointer',
        zIndex: 10
      };
    };

    const handlePointClick = async (event, point) => {
      actualSegments.value = [];
      loadingSegments.value = true;
      actualSegments.value = (await imageService.getClothDetail(point.id)).result;
      loadingSegments.value = false;
      selectedPoint.value = point;
      showMore.value = false;
    };

    const showMoreClothes = () => {
      showMore.value = true
    }

    const toggleRecord = async () => {
      if (!isRecording.value) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks.value = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.value.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' });
            const audioFile = new File([audioBlob], 'grabacion.webm', {
              type: 'audio/webm;codecs=opus',
              lastModified: Date.now(),
            });
            const url = URL.createObjectURL(audioBlob);

            searchClothesByAudio(audioFile)
          };

          mediaRecorder.start();
          isRecording.value = true;
        } catch (error) {
          console.error('Error al acceder al micrófono:', error);
        }
      } else {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          isRecording.value = false;
        }
      }
    };

    const onTryClick = async (product) => {
      try {
        Loading.show();
        const { result } = await imageService.tryItOn(state.image.result.picture.url, product.link);
        //router.push('/image');
        // Como abrir una imagen en una pestaña nueva?
        window.open(result, '_blank');
      } catch (error) {
        console.log(error.response?.data?.error);
      } finally {
        Loading.hide();
      }
    }

    const searchClothesByAudio = async (audio) => {
      try {
        Loading.show();
        audioSearchResult.value = (await searchService.getClothesByAudio({ audio, id: actualImageId.value })).result;
        showAudioSearchDialog.value = true;
        console.log(audioSearchResult);
      } catch (error) {
        console.log(error.response?.data?.error);
      } finally {
        Loading.hide();
      }
    }

    return {
      imageRef,
      imageHeight,
      imageWidth,
      points,
      selectedPoint,
      onImageLoad,
      getPointStyle,
      handlePointClick,
      state,
      actualSegments,
      showMore,
      showMoreClothes,
      toggleRecord,
      isRecording,
      showAudioSearchDialog,
      showAudioSearchDialogMaximized,
      audioSearchResult,
      loadingSegments,
      onTryClick
    };
  }
};
</script>

<style scoped>
.point {
  border: 1px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.q-dialog--positioned {
  position: absolute !important;
  z-index: 11;
}

a {
  text-decoration: none;
  color: black;
}

.sound-wave-container {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  backdrop-filter: blur(7px);
  transition: opacity 0.3s ease-in-out;
}

.sound-wave-container.recording {
  opacity: 1;
  z-index: 11;
}

.wave {
  width: 15px;
  height: 40px;
  background-color: currentColor;
  /* Hereda el color del texto del botón */
  margin: 0 3px;
  border-radius: 2px;
  animation: wave-animation 1s infinite alternate;
}

.wave1 {
  animation-delay: 0.1s;
}

.wave2 {
  animation-delay: 0.3s;
}

.wave3 {
  animation-delay: 0.5s;
}

@keyframes wave-animation {
  0% {
    transform: scaleY(0.4);
  }

  100% {
    transform: scaleY(1.2);
  }
}
</style>