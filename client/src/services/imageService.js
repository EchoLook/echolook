import { api } from "../boot/axios";

export default {
  async sendImageToFormat({image}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      return (await api.post('/search/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data;
    } catch (error) {
      throw error;
    }
  },

  async getClothDetail(imageId) {
    try {
      return (await api.get(`/search/${imageId}`)).data;
    } catch (error) {
      throw error;
    }
  },

  async getPictureDetail(imageId) {
    try {
      return (await api.get(`/search/${imageId}`)).data;
    } catch (error) {
      throw error;
    }
  },

  async tryItOn(modelUrl, garmentLink) {
    try {
      return (await api.post('/search/try', {modelUrl, garmentLink})).data;
    } catch (error) {
      throw error;
    }
  }

};
