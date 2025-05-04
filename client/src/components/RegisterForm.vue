<template>
    <div class="q-ma-xl">
      <q-banner v-if="error" inline-actions class="text-white bg-red q-mb-md">
          {{ "Error: " + $t(error) }}
      </q-banner>
      <q-card flat :style="{minWidth:'400px'}">
        <q-card-section class="q-mb-xs">
          <div class="text-h6">{{ $t('labels.sign_up') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="signUp">
            <q-input v-model="username" :label="$t('labels.username')" name="username" outlined class="q-mb-md" required/>
            <q-input v-model="password" :label="$t('labels.password')" name="password" type="password" outlined class="q-mb-md" required/>
            <div class="flex flex-center">
              <q-btn type="submit" :label="$t('labels.sign_up')" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
</template>

  <script>
  import userService from "../services/userService";
  import { setUserData } from "../modules/userState";

  export default {
    name: 'LoginForm',
    data() {
      return {
        email: '',
        username: '',
        password: '',
        error: null
      };
    },
    methods: {
      async signUp() {
        try {
          const userData = await userService.signUpUser(this);
          setUserData(userData);
          sessionStorage.setItem('token', userData.token);

          this.$router.push('/');
        } catch (error) {
          this.error = error.response.data.error;
        }
      }
    }
  };
  </script>