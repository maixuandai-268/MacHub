import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredCustomerAuth,
  getCustomerAccessToken,
  getCustomerAuthEventName,
  getStoredCustomer,
  patchStoredCustomerAuth,
  setStoredCustomerAuth,
} from "./auth.storage";
import {
  deleteMyAddress,
  getCurrentCustomer,
  getMyOrders,
  getMyProfile,
  loginCustomer,
  logoutCustomer,
  refreshCustomerAccessToken,
  registerCustomer,
  saveMyAddress,
  updateMyProfile,
} from "./auth.service";
import type {
  CustomerAddressPayload,
  CustomerOrder,
  CustomerProfilePayload,
  CustomerSession,
} from "./auth.types";

type AuthContextValue = {
  customer: CustomerSession | null;
  orders: CustomerOrder[];
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  recoverSession: () => Promise<boolean>;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: CustomerProfilePayload) => Promise<void>;
  saveAddress: (payload: CustomerAddressPayload) => Promise<string>;
  deleteAddress: (addressId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(() => getStoredCustomer());
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const syncFromStorage = useCallback(() => {
    setCustomer(getStoredCustomer());
  }, []);

  const refreshProfile = useCallback(async () => {
    const [profile, nextOrders] = await Promise.all([getMyProfile(), getMyOrders()]);
    patchStoredCustomerAuth({ customer: profile });
    setCustomer(profile);
    setOrders(nextOrders);
  }, []);

  const recoverSession = useCallback(async () => {
    try {
      const token = getCustomerAccessToken();

      if (token) {
        try {
          const current = await getCurrentCustomer();
          patchStoredCustomerAuth({ customer: current });
          setCustomer(current);
          const nextOrders = await getMyOrders();
          setOrders(nextOrders);
          return true;
        } catch {
          // Fall through to refresh-token recovery.
        }
      }

      const refreshed = await refreshCustomerAccessToken();
      setStoredCustomerAuth({ customer: refreshed.customer, accessToken: refreshed.accessToken });
      setCustomer(refreshed.customer);
      const nextOrders = await getMyOrders();
      setOrders(nextOrders);
      return true;
    } catch {
      clearStoredCustomerAuth();
      setCustomer(null);
      setOrders([]);
      return false;
    }
  }, []);

  useEffect(() => {
    const eventName = getCustomerAuthEventName();
    window.addEventListener(eventName, syncFromStorage);
    return () => window.removeEventListener(eventName, syncFromStorage);
  }, [syncFromStorage]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const restored = await recoverSession();
        if (!cancelled && !restored) {
          setCustomer(null);
          setOrders([]);
        }
      } catch {
        if (!cancelled) {
          clearStoredCustomerAuth();
          setCustomer(null);
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (payload: { email: string; password: string }) => {
    const session = await loginCustomer(payload);
    setStoredCustomerAuth({ customer: session.customer, accessToken: session.accessToken });
    setCustomer(session.customer);
    const nextOrders = await getMyOrders();
    setOrders(nextOrders);
  }, []);

  const signUp = useCallback(async (payload: { name: string; email: string; phone: string; password: string }) => {
    await registerCustomer(payload);
    try {
      await logoutCustomer();
    } catch {
      // Ignore logout cleanup failures after successful registration.
    }
    clearStoredCustomerAuth();
    setCustomer(null);
    setOrders([]);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      clearStoredCustomerAuth();
      setCustomer(null);
      setOrders([]);
    }
  }, []);

  const updateProfile = useCallback(async (payload: CustomerProfilePayload) => {
    const profile = await updateMyProfile(payload);
    patchStoredCustomerAuth({ customer: profile });
    setCustomer(profile);
  }, []);

  const saveAddress = useCallback(async (payload: CustomerAddressPayload) => {
    const normalizedId = String(payload.id || "").trim();
    const shouldUpdateExistingAddress =
      !!normalizedId && !!customer?.addresses.some((address) => address.id === normalizedId);

    const response = await saveMyAddress({
      ...payload,
      id: shouldUpdateExistingAddress ? normalizedId : undefined,
    });
    patchStoredCustomerAuth({ customer: response.customer });
    setCustomer(response.customer);
    return response.addressId;
  }, [customer]);

  const deleteAddress = useCallback(async (addressId: string) => {
    const profile = await deleteMyAddress(addressId);
    patchStoredCustomerAuth({ customer: profile });
    setCustomer(profile);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      orders,
      isAuthenticated: !!customer,
      isBootstrapping,
      recoverSession,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
      saveAddress,
      deleteAddress,
    }),
    [customer, deleteAddress, isBootstrapping, orders, recoverSession, refreshProfile, saveAddress, signIn, signOut, signUp, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
