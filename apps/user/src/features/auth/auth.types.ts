export type CustomerAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

export type CustomerSession = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalSpend: number;
  orderCount: number;
  addresses: CustomerAddress[];
  isRegistered: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  customer: CustomerSession;
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
};

export type CustomerOrder = {
  id: string;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CustomerProfilePayload = {
  name: string;
  email: string;
  phone: string;
};

export type CustomerAddressPayload = {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};
