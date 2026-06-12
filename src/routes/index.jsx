import {createHashRouter} from 'react-router'
import {lazy} from 'react'
import Front from '../layout/Front'
import Back from '../layout/Back'
import guard from './guard'
const Home = lazy(() => import('../pages/front/Home'))
const Login = lazy(() => import('../pages/front/Login'))
const Product = lazy(() => import('../pages/back/Product'))
const ProductList = lazy(() => import('../pages/front/ProductList'))
const ProductDetail = lazy(() => import('../pages/front/ProductDetail'))
const ArticleList = lazy(() => import('../pages/front/ArticleList'))
const ArticleDetail = lazy(() => import('../pages/front/ArticleDetail'))
const Cart = lazy(() => import('../pages/front/Cart'))
const Coupon = lazy(() => import('../pages/back/Coupon'))
const OrderList = lazy(() => import('../pages/front/OrderList'))
const OrderManage = lazy(() => import('../pages/back/Order'))
const Article = lazy(() => import('../pages/back/Article'))
const router = createHashRouter(
    [
        {
            path: '/',
            element: <Front />,
            children: [
                {
                    index: true,
                    element: <Home />
                },
                {
                    path: 'login',
                    element: <Login />
                },
                {
                    path: 'products',
                    element: <ProductList />
                },
                {
                    path: 'product',
                    element: <ProductDetail />
                },
                {
                    path: 'articles',
                    element: <ArticleList />
                },
                {
                    path: 'article',
                    element: <ArticleDetail />
                },
                {
                    path: 'cart',
                    element: <Cart />
                },
                {
                    path: 'orders',
                    element: <OrderList />
                }
            ],
        },
        {
            path: '/admin',
            element: <Back />,
            middleware: [guard],
            children: [
                {
                    path: 'products',
                    element: <Product />
                },
                {
                    path: 'coupons',
                    element: <Coupon />
                },
                {
                    path: 'orders',
                    element: <OrderManage />
                },
                {
                    path: 'articles',
                    element: <Article />
                },
            ],
        },
    ]
)
export default router