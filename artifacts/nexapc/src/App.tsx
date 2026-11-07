import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '@/store/cart';
import { ToastProvider } from '@/components/nx/toast';
import { CheckoutLayout, SiteLayout } from '@/components/layout/SiteLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/store/auth';
import { CatalogProvider } from '@/store/catalog';

const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const Terms = lazy(() => import('@/pages/Terms'));
const About = lazy(() => import('@/pages/About'));
const AccountLayout = lazy(() => import('@/pages/account/AccountLayout'));
const Overview = lazy(() => import('@/pages/account/Overview'));
const Profile = lazy(() => import('@/pages/account/Profile'));
const Addresses = lazy(() => import('@/pages/account/Addresses'));
const Orders = lazy(() => import('@/pages/account/Orders'));
const Settings = lazy(() => import('@/pages/account/Settings'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 0 } } });

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <CatalogProvider>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="auth/callback" element={<AuthCallback />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="terms" element={<Terms />} />
              <Route path="about" element={<About />} />
              <Route path="account" element={<AccountLayout />}>
                <Route index element={<Overview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="order-confirmation/:reference" element={<OrderConfirmation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route element={<CheckoutLayout />}>
              <Route path="checkout" element={<Checkout />} />
            </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
      </CatalogProvider>
      </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
