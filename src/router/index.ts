import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw 
} from 'vue-router';


const HomePage = () => import('@/pages/HomePage.vue');
const ShowDetailPage = () => import('@/pages/ShowDetailsPage.vue');

const routes: RouteRecordRaw[] = [
  { 
    path: '/', 
    name: 'home', 
    component: HomePage 
  },
  { 
    path: '/shows/:id', 
    name: 'show-detail', 
    component: ShowDetailPage,
    props: true 
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});