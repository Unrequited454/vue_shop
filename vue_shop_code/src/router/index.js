import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import( /* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Home = () => import( /* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import( /* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

const Users = () => import( /* webpackChunkName: "users" */ '../components/users/Users')

const Rights = () => import( /* webpackChunkName: "rights_roles" */ '../components/rights/Rights')
const Roles = () => import( /* webpackChunkName: "rights_roles" */ '../components/rights/Roles')

const Categories = () => import( /* webpackChunkName: "Categories_Params_Goods_AddGood" */ '../components/category/categories')
const Params = () => import( /* webpackChunkName: "Categories_Params_Goods_AddGood" */ '../components/category/params')
const Goods = () => import( /* webpackChunkName: "Categories_Params_Goods_AddGood" */ '../components/category/goods')
const AddGood = () => import( /* webpackChunkName: "Categories_Params_Goods_AddGood" */ '../components/category/add')

const Orders = () => import( /* webpackChunkName: "Orders" */ '../components/order/orders')

const Reports = () => import( /* webpackChunkName: "Reports" */ '../components/report/reports')

Vue.use(VueRouter);

const routes = [{
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/add',
        component: AddGood
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      },
    ]
  }
]

const router = new VueRouter({
  routes
})
// TODO:路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next();
  }
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login');
  }
  next();
});
export default router
