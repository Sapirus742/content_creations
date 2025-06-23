import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'MainPage',
        component: () => import('pages/MainPage.vue') 
      },
      {
        path: 'search',
        name: 'SearchCourses',
        component: () => import('pages/SearchCourses.vue'),
        props: route => ({ searchQuery: route.query.q })
      },
      {
        path: 'create-course',
        name: 'CreateCourse',
        component: () => import('pages/CreateCourse.vue')
      },],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
