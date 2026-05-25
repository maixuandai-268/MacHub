import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import { useAuth } from "@/features/auth/auth.context";
import type {
  CartItem,
  CheckoutAddress,
  CheckoutState,
  PaymentMethod,
  ShippingMethod,
  ShippingMethodId,
  WishlistItem,
} from "./cart.types";

const CART_STORAGE_KEY = "cybershop_user_cart";
const CHECKOUT_STORAGE_KEY = "cybershop_user_checkout";
const WISHLIST_STORAGE_KEY = "cybershop_user_wishlist";
const DEFAULT_PAYMENT_METHOD: PaymentMethod = "vnpay";

function formatEtaDate(daysFromNow: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysFromNow);

  return targetDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildShippingMethods(): ShippingMethod[] {
  return [
    {
      id: "free",
      label: "Free",
      description: "Standard delivery / 0 VND",
      price: 0,
      etaLabel: formatEtaDate(4),
    },
    {
      id: "express",
      label: "Express",
      description: "Fast delivery / 8,500 VND",
      price: 8500,
      etaLabel: formatEtaDate(1),
    },
    {
      id: "schedule",
      label: "Schedule",
      description: "Choose a delivery date / 29,000 VND",
      price: 29000,
      etaLabel: "Select date",
    },
  ];
}

