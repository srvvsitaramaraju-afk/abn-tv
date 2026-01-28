import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw 
} from 'vue-router';

const HomePage = () => import('@/pages/HomePage.vue');
const ShowDetailPage = () => import('@/pages/ShowDetailsPage.vue');
const GenreDetailPage = () => import('@/pages/GenreDetail.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue'); 

const routes: RouteRecordRaw[] = [
  { 
    path: '/', 
    name: 'home', 
    component: HomePage,
    meta: { showSearch: true }
  },
  { 
    path: '/shows/:id', 
    name: 'show-detail', 
    component: ShowDetailPage,
    props: true,
    meta: { showSearch: false }
  },
  {
    path: '/genre/:genre',
    name: 'genre',
    component: GenreDetailPage,
    meta: { showSearch: true }
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: 'not-found', 
    component: NotFoundPage 
  },
];

export const router = createRouter({
  history: createWebHistory('/abn-tv/'),  
  routes
});
