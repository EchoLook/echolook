import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { state } from "../modules/userState";

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = state.token !== null && state.user !== null;

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // Si la ruta requiere autenticación y el usuario no está autenticado, redirige a la página de login
    next('/login');
  } else {
    // Si el usuario está autenticado o la ruta no requiere autenticación, permite el acceso
    next();
  }
});

export default router;
