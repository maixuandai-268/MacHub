import { CartProvider } from "@/features/cart/cart.context";
import MainLayout from "@/components/layout/MainLayout";

export default function StorefrontShell() {
  return (
    <CartProvider>
      <MainLayout />
    </CartProvider>
  );
}
