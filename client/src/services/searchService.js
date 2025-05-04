import { api } from "../boot/axios";

export default {
  async getHistory() {
    try {
      return (await api.get('/search/history')).data?.result;
    } catch (error) {
      throw error;
    }
  },
  async getClothesByAudio({audio, id}) {
    try {
      const formData = new FormData();
      formData.append('audio', audio);
      formData.append('id', id);
      return (await api.post('/search/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data;
    } catch (error) {
      throw error;
    }
  },

};
