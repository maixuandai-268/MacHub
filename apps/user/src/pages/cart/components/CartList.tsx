import type { CartItem as CartItemType } from "@/features/cart/cart.types";
import CartItem from "./CartItem";

export default function CartList({
  items,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  items: CartItemType[];
  onDecrease: (productId: string, quantity: number) => void;
  onIncrease: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <CartItem
          key={item.productId}
          item={item}
          onDecrease={() => onDecrease(item.productId, item.quantity - 1)}
          onIncrease={() => onIncrease(item.productId, item.quantity + 1)}
          onRemove={() => onRemove(item.productId)}
        />
      ))}
    </div>
  );
}
