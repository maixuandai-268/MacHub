import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireCustomerAuth from "@/features/auth/RequireCustomerAuth";

const StorefrontShell = lazy(() => import("@/app/StorefrontShell"));
const HomePage = lazy(() => import("@/pages/home/HomePage"));
const AboutPage = lazy(() => import("@/pages/about/AboutPage"));
const ContactPage = lazy(() => import("@/pages/contact/ContactPage"));
const BlogPage = lazy(() => import("@/pages/blog/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/blog/BlogDetailPage"));
const ProductsPage = lazy(() => import("@/pages/products/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail/ProductDetailPage"));
const CartPage = lazy(() => import("@/pages/cart/CartPage"));
const WishlistPage = lazy(() => import("@/pages/wishlist/WishlistPage"));
const AddressPage = lazy(() => import("@/pages/checkout/address/AddressPage"));
const ShippingPage = lazy(() => import("@/pages/checkout/shipping/ShippingPage"));
const PaymentPage = lazy(() => import("@/pages/checkout/payment/PaymentPage"));
const PaymentResultPage = lazy(() => import("@/pages/checkout/payment-result/PaymentResultPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const SignInPage = lazy(() => import("@/pages/sign-in/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/sign-up/SignUpPage"));

function withPageLoader(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-20 text-center text-sm text-black/45">
          Loading page...
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: withPageLoader(<SignInPage />),
  },
  {
    path: "/sign-in",
    element: withPageLoader(<SignInPage />),
  },
  {
    path: "/sign-up",
    element: withPageLoader(<SignUpPage />),
  },
  {
    element: withPageLoader(<StorefrontShell />),
    children: [
      { path: "/home", element: withPageLoader(<HomePage />) },
      { path: "/about", element: withPageLoader(<AboutPage />) },
      { path: "/contact", element: withPageLoader(<ContactPage />) },
      { path: "/blog", element: withPageLoader(<BlogPage />) },
      { path: "/blog/:slug", element: withPageLoader(<BlogDetailPage />) },
      { path: "/products", element: withPageLoader(<ProductsPage />) },
      { path: "/products/:slug", element: withPageLoader(<ProductDetailPage />) },
      {
        element: <RequireCustomerAuth />,
        children: [
          { path: "/wishlist", element: withPageLoader(<WishlistPage />) },
          { path: "/cart", element: withPageLoader(<CartPage />) },
          { path: "/checkout/address", element: withPageLoader(<AddressPage />) },
          { path: "/checkout/shipping", element: withPageLoader(<ShippingPage />) },
          { path: "/checkout/payment", element: withPageLoader(<PaymentPage />) },
          { path: "/checkout/payment/result", element: withPageLoader(<PaymentResultPage />) },
          { path: "/profile", element: withPageLoader(<ProfilePage />) },
        ],
      },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);
