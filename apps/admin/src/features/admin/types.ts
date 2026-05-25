export type AdminProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  location?: string;
  biography?: string;
  role?: string;
};

export type AdminProfilePayload = Partial<AdminProfile>;

export type AdminPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
