<template>
    <div class="q-ma-xl">
      <q-banner v-if="error" inline-actions class="text-white bg-red q-mb-md">
          {{ "Error: " + $t(error) }}
      </q-banner>
      <q-card flat :style="{minWidth:'400px'}">
        <q-card-section>
          <div class="text-h6">{{ $t('labels.sign_in') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="login">
            <q-input v-model="username" :label="$t('labels.username')" name="username" outlined class="q-mb-md" required/>
            <q-input v-model="password" :label="$t('labels.password')" name="password" type="password" outlined class="q-mb-md" required/>
            <div class="flex flex-center">
              <q-btn type="submit" :label="$t('labels.sign_in')" color="primary" />
            </div>
            <div class="flex flex-center q-mt-md">
              <q-btn outline clickable type="submit" :label="$t('labels.sign_up')" @click="goToSignUp" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
</template>

  <script>
  import userService from "../services/userService";
  import searchService from "../services/searchService";
  import { setHistory, setUserData } from "../modules/userState";

  export default {
    name: 'LoginForm',
    data() {
      return {
        username: '',
        password: '',
        error: null
      };
    },
    methods: {
      async login() {
        try {
          const userData = await userService.loginUser(this);
          setUserData(userData);
          sessionStorage.setItem('token', userData.token);

          const history = await searchService.getHistory();
          setHistory(history);

          this.$router.push('/');
        } catch (error) {
          this.error = error.response.data.error;
        }
      },
      goToSignUp() {
        this.$router.push('/signUp');
      }
    }
  };
  </script>