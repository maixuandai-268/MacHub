import type { ShippingMethod, ShippingMethodId } from "@/features/cart/cart.types";
import ShippingMethodItem from "./ShippingMethodItem";

export default function ShippingMethodList({
  methods,
  selectedMethodId,
  onSelect,
}: {
  methods: ShippingMethod[];
  selectedMethodId: ShippingMethodId;
  onSelect: (methodId: ShippingMethodId) => void;
}) {
  return (
    <div className="space-y-5">
      {methods.map((method) => (
        <ShippingMethodItem
          key={method.id}
          method={method}
          checked={selectedMethodId === method.id}
          onSelect={() => onSelect(method.id)}
        />
      ))}
    </div>
  );
}
