export type CustomerStatus = "active" | "inactive" | "vip";

export type CustomerRow = {
  id: string;          
  name: string;
  phone: string;
  orderCount: number;
  totalSpend: number;  
  status: CustomerStatus;
};

export type CustomersKpi = {
  totalCustomers: number;
  totalCustomersChangePct: number;
  newCustomers: number;
  newCustomersChangePct: number;
  visitors: number; 
  visitorsChangePct: number;
};

export type CustomerOverviewMetric = {
  label: string;
  value: string; 
};

export type CustomerOverviewPoint = {
  day: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  value: number;
};
