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
        path: 'test/:blockName/:testId',
        name: 'TestPage',
        component: () => import('pages/TestPage.vue'),
        props: true // Передаёт параметры маршрута как props
      },
       {
        path: 'edit/:blockName/:testId',
        name: 'TestEditor',
        component: () => import('pages/TestEditor.vue'),
        props: true // Передаёт параметры маршрута как props
      },
      {
        path: 'edit-course',
        name: 'EditCourse',
        component: () => import('pages/EditCourse.vue')
      },
      {
        path: 'create-course',
        name: 'CreateCourse',
        component: () => import('pages/CreateCourse.vue')
      },
     {
        path: 'create-block/:editblock/:block',
        name: 'InfoBlock',
        component: () => import('pages/CreateInfoBlock.vue'),
        props:true
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
