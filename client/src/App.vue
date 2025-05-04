<template>
  <router-view />
</template>

<style lang="css">
* {
  font-family: 'Inter Tight', 'Helvetica', 'Arial', sans-serif;
  text-transform: uppercase;
}

body {
  font-size: 0.7rem;
}

input, button:not(border-photo-btn), select, textarea, .q-card,
.q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input, .q-field--outlined .q-field__control {
  text-transform: none !important;
  border-radius: 0 !important;
}
</style>

<script>
import { defineComponent } from 'vue'
import userService from "./services/userService";
import searchService from "./services/searchService";
import { setUserData, setHistory } from "./modules/userState";

export default defineComponent({
  name: 'App',
  created() {
    this.tryLoginUserFromServiceToken();
  },
  methods: {
    async tryLoginUserFromServiceToken(){
      const userData = await userService.tryLoginUserFromServiceToken();
      setUserData(userData);
      sessionStorage.setItem('token', userData.token);

      const history = await searchService.getHistory();
      setHistory(history);

      this.$router.push('/');
    }
  }
})
</script>