type CartNotification = {
  id: number;
  type: "cart" | "wishlist" | "order" | "stock";
  action: "added" | "removed" | "placed" | "limited";
  name: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  wishlist: WishlistItem[];
  checkout: CheckoutState;
  shippingMethods: ShippingMethod[];
  notification: CartNotification | null;
  itemCount: number;
  wishlistCount: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  addItem: (product: CatalogProduct, quantity?: number) => void;
  toggleWishlist: (product: CatalogProduct) => void;
  isInWishlist: (productId: string, slug?: string) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  selectAddress: (addressId: string) => void;
  saveAddress: (address: CheckoutAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setShippingMethod: (methodId: ShippingMethodId) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setSameAsBilling: (value: boolean) => void;
  showOrderSuccess: (orderCode: string) => void;
  clearNotification: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildCheckoutState(addresses: CheckoutAddress[]): CheckoutState {
  return {
    addresses,
    selectedAddressId: addresses.find((item) => item.isDefault)?.id || addresses[0]?.id || "",
    shippingMethodId: "free",
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    sameAsBilling: true,
  };
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "vnpay" || value === "cod";
}

function normalizeAddresses(
  customer: ReturnType<typeof useAuth>["customer"]
): CheckoutAddress[] {
  if (!customer?.addresses?.length) return [];

  return customer.addresses.map((address) => ({
    id: address.id,
    label: address.label || (address.isDefault ? "HOME" : "OFFICE"),
    fullName: address.fullName,
    email: customer.email,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    ward: address.ward,
    district: address.district,
    city: address.city,
    country: address.country,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    customer,
    isAuthenticated,
    saveAddress: saveCustomerAddress,
    deleteAddress: deleteCustomerAddress,
  } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [checkout, setCheckout] = useState<CheckoutState>(buildCheckoutState([]));
  const [notification, setNotification] = useState<CartNotification | null>(null);
  const shippingMethods = useMemo(() => buildShippingMethods(), []);

  const cartKey = customer ? `${CART_STORAGE_KEY}:${customer.id}` : "";
  const wishlistKey = customer ? `${WISHLIST_STORAGE_KEY}:${customer.id}` : "";
  const checkoutKey = customer ? `${CHECKOUT_STORAGE_KEY}:${customer.id}` : "";

  useEffect(() => {
    if (!customer || !isAuthenticated) {
      setItems([]);
      setWishlist([]);
      setCheckout(buildCheckoutState([]));
      setNotification(null);
      return;
    }

    const normalizedAddresses = normalizeAddresses(customer);
    const savedCheckout = readStorage<
      Pick<CheckoutState, "selectedAddressId" | "shippingMethodId" | "paymentMethod" | "sameAsBilling">
    >(checkoutKey, {
      selectedAddressId: "",
      shippingMethodId: "free",
      paymentMethod: DEFAULT_PAYMENT_METHOD,
      sameAsBilling: true,
    });
    const fallbackSelectedAddressId =
      normalizedAddresses.find((item) => item.isDefault)?.id || normalizedAddresses[0]?.id || "";

    setItems(readStorage(cartKey, []));
    setWishlist(readStorage(wishlistKey, []));
    setCheckout({
      addresses: normalizedAddresses,
      selectedAddressId: normalizedAddresses.some((item) => item.id === savedCheckout.selectedAddressId)
        ? savedCheckout.selectedAddressId
        : fallbackSelectedAddressId,
      shippingMethodId: savedCheckout.shippingMethodId,
      paymentMethod: isPaymentMethod(savedCheckout.paymentMethod)
        ? savedCheckout.paymentMethod
        : DEFAULT_PAYMENT_METHOD,
      sameAsBilling: savedCheckout.sameAsBilling,
    });
  }, [cartKey, checkoutKey, customer, isAuthenticated, wishlistKey]);

  useEffect(() => {
    if (!cartKey || !isAuthenticated) return;
    window.localStorage.setItem(cartKey, JSON.stringify(items));
  }, [cartKey, isAuthenticated, items]);

  useEffect(() => {
    if (!wishlistKey || !isAuthenticated) return;
    window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  }, [isAuthenticated, wishlist, wishlistKey]);

  useEffect(() => {
    if (!checkoutKey || !isAuthenticated) return;
    window.localStorage.setItem(
      checkoutKey,
      JSON.stringify({
        selectedAddressId: checkout.selectedAddressId,
        shippingMethodId: checkout.shippingMethodId,
        paymentMethod: checkout.paymentMethod,
        sameAsBilling: checkout.sameAsBilling,
      })
    );
  }, [checkout, checkoutKey, isAuthenticated]);

  const addItem = useCallback(
    (product: CatalogProduct, quantity = 1) => {
      if (!isAuthenticated) return;

      if (product.stock <= 0) {
        setNotification({
          id: Date.now(),
          type: "stock",
          action: "limited",
          name: `${product.name} is out of stock`,
          quantity: 0,
        });
        return;
      }

      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
          const addedQuantity = nextQuantity - existing.quantity;

          if (addedQuantity <= 0) {
            setNotification({
              id: Date.now(),
              type: "stock",
              action: "limited",
              name: `${product.name} reached available stock`,
              quantity: product.stock,
            });
            return current;
          }

          setNotification({
            id: Date.now(),
            type: "cart",
            action: "added",
            name: product.name,
            quantity: addedQuantity,
          });

          return current.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: nextQuantity }
              : item
          );
        }

        const initialQuantity = Math.min(quantity, product.stock);

        setNotification({
          id: Date.now(),
          type: "cart",
          action: "added",
          name: product.name,
          quantity: initialQuantity,
        });

        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            sku: product.sku,
            name: product.name,
            image: product.image,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            quantity: initialQuantity,
            categoryName: product.category?.name || "Catalog",
          },
        ];
      });
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback(
    (product: CatalogProduct) => {
      if (!isAuthenticated) return;

      setWishlist((current) => {
        const exists = current.some((item) => item.productId === product.id || item.slug === product.slug);

        setNotification({
          id: Date.now(),
          type: "wishlist",
          action: exists ? "removed" : "added",
          name: product.name,
          quantity: 1,
        });

        if (exists) {
          return current.filter((item) => item.productId !== product.id && item.slug !== product.slug);
        }

        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            sku: product.sku,
            name: product.name,
            image: product.image,
            price: product.price,
            categoryName: product.category?.name || "Catalog",
          },
        ];
      });
    },
    [isAuthenticated]
  );

  const isInWishlist = useCallback(
    (productId: string, slug = "") => {
      if (!isAuthenticated) return false;
      return wishlist.some((item) => item.productId === productId || (slug && item.slug === slug));
    },
    [isAuthenticated, wishlist]
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const selectAddress = useCallback((addressId: string) => {
    setCheckout((current) => ({ ...current, selectedAddressId: addressId }));
  }, []);

  const saveAddress = useCallback(
    async (address: CheckoutAddress) => {
      if (!isAuthenticated) return;

      const nextAddressId = await saveCustomerAddress({
        id: address.id || undefined,
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        ward: address.ward,
        district: address.district,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });

      setCheckout((current) => ({
        ...current,
        selectedAddressId: nextAddressId || current.selectedAddressId,
      }));
    },
    [isAuthenticated, saveCustomerAddress]
  );

  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!isAuthenticated) return;
      await deleteCustomerAddress(addressId);
    },
    [deleteCustomerAddress, isAuthenticated]
  );

  const setShippingMethod = useCallback((methodId: ShippingMethodId) => {
    setCheckout((current) => ({ ...current, shippingMethodId: methodId }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setCheckout((current) => ({ ...current, paymentMethod: method }));
  }, []);

  const setSameAsBilling = useCallback((value: boolean) => {
    setCheckout((current) => ({ ...current, sameAsBilling: value }));
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showOrderSuccess = useCallback((orderCode: string) => {
    setNotification({
      id: Date.now(),
      type: "order",
      action: "placed",
      name: `Order ${orderCode}`,
      quantity: 1,
    });
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const wishlistCount = wishlist.length;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shippingFee = shippingMethods.find((item) => item.id === checkout.shippingMethodId)?.price || 0;
  const tax = Math.round(subtotal * 0.0213);
  const total = subtotal + shippingFee + tax;

  const value = useMemo(
    () => ({
      items,
      wishlist,
      checkout,
      shippingMethods,
      notification,
      itemCount,
      wishlistCount,
      subtotal,
      shippingFee,
      tax,
      total,
      addItem,
      toggleWishlist,
      isInWishlist,
      updateQuantity,
      removeItem,
      clearCart,
      selectAddress,
      saveAddress,
      deleteAddress,
      setShippingMethod,
      setPaymentMethod,
      setSameAsBilling,
      showOrderSuccess,
      clearNotification,
    }),
    [
      addItem,
      checkout,
      clearCart,
      clearNotification,
      deleteAddress,
      isInWishlist,
      itemCount,
      items,
      notification,
      removeItem,
      saveAddress,
      selectAddress,
      setPaymentMethod,
      setSameAsBilling,
      setShippingMethod,
      showOrderSuccess,
      shippingFee,
      subtotal,
      tax,
      toggleWishlist,
      total,
      updateQuantity,
      wishlist,
      wishlistCount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

