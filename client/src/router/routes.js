const routes = [{
    path: '/',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ],
    meta: { requiresAuth: true } 
  },
  {
    path: '/image',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ImageParts.vue') }
    ],
    meta: { requiresAuth: true } 
  },
  {
    path: '/blank',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/BlankPage.vue') }
    ],
    meta: { requiresAuth: true } 
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/LoginForm.vue') }
    ],
  },
  {
    path: '/signUp',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/RegisterForm.vue') }
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }

]

export default routes
