import { api } from "../boot/axios";

export default {
  async loginUser({username, password}) {
    try {
      return (await api.post('/users/login', {
        username,
        password
      })).data;
    } catch (error) {
      throw error;
    }
  },

  async signUpUser({username, password}) {
    try {
      return (await api.post('/users/signUp', {
        username,
        password
      })).data;
    } catch (error) {
      throw error;
    }
  },

  async tryLoginUserFromServiceToken() {
    try {
      return (await api.post('/users/loginFromServiceToken')).data;
    } catch (error) {
      throw error;
    }
  },

};
