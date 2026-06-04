export interface OrderFormData {
  customer: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber: string;
    country: string;
  };
  product: {
    url: string;
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
