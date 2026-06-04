export interface OrderFormData {
  customer: {
    fullName: string;
    mobileNumber: string;
    email: string;
    country: string;
    city: string;
    shippingAddress: string;
  };
  product: {
    url: string;
    name: string;
    quantity: number;
    notes: string;
  };
  shipping: {
    method: string;
    speed: string;
  };
  payment: {
    currency: string;
    method: string;
  };
  additional: {
    notes: string;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
