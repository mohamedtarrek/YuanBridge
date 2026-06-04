export interface OrderFormData {
  customer: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber: string;
    telegramUsername: string;
    email: string;
    country: string;
    city: string;
    shippingAddress: string;
    postalCode: string;
  };
  product: {
    url: string;
    name: string;
    variant: string;
    color: string;
    size: string;
    quantity: number;
    notes: string;
  };
  shipping: {
    method: string;
    speed: string;
    notes: string;
  };
  payment: {
    currency: string;
    budget: string;
    method: string;
  };
  additional: {
    requests: string;
    instructions: string;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
